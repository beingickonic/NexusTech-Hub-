-- 027b: FIX verify_mock_payment (profiles has no 'email' column; use auth.jwt)
-- Run this whole file in the Supabase SQL Editor.
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
