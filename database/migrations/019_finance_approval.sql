-- ============================================================
-- MIGRATION 019: Finance Approval Portal
-- Adds finance approval step between Paid and inventory flow
-- ============================================================

-- 1. Add new statuses to the CHECK constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;

UPDATE public.orders SET status = 'Pending Finance Approval'
WHERE status = 'Paid' AND (payment_status = 'paid' OR payment_status IS NULL);

ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN (
    'Pending',
    'Awaiting Payment',
    'Paid',
    'Pending Finance Approval',
    'Finance Approved',
    'Waiting for Stock',
    'Reserved',
    'Picking',
    'Packing',
    'Ready for Dispatch',
    'Assigned',
    'Out for Delivery',
    'Delivered',
    'Completed',
    'Cancelled',
    'Refunded',
    'Pending Payment Verification',
    'Payment Failed'
  ));

-- 2. Add finance approval columns to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS finance_status VARCHAR(20) DEFAULT 'pending'
  CHECK (finance_status IN ('pending', 'approved', 'rejected', 'investigation'));
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS finance_approved_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS finance_approved_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS finance_notes TEXT;

-- 3. Create finance_approvals audit table
CREATE TABLE IF NOT EXISTS public.finance_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected', 'investigation')),
  handled_by UUID NOT NULL REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_finance_approvals_order_id ON public.finance_approvals(order_id);
CREATE INDEX IF NOT EXISTS idx_finance_approvals_handled_by ON public.finance_approvals(handled_by);

ALTER TABLE public.finance_approvals ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'finance_approvals' AND policyname = 'Finance can manage approvals'
  ) THEN
    CREATE POLICY "Finance can manage approvals" ON public.finance_approvals
      FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'super_admin', 'Manager', 'Finance_Officer'))
      );
  END IF;
END $$;

