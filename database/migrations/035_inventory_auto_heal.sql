-- ============================================================
-- MIGRATION 035: Auto-heal stale inventory rows on reservation
--
-- Problem discovered live:
--   ORD-20260731-1028 stayed "Waiting for Stock" with the toast
--   "Reserved what we could - 1 item(s) need restocking" even though
--   products.stock = 3 for the ordered product. The operational
--   inventory row (quantity_on_hand) had drifted to 0 because a write
--   path (or stale seed) updated products.stock without updating the
--   primary inventory row, and migration 032's one-time backfill had
--   already run / missed this product.
--
-- Convention (consistent with 032 + all current write paths):
--   products.stock            = total units on hand  (display value)
--   inventory.quantity_on_hand = same total units     (operational value)
--   inventory.quantity_reserved = committed units     (reservations)
--   available = quantity_on_hand - quantity_reserved
--
-- Fix:
--   1. Re-run the one-time reconcile of primary inventory rows from
--      products.stock (re-covers any rows created after 032).
--   2. reserve_inventory now reconciles the primary inventory row to
--      products.stock at runtime, so a stale row can never again
--      produce a false low-stock / "Waiting for Stock" order.
-- ============================================================

-- 1. Re-run the 032 backfill (idempotent).
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

-- 2. reserve_inventory: self-heal the primary inventory row.
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
    SELECT oi.product_id, oi.quantity, p.title, p.stock
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
      VALUES (v_item.product_id, COALESCE(v_item.stock, 0), 0)
      RETURNING id, quantity_on_hand, quantity_reserved INTO v_inventory;
    ELSIF v_inventory.quantity_on_hand IS DISTINCT FROM COALESCE(v_item.stock, 0) THEN
      -- Heal a stale row: products.stock is the source of truth for total units.
      UPDATE public.inventory
      SET quantity_on_hand = COALESCE(v_item.stock, 0),
          updated_at       = NOW()
      WHERE id = v_inventory.id;
      v_inventory.quantity_on_hand := COALESCE(v_item.stock, 0);
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
