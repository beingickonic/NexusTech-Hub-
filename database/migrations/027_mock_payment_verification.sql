-- ============================================================
-- MIGRATION 027: Mock Payment Verification & Invoice System
-- Dev-mode payment codes -> PAID + invoice -> Pending Finance Approval
-- ============================================================

-- 1. Fix orders_status_check: accept canonical spec statuses case-insensitively
DO $$
BEGIN
  ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'orders_status_check drop skipped: %', SQLERRM;
END $$;

ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (
  UPPER(status) IN (
    'PENDING',
    'PENDING PAYMENT',
    'AWAITING PAYMENT',
    'PAID',
    'PENDING PAYMENT VERIFICATION',
    'PAYMENT FAILED',
    'PAYMENT VERIFIED',
    'PENDING FINANCE APPROVAL',
    'FINANCE APPROVED',
    'WAITING FOR STOCK',
    'STOCK RESERVED',
    'RESERVED',
    'READY FOR PICKING',
    'PICKING',
    'PACKING',
    'READY FOR DISPATCH',
    'ASSIGNED',
    'OUT FOR DELIVERY',
    'DELIVERED',
    'CUSTOMER CONFIRMED',
    'COMPLETED',
    'CANCELLED',
    'REJECTED',
    'REFUNDED',
    'RETURNED'
  )
);

-- 2. payments: add mock-verification columns
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(100);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS verification_code VARCHAR(50);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100);
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES public.profiles(id);

-- payments.provider must accept the mock method
ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_provider_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_provider_check CHECK (
  provider IN ('mpesa', 'flutterwave', 'paypal', 'stripe', 'cash', 'Mock Mobile Money')
);

-- 3. invoices: add mock-payment / display columns (base table only has id, invoice_number, order_id, created_at)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(100);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS shipping_postal_code VARCHAR(20);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS order_date TIMESTAMPTZ;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS verification_code VARCHAR(50);
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tax NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS total_amount NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'UNPAID';
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS finance_status VARCHAR(50) DEFAULT 'Pending Approval';

