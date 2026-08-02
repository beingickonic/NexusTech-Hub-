-- ============================================================
-- MIGRATION 033: Dispatch Handoff Fixes
--
-- Goals (all discovered via live-DB probes):
--   1. inventory_approve_order must allow RETRY on orders stuck at
--      "Waiting for Stock" (currently errors "must be Finance Approved"),
--      and must NOT stamp inventory_approved_at/by when the reservation
--      actually FAILS (that stamp made UIs falsely render "Reserved ✓").
--   2. customer_confirm_delivery must move Delivered -> Customer Confirmed
--      (canonical 12-stage flow, and "Customer Confirmed" is already
--      allowed by the live orders_status_check in migration 027). It
--      previously jumped straight to Completed.
--   3. Drivers have NO RLS read/update access to orders assigned to them,
--      so the driver portal (MyDeliveriesPage / DeliveryStatusPage) always
--      comes up empty. Add scoped policies keyed on orders.driver_id.
--   4. Plain staff status updates never created customer notifications
--      (notify_order_status_change only covered hardcoded transitions).
--      Add a generic AFTER UPDATE OF status trigger that notifies the
--      customer on every status change.
-- ============================================================

-- 1. Fix inventory_approve_order
CREATE OR REPLACE FUNCTION public.inventory_approve_order(p_order_id UUID, p_officer_id UUID, p_notes TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_reserve JSONB;
  v_all_ok BOOLEAN;
  v_status VARCHAR;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF v_order.id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Order not found');
  END IF;

  IF v_order.status NOT IN ('Finance Approved', 'Waiting for Stock') THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Order must be Finance Approved (or Waiting for Stock) before inventory can reserve it');
  END IF;

  v_reserve := public.reserve_inventory(p_order_id, p_officer_id);
  v_all_ok := COALESCE((v_reserve->>'success')::BOOLEAN, FALSE);
  v_status := v_reserve->>'status';

  IF v_all_ok THEN
    UPDATE public.orders
    SET inventory_status = 'approved',
        inventory_approved_at = NOW(),
        inventory_approved_by = p_officer_id,
        inventory_notes = COALESCE(p_notes, inventory_notes),
        updated_at = NOW()
    WHERE id = p_order_id;

    INSERT INTO public.inventory_approvals (order_id, action, handled_by, notes)
    VALUES (p_order_id, 'approved', p_officer_id, p_notes);
  ELSE
    -- Keep the order parked at "Waiting for Stock" and DO NOT touch
    -- inventory_approved_at/by so UIs never show a false "Reserved ✓".
    UPDATE public.orders
    SET inventory_status = 'waiting',
        inventory_notes = COALESCE(p_notes, inventory_notes),
        updated_at = NOW()
    WHERE id = p_order_id;

    INSERT INTO public.inventory_approvals (order_id, action, handled_by, notes)
    VALUES (p_order_id, 'waiting', p_officer_id, p_notes);
  END IF;

  RETURN jsonb_build_object(
    'success', v_all_ok,
    'status', v_status,
    'inventory_status', CASE WHEN v_all_ok THEN 'approved' ELSE 'waiting' END,
    'low_stock_items', COALESCE(v_reserve->'low_stock_items', '[]'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Fix customer_confirm_delivery: Delivered -> Customer Confirmed
CREATE OR REPLACE FUNCTION public.customer_confirm_delivery(
  p_order_id UUID,
  p_customer_id UUID,
  p_rating INT DEFAULT NULL,
  p_feedback TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_loyalty_earned INT;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF v_order.status NOT IN ('Delivered') THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Order must be in Delivered status to confirm');
  END IF;

  IF v_order.user_id IS DISTINCT FROM p_customer_id THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'This order does not belong to you');
  END IF;

  UPDATE public.orders
  SET status = 'Customer Confirmed',
      delivery_confirmed_at = NOW(),
      delivery_rating = p_rating,
      delivery_feedback = p_feedback,
      confirmed_by = p_customer_id,
      updated_at = NOW()
  WHERE id = p_order_id;

  INSERT INTO public.customer_delivery_confirms (order_id, customer_id, rating, feedback)
  VALUES (p_order_id, p_customer_id, p_rating, p_feedback);

  -- Award loyalty points (10 points per order, +5 bonus for 5-star rating)
  v_loyalty_earned := 10 + CASE WHEN p_rating = 5 THEN 5 ELSE 0 END;
  UPDATE public.profiles
  SET loyalty_points = COALESCE(loyalty_points, 0) + v_loyalty_earned,
      total_orders = COALESCE(total_orders, 0) + 1,
      total_spent = COALESCE(total_spent, 0) + COALESCE(v_order.total_amount, 0),
      updated_at = NOW()
  WHERE id = p_customer_id;

  -- Tell admins/managers the order is confirmed and can be closed out.
  INSERT INTO public.notification_logs (user_id, channel, title, message, type, entity_type, entity_id)
  SELECT p.id, 'in_app', 'Order Confirmed by Customer',
    'Order ' || COALESCE(v_order.order_number, '#' || p_order_id) || ' was confirmed by the customer. Mark it Completed to close the workflow.',
    'info', 'order', p_order_id
  FROM public.profiles p
  WHERE p.role IN ('Admin','super_admin','Manager');

  RETURN jsonb_build_object('success', TRUE, 'status', 'Customer Confirmed', 'loyalty_points_earned', v_loyalty_earned);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RLS: drivers can read + update the orders assigned to them.
--    (orders.driver_id holds the driver's auth profile UUID.)
DROP POLICY IF EXISTS "Drivers can read their assigned orders" ON public.orders;
CREATE POLICY "Drivers can read their assigned orders" ON public.orders
  FOR SELECT USING (auth.uid() = driver_id);

DROP POLICY IF EXISTS "Drivers can update their assigned orders" ON public.orders;
CREATE POLICY "Drivers can update their assigned orders" ON public.orders
  FOR UPDATE USING (auth.uid() = driver_id)
  WITH CHECK (auth.uid() = driver_id OR driver_id IS NULL);

-- 4. Generic customer notification on every order status change.
CREATE OR REPLACE FUNCTION public.notify_order_status_change_generic()
RETURNS TRIGGER AS $$
DECLARE
  v_title TEXT;
  v_message TEXT;
  v_type TEXT;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  v_type := 'info';
  CASE LOWER(NEW.status)
    WHEN 'awaiting payment' THEN
      v_title := 'Awaiting Payment';
      v_message := 'Please complete payment for order ' || COALESCE(NEW.order_number, '#' || NEW.id) || '.';
    WHEN 'payment verified' THEN
      v_title := 'Payment Verified';
      v_message := 'We received your payment for order ' || COALESCE(NEW.order_number, '#' || NEW.id) || '.';
    WHEN 'finance approved' THEN
      v_title := 'Finance Approved';
      v_message := 'Your order ' || COALESCE(NEW.order_number, '#' || NEW.id) || ' has been approved by finance.';
    WHEN 'waiting for stock' THEN
      v_title := 'Waiting for Stock';
      v_message := 'Some items in your order ' || COALESCE(NEW.order_number, '#' || NEW.id) || ' are temporarily out of stock. We will resume the moment they arrive.';
      v_type := 'warning';
    WHEN 'reserved' THEN
      v_title := 'Inventory Reserved';
      v_message := 'Your order ' || COALESCE(NEW.order_number, '#' || NEW.id) || ' has been packed and is ready for dispatch.';
    WHEN 'ready for dispatch' THEN
      v_title := 'Ready for Dispatch';
      v_message := 'Your order ' || COALESCE(NEW.order_number, '#' || NEW.id) || ' has been handed over to dispatch.';
    WHEN 'assigned' THEN
      v_title := 'Driver Assigned';
      v_message := 'A driver has been assigned to deliver your order ' || COALESCE(NEW.order_number, '#' || NEW.id) || '.';
    WHEN 'out for delivery' THEN
      v_title := 'Out for Delivery';
      v_message := 'Your order ' || COALESCE(NEW.order_number, '#' || NEW.id) || ' is out for delivery!';
    WHEN 'delivered' THEN
      v_title := 'Delivered';
      v_message := 'Your order ' || COALESCE(NEW.order_number, '#' || NEW.id) || ' has been delivered. Please confirm receipt.';
      v_type := 'success';
    WHEN 'customer confirmed' THEN
      v_title := 'Thank You!';
      v_message := 'Thank you for confirming delivery of order ' || COALESCE(NEW.order_number, '#' || NEW.id) || '.';
    WHEN 'completed' THEN
      v_title := 'Order Completed';
      v_message := 'Order ' || COALESCE(NEW.order_number, '#' || NEW.id) || ' is complete.';
    WHEN 'cancelled' THEN
      v_title := 'Order Cancelled';
      v_message := 'Order ' || COALESCE(NEW.order_number, '#' || NEW.id) || ' has been cancelled.';
      v_type := 'error';
    ELSE
      v_title := 'Order Updated';
      v_message := 'Order ' || COALESCE(NEW.order_number, '#' || NEW.id) || ' status changed to ' || NEW.status;
  END CASE;

  INSERT INTO public.notification_logs (user_id, channel, title, message, type, entity_type, entity_id)
  VALUES (NEW.user_id, 'in_app', v_title, v_message, v_type, 'order', NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_order_status_change_generic ON public.orders;
CREATE TRIGGER trg_notify_order_status_change_generic
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.notify_order_status_change_generic();
