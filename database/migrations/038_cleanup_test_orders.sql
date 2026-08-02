-- ============================================================
-- MIGRATION 038: Cleanup test orders whose customer has no name
--
-- Removes the test orders cluttering the Inventory -> Order
-- Approvals list (29 orders). Their customer profile exists but
-- has no full_name, so the UI renders them as "unknown".
--
-- Idempotent & FK-safe. Running this file executes the cleanup:
--   1. deletes dependent rows (payments, invoices, order_items,
--      order_status_history, delivery_events,
--      customer_delivery_confirms, inventory_approvals,
--      notification_logs)
--   2. deletes the orders themselves
-- << Does NOT touch inventory quantity_reserved >>
-- ============================================================

DO $$
DECLARE
  v_orders    uuid[];
  v_count     INTEGER;
  v_payments  INTEGER;
  v_invoices  INTEGER;
  v_items     INTEGER;
  v_history   INTEGER;
  v_events    INTEGER;
  v_confirms  INTEGER;
  v_approvals INTEGER;
  v_notifs    INTEGER;
BEGIN
  -- Test orders = any order whose customer cannot be resolved to a
  -- named person: either NO profile row exists, or the profile's
  -- full_name is null/blank. (These are the "unknown" entries.)
  SELECT COALESCE(array_agg(o.id), '{}'::uuid[])
    INTO v_orders
  FROM public.orders o
  LEFT JOIN public.profiles p ON p.id = o.user_id
  WHERE o.user_id IS NOT NULL
    AND (
      p.id IS NULL                              -- no profile at all
      OR COALESCE(TRIM(p.full_name), '') = ''   -- profile exists but unnamed
    );

  RAISE NOTICE 'Test orders to delete: %', cardinality(v_orders);

  IF cardinality(v_orders) = 0 THEN
    RAISE NOTICE 'No test orders found - nothing to do.';
    RETURN;
  END IF;

  -- Delete dependents then orders
  DELETE FROM payments WHERE order_id = ANY(v_orders);
  GET DIAGNOSTICS v_payments = ROW_COUNT;

  DELETE FROM invoices WHERE order_id = ANY(v_orders);
  GET DIAGNOSTICS v_invoices = ROW_COUNT;

  DELETE FROM order_items WHERE order_id = ANY(v_orders);
  GET DIAGNOSTICS v_items = ROW_COUNT;

  DELETE FROM order_status_history WHERE order_id = ANY(v_orders);
  GET DIAGNOSTICS v_history = ROW_COUNT;

  DELETE FROM delivery_events WHERE order_id = ANY(v_orders);
  GET DIAGNOSTICS v_events = ROW_COUNT;

  DELETE FROM customer_delivery_confirms WHERE order_id = ANY(v_orders);
  GET DIAGNOSTICS v_confirms = ROW_COUNT;

  DELETE FROM inventory_approvals WHERE order_id = ANY(v_orders);
  GET DIAGNOSTICS v_approvals = ROW_COUNT;

  DELETE FROM notification_logs WHERE entity_type = 'order' AND entity_id::uuid = ANY(v_orders);
  GET DIAGNOSTICS v_notifs = ROW_COUNT;

  DELETE FROM orders WHERE id = ANY(v_orders);
  GET DIAGNOSTICS v_count = ROW_COUNT;

  RAISE NOTICE 'Deleted % orders | payments=% invoices=% items=% history=% events=% confirms=% approvals=% notifications=%',
    v_count, v_payments, v_invoices, v_items, v_history, v_events, v_confirms, v_approvals, v_notifs;
END $$;