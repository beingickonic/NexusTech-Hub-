-- ============================================================
-- MIGRATION 032: Fix false "Low Stock Detected" (Waiting for Stock)
--
-- Problem:
--   reserve_inventory decided stock was insufficient using
--   inventory.quantity_on_hand, but products.stock (the value admins
--   see and edit in the Products/Inventory UI) was often out of sync
--   because several write paths updated only products.stock.
--   Result: orders flagged "Waiting for Stock" (and customers shown
--   "Low Stock Detected") even though enough stock existed.
--
-- Fix:
--   1. Reconcile the primary inventory row (the one reserve_inventory
--      reads) with products.stock.
--   2. Make reserve_inventory atomic: it now verifies EVERY item
--      before reserving anything, so a shortfall can no longer leave
--      phantom per-item reservations behind (which previously caused
--      double-counted reservations and false low-stock on retry).
-- ============================================================

-- 1. Backfill: align the primary inventory row per product with
--    products.stock so existing stale data is corrected immediately.
UPDATE public.inventory i
SET quantity_on_hand = p.stock,
    updated_at       = NOW()
FROM (
  SELECT DISTINCT ON (product_id) product_id, id
  FROM public.inventory
  ORDER BY product_id, id
) prim
JOIN public.products p ON p.id = prim.product_id
WHERE i.id = prim.id
  AND i.quantity_on_hand IS DISTINCT FROM p.stock;

-- 2. Atomic reserve_inventory
CREATE OR REPLACE FUNCTION public.reserve_inventory(p_order_id UUID, p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_item RECORD;
  v_inventory RECORD;
  v_available INT;
  v_all_available BOOLEAN := TRUE;
  v_low_stock_items JSONB := '[]'::JSONB;
  v_result JSONB;
BEGIN
  -- Pass 1: verify every item has enough available stock. No mutation yet.
  FOR v_item IN
    SELECT oi.product_id, oi.quantity, p.title
    FROM public.order_items oi
    JOIN public.products p ON p.id = oi.product_id
    WHERE oi.order_id = p_order_id
  LOOP
    SELECT i.id, i.quantity_on_hand, i.quantity_reserved
    INTO v_inventory
    FROM public.inventory i
    WHERE i.product_id = v_item.product_id
    LIMIT 1;

    IF v_inventory.id IS NULL THEN
      INSERT INTO public.inventory (product_id, quantity_on_hand, quantity_reserved)
      VALUES (v_item.product_id, 0, 0)
      RETURNING id, quantity_on_hand, quantity_reserved INTO v_inventory;
    END IF;

    v_available := COALESCE(v_inventory.quantity_on_hand, 0) - COALESCE(v_inventory.quantity_reserved, 0);

    IF v_available < v_item.quantity THEN
      v_all_available := FALSE;
      v_low_stock_items := v_low_stock_items || jsonb_build_object(
        'product_id', v_item.product_id,
        'title', v_item.title,
        'requested', v_item.quantity,
        'available', GREATEST(0, v_available)
      );
    END IF;
  END LOOP;

  -- Pass 2: reserve only if every item is available.
  IF v_all_available THEN
    FOR v_item IN
      SELECT oi.product_id, oi.quantity
      FROM public.order_items oi
      WHERE oi.order_id = p_order_id
    LOOP
      UPDATE public.inventory
      SET quantity_reserved = COALESCE(quantity_reserved, 0) + v_item.quantity,
          updated_at = NOW()
      WHERE product_id = v_item.product_id;
    END LOOP;

    UPDATE public.orders SET status = 'Reserved' WHERE id = p_order_id;
    v_result := jsonb_build_object('success', TRUE, 'status', 'Reserved');
  ELSE
    UPDATE public.orders SET status = 'Waiting for Stock' WHERE id = p_order_id;
    v_result := jsonb_build_object(
      'success', FALSE,
      'status', 'Waiting for Stock',
      'low_stock_items', v_low_stock_items
    );
  END IF;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
