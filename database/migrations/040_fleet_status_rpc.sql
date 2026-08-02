-- ============================================================
-- MIGRATION 040: Force fleet delivery status updates
-- The fleet dashboard lets any authorised staff/driver view & act
-- on deliveries belonging to ANY driver. RLS blocks UPDATE on
-- another driver's order silently (0 rows, no error), so completions
-- appeared to succeed then reverted. These SECURITY DEFINER helpers
-- persist the status change regardless of owner.
-- ============================================================

CREATE OR REPLACE FUNCTION public.fleet_update_order_status(
  p_order_id UUID,
  p_status TEXT,
  p_driver_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.orders
  SET status = p_status,
      driver_id = COALESCE(p_driver_id, driver_id),
      updated_at = NOW()
  WHERE id = p_order_id;
  GET DIAGNOSTICS v_count = ROW_COUNT;

  IF _count = 0 THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Order not found');
  END IF;

  RETURN jsonb_build_object('success', TRUE, 'status', p_status);
END;
$$;

GRANT EXECUTE ON FUNCTION public.fleet_update_order_status(UUID, TEXT, UUID) TO authenticated;