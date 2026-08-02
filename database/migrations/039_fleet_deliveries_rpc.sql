-- ============================================================
-- MIGRATION 039: Fleet deliveries for driver portal
-- A SECURITY DEFINER function so a logged-in Driver can view the
-- whole fleet (all drivers' active + delivered orders), bypassing
-- the row-level security that normally hides orders not their own.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_fleet_deliveries()
RETURNS SETOF jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row RECORD;
  v_driver_name TEXT;
BEGIN
  FOR v_row IN
    SELECT o.id, o.order_number, o.status, o.driver_id, o.shipping_name,
           o.shipping_phone, o.shipping_address, o.shipping_city,
           o.created_at
    FROM public.orders o
    WHERE o.driver_id IS NOT NULL
      AND o.status IN ('Assigned', 'Out for Delivery', 'Delivered', 'Completed')
    ORDER BY o.created_at DESC
  LOOP
    SELECT p.full_name INTO v_driver_name
    FROM public.profiles p
    WHERE p.id = v_row.driver_id;

    RETURN NEXT jsonb_build_object(
      'id', v_row.id,
      'dispatch_number', v_row.order_number,
      'order_id', v_row.id,
      'driver_id', v_row.driver_id,
      'driver_name', COALESCE(v_driver_name, 'Unassigned'),
      'customer_name', COALESCE(v_row.shipping_name, 'Customer'),
      'customer_phone', COALESCE(v_row.shipping_phone, ''),
      'shipping_address', COALESCE(v_row.shipping_address, ''),
      'shipping_city', COALESCE(v_row.shipping_city, ''),
      'status', v_row.status,
      'created_at', v_row.created_at
    );
  END LOOP;
  RETURN;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_fleet_deliveries() TO authenticated;