-- 4. RPC: finance_approve_order
CREATE OR REPLACE FUNCTION public.finance_approve_order(p_order_id UUID, p_officer_id UUID, p_notes TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF v_order.status NOT IN ('Pending Finance Approval', 'Paid') THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Order must be in Pending Finance Approval status');
  END IF;

  UPDATE public.orders
  SET status = 'Finance Approved',
      finance_status = 'approved',
      finance_approved_at = NOW(),
      finance_approved_by = p_officer_id,
      finance_notes = COALESCE(p_notes, finance_notes),
      updated_at = NOW()
  WHERE id = p_order_id;

  INSERT INTO public.finance_approvals (order_id, action, handled_by, notes)
  VALUES (p_order_id, 'approved', p_officer_id, p_notes);

  RETURN jsonb_build_object('success', TRUE, 'status', 'Finance Approved');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC: finance_reject_order
CREATE OR REPLACE FUNCTION public.finance_reject_order(p_order_id UUID, p_officer_id UUID, p_notes TEXT)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF v_order.status NOT IN ('Pending Finance Approval', 'Paid') THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Order must be in Pending Finance Approval status');
  END IF;

  UPDATE public.orders
  SET status = 'Cancelled',
      finance_status = 'rejected',
      finance_approved_at = NOW(),
      finance_approved_by = p_officer_id,
      finance_notes = p_notes,
      updated_at = NOW()
  WHERE id = p_order_id;

  INSERT INTO public.finance_approvals (order_id, action, handled_by, notes)
  VALUES (p_order_id, 'rejected', p_officer_id, p_notes);

  RETURN jsonb_build_object('success', TRUE, 'status', 'Cancelled');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RPC: finance_investigate_order
CREATE OR REPLACE FUNCTION public.finance_investigate_order(p_order_id UUID, p_officer_id UUID, p_notes TEXT)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF v_order.status NOT IN ('Pending Finance Approval', 'Paid') THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Order must be in Pending Finance Approval status');
  END IF;

  UPDATE public.orders
  SET finance_status = 'investigation',
      finance_notes = p_notes,
      updated_at = NOW()
  WHERE id = p_order_id;

  INSERT INTO public.finance_approvals (order_id, action, handled_by, notes)
  VALUES (p_order_id, 'investigation', p_officer_id, p_notes);

  RETURN jsonb_build_object('success', TRUE, 'status', 'investigation');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Update process_mpesa_callback to set Pending Finance Approval
CREATE OR REPLACE FUNCTION process_mpesa_callback(
  p_checkout_request_id VARCHAR,
  p_merchant_request_id VARCHAR,
  p_result_code INT,
  p_result_desc TEXT,
  p_amount NUMERIC,
  p_receipt VARCHAR,
  p_phone VARCHAR,
  p_raw_payload JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment RECORD;
  v_order RECORD;
  v_item RECORD;
  v_callback_id UUID;
  v_is_success BOOLEAN;
  v_payment_status VARCHAR;
BEGIN
  v_is_success := (p_result_code = 0);
  v_payment_status := CASE WHEN v_is_success THEN 'paid' ELSE 'failed' END;

  IF EXISTS (SELECT 1 FROM public.payment_callbacks WHERE checkout_request_id = p_checkout_request_id AND processed = true) THEN
    INSERT INTO public.payment_logs (event_type, provider, description, payload)
    VALUES ('duplicate_callback_ignored', 'mpesa', 'Ignored duplicate callback for ' || p_checkout_request_id, p_raw_payload);
    RETURN jsonb_build_object('success', true, 'message', 'Duplicate callback ignored');
  END IF;

  SELECT * INTO v_payment FROM public.payments WHERE transaction_reference = p_checkout_request_id FOR UPDATE;

  IF v_payment IS NULL THEN
    INSERT INTO public.payment_callbacks (checkout_request_id, merchant_request_id, result_code, result_desc, raw_payload, processed)
    VALUES (p_checkout_request_id, p_merchant_request_id, p_result_code, p_result_desc, p_raw_payload, true);
    RETURN jsonb_build_object('success', false, 'error', 'Payment intent not found for reference ' || p_checkout_request_id);
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = v_payment.order_id FOR UPDATE;

  INSERT INTO public.payment_callbacks (
    payment_id, checkout_request_id, merchant_request_id, result_code, result_desc, amount, mpesa_receipt, phone_number, raw_payload, processed
  ) VALUES (
    v_payment.id, p_checkout_request_id, p_merchant_request_id, p_result_code, p_result_desc, p_amount, p_receipt, p_phone, p_raw_payload, true
  )
  ON CONFLICT (checkout_request_id) DO UPDATE SET
    merchant_request_id = EXCLUDED.merchant_request_id,
    result_code = EXCLUDED.result_code,
    result_desc = EXCLUDED.result_desc,
    amount = EXCLUDED.amount,
    mpesa_receipt = EXCLUDED.mpesa_receipt,
    phone_number = EXCLUDED.phone_number,
    raw_payload = EXCLUDED.raw_payload,
    processed = true
  RETURNING id INTO v_callback_id;

  UPDATE public.payments SET status = v_payment_status, updated_at = NOW() WHERE id = v_payment.id;

  -- Set Pending Finance Approval so finance officer must approve before inventory flow
  UPDATE public.orders
  SET
    payment_status = v_payment_status,
    status = CASE WHEN v_is_success THEN 'Pending Finance Approval' ELSE status END
  WHERE id = v_order.id;

  IF v_is_success THEN
    FOR v_item IN (SELECT product_id, quantity FROM public.order_items WHERE order_id = v_order.id) LOOP
      INSERT INTO public.inventory_logs (product_id, order_id, change_amount, reason, notes)
      VALUES (v_item.product_id, v_order.id, -v_item.quantity, 'sale', 'M-Pesa payment verified');

      UPDATE public.products
      SET stock = GREATEST(0, stock - v_item.quantity)
      WHERE id = v_item.product_id;
    END LOOP;

    IF v_payment.user_id IS NOT NULL THEN
      INSERT INTO public.notifications (user_id, title, message, type)
      VALUES (v_payment.user_id, 'Payment Received', 'Your payment of KES ' || p_amount || ' has been received and is awaiting finance approval.', 'success');
    END IF;
  END IF;

  RETURN jsonb_build_object('success', true, 'message', 'Callback processed idempotently');
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO public.payment_logs (event_type, description, payload)
    VALUES ('callback_processing_error', SQLERRM, p_raw_payload);
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 8. Update manual payment verification to use Pending Finance Approval
CREATE OR REPLACE FUNCTION public.verify_manual_payment(p_payment_id UUID, p_order_id UUID, p_officer_id UUID, p_approved BOOLEAN)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF p_approved THEN
    UPDATE public.payments SET status = 'paid', updated_at = NOW() WHERE id = p_payment_id;

    UPDATE public.orders
    SET status = 'Pending Finance Approval',
        payment_status = 'paid',
        updated_at = NOW()
    WHERE id = p_order_id;

    INSERT INTO public.finance_approvals (order_id, action, handled_by, notes)
    VALUES (p_order_id, 'approved', p_officer_id, 'Manual payment verified');
  ELSE
    UPDATE public.payments SET status = 'rejected', updated_at = NOW() WHERE id = p_payment_id;

    UPDATE public.orders
    SET status = 'Payment Failed',
        payment_status = 'unpaid',
        updated_at = NOW()
    WHERE id = p_order_id;
  END IF;

  RETURN jsonb_build_object('success', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Enable realtime for finance_approvals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'finance_approvals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.finance_approvals;
  END IF;
END $$;