-- 4. Core RPC: verify a mock payment for an order (atomic, SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.verify_mock_payment(
  p_order_id UUID,
  p_verification_code TEXT
) RETURNS JSONB AS $$
DECLARE
  v_order public.orders%ROWTYPE;
  v_txn TEXT;
  v_receipt TEXT;
  v_inv_number TEXT;
  v_payment_id UUID;
  v_invoice_id UUID;
  v_user_id UUID;
  v_subtotal NUMERIC;
  v_date TEXT;
  v_customer_name TEXT;
  v_customer_email TEXT;
  v_customer_phone TEXT;
BEGIN
  IF p_verification_code IS NULL OR UPPER(TRIM(p_verification_code)) NOT IN ('123456', '111111', '999999', 'NEXUS123', 'TESTPAY') THEN
    RAISE EXCEPTION 'INVALID_VERIFICATION_CODE';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id AND user_id = auth.uid();
  IF NOT FOUND THEN
    RAISE EXCEPTION 'ORDER_NOT_FOUND';
  END IF;

  IF UPPER(v_order.status) IN ('PENDING FINANCE APPROVAL', 'FINANCE APPROVED', 'RESERVED', 'READY FOR PICKING', 'PICKING', 'PACKING', 'READY FOR DISPATCH', 'ASSIGNED', 'OUT FOR DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED', 'REJECTED', 'REFUNDED', 'RETURNED') THEN
    RAISE EXCEPTION 'ORDER_ALREADY_PROCESSED';
  END IF;

  v_user_id := v_order.user_id;
  v_date := TO_CHAR(NOW(), 'YYYYMMDD');

  v_txn := 'TXN-' || v_date || '-' || UPPER(SUBSTR(REPLACE(MD5(RANDOM()::TEXT), '-', ''), 1, 4));
  v_receipt := 'RCT-' || UPPER(SUBSTR(REPLACE(MD5(RANDOM()::TEXT), '-', ''), 1, 6));
  v_inv_number := 'INV-' || v_date || '-' || UPPER(SUBSTR(REPLACE(MD5(RANDOM()::TEXT), '-', ''), 1, 4));

  SELECT COALESCE(SUM(price * quantity), 0) INTO v_subtotal
  FROM public.order_items WHERE order_id = p_order_id;

  SELECT COALESCE(full_name, 'Valued Customer'), COALESCE(phone, '')
  INTO v_customer_name, v_customer_phone
  FROM public.profiles WHERE id = v_user_id;

  v_customer_email := COALESCE(auth.jwt()->>'email', '');

  INSERT INTO public.payments (
    order_id, user_id, amount, provider, currency, transaction_reference, status,
    transaction_id, receipt_number, verification_code, payment_method, paid_at
  ) VALUES (
    p_order_id, v_user_id, v_order.total_amount, 'Mock Mobile Money', 'KES', v_txn, 'paid',
    v_txn, v_receipt, UPPER(TRIM(p_verification_code)), 'Mock Mobile Money', NOW()
  ) RETURNING id INTO v_payment_id;

  UPDATE public.orders
    SET status = 'Pending Finance Approval',
        payment_status = 'paid',
        payment_method = 'Mock Mobile Money'
  WHERE id = p_order_id;

  INSERT INTO public.invoices (
    invoice_number, order_id, user_id, transaction_id, receipt_number,
    customer_name, customer_email, customer_phone,
    shipping_address, shipping_city, shipping_postal_code,
    order_date, payment_date, payment_method, verification_code,
    subtotal, shipping_fee, tax, total_amount, payment_status, finance_status
  ) VALUES (
    v_inv_number, p_order_id, v_user_id, v_txn, v_receipt,
    COALESCE(v_order.shipping_name, v_customer_name), v_customer_email, COALESCE(v_order.shipping_phone, v_customer_phone),
    v_order.shipping_address, v_order.shipping_city, v_order.shipping_postal_code,
    v_order.created_at, NOW(), 'Mock Mobile Money', UPPER(TRIM(p_verification_code)),
    v_subtotal, 0, 0, v_order.total_amount, 'PAID', 'Pending Approval'
  ) RETURNING id INTO v_invoice_id;

  -- Notify customer that an invoice was generated (status-change notifications handled by 024 trigger)
  PERFORM public.send_notification(
    v_user_id,
    'Invoice Generated',
    'Your invoice ' || v_inv_number || ' has been generated for transaction ' || v_txn || '. Awaiting finance approval.',
    'info', 'invoice', v_invoice_id
  );

  PERFORM public.log_audit_event(
    v_user_id, 'payment_verified', 'order', p_order_id,
    v_order.status, 'Pending Finance Approval',
    NULL, NULL,
    jsonb_build_object(
      'payment_id', v_payment_id,
      'transaction_id', v_txn,
      'receipt_number', v_receipt,
      'invoice_number', v_inv_number,
      'verification_code', UPPER(TRIM(p_verification_code))
    )
  );

  RETURN jsonb_build_object(
    'payment_id', v_payment_id,
    'order_id', p_order_id,
    'invoice_id', v_invoice_id,
    'transaction_id', v_txn,
    'receipt_number', v_receipt,
    'invoice_number', v_inv_number,
    'amount', v_order.total_amount,
    'status', 'paid',
    'payment_status', 'paid'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC: fetch the invoice for an order (RLS-safe via definer, returns customer-owned only)
CREATE OR REPLACE FUNCTION public.get_order_invoice(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_invoice RECORD;
  v_items JSONB;
BEGIN
  SELECT * INTO v_invoice FROM public.invoices WHERE order_id = p_order_id ORDER BY created_at DESC LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'INVOICE_NOT_FOUND';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.orders WHERE id = p_order_id AND user_id = auth.uid())
     AND (SELECT get_my_role()) NOT IN ('Admin', 'Manager', 'Finance_Officer', 'super_admin', 'Finance_Director', 'Finance_Manager', 'Accountant', 'Auditor') THEN
    RAISE EXCEPTION 'NOT_ALLOWED';
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'product_name', COALESCE(p.title, 'Unknown Product'),
    'quantity', oi.quantity,
    'price', oi.price,
    'line_total', oi.price * oi.quantity
  ) ORDER BY oi.id), '[]'::jsonb) INTO v_items
  FROM public.order_items oi
  LEFT JOIN public.products p ON p.id = oi.product_id
  WHERE oi.order_id = p_order_id;

  RETURN jsonb_build_object(
    'id', v_invoice.id,
    'invoice_number', v_invoice.invoice_number,
    'order_id', v_invoice.order_id,
    'transaction_id', v_invoice.transaction_id,
    'receipt_number', v_invoice.receipt_number,
    'customer_name', v_invoice.customer_name,
    'customer_email', v_invoice.customer_email,
    'customer_phone', v_invoice.customer_phone,
    'shipping_address', v_invoice.shipping_address,
    'shipping_city', v_invoice.shipping_city,
    'shipping_postal_code', v_invoice.shipping_postal_code,
    'order_date', v_invoice.order_date,
    'payment_date', v_invoice.payment_date,
    'payment_method', v_invoice.payment_method,
    'verification_code', v_invoice.verification_code,
    'subtotal', v_invoice.subtotal,
    'shipping_fee', v_invoice.shipping_fee,
    'tax', v_invoice.tax,
    'total_amount', v_invoice.total_amount,
    'payment_status', v_invoice.payment_status,
    'finance_status', v_invoice.finance_status,
    'created_at', v_invoice.created_at,
    'items', v_items
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
