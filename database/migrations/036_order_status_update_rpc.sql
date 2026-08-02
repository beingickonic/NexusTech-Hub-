-- ============================================================
-- MIGRATION 036: SECURITY DEFINER order status transition RPC
-- Fixes "Cannot coerce the result to a single JSON object" when
-- inventory/dispatch staff (Warehouse_Staff, inventory, etc.)
-- click "Start Picking" / "Mark Ready".
--
-- Client-side direct UPDATEs on public.orders are blocked by RLS
-- for non-Admin/Manger roles (see orders RLS policies). We expose
-- a SECURITY DEFINER function that bypasses RLS for the specific
-- status transition, matching the existing pattern used by
-- reserve_inventory / deduct_inventory.
-- ============================================================

DROP FUNCTION IF EXISTS public.update_order_status(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.update_order_status(p_order_id UUID, p_new_status TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_status TEXT;
  v_updated JSONB;
BEGIN
  SELECT status INTO v_current_status
  FROM public.orders
  WHERE id = p_order_id;

  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Order not found');
  END IF;

  UPDATE public.orders AS o
  SET status = p_new_status,
      updated_at = NOW()
  WHERE o.id = p_order_id
  RETURNING to_jsonb(o) INTO v_updated;

  IF v_updated IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Update blocked by policy');
  END IF;

  RETURN jsonb_build_object('success', TRUE, 'data', v_updated);
END;
$$;

-- Restrict invocation to authenticated app roles so it cannot be abused.
REVOKE ALL ON FUNCTION public.update_order_status(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.update_order_status(UUID, TEXT) TO authenticated;