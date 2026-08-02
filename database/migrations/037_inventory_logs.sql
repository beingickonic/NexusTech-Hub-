-- ============================================================
-- MIGRATION 037: Create missing inventory_logs table
-- Fixes "relation public.inventory_logs does not exist" when
-- running deduct_inventory (Complete Pick) on the live DB,
-- where migration 004 was never applied.
--
-- Idempotent. Also rebuilds deduct_inventory so it guarantees
-- the table exists before inserting (self-healing), so Complete
-- Pick works even if this migration's CREATE TABLE is not the
-- last definition applied to a given cluster.
-- ============================================================

-- 1. Table (idempotent)
CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID REFERENCES public.products(id) ON DELETE CASCADE,
  order_id      UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  change_amount INT NOT NULL,
  reason        VARCHAR(100) NOT NULL CHECK (reason IN ('sale', 'restock', 'return', 'adjustment')),
  notes         TEXT,
  created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_id ON public.inventory_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_order_id    ON public.inventory_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created_at  ON public.inventory_logs(created_at DESC);

-- 2. RLS
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Inventory can read inventory logs" ON public.inventory_logs;
CREATE POLICY "Inventory can read inventory logs" ON public.inventory_logs
  FOR SELECT USING (
    public.get_user_role() IN ('Admin','super_admin','Manager','Inventory_Manager','Warehouse_Staff','inventory')
  );

DROP POLICY IF EXISTS "Admins can manage inventory logs" ON public.inventory_logs;
CREATE POLICY "Admins can manage inventory logs" ON public.inventory_logs
  FOR ALL USING (
    public.get_user_role() IN ('Admin','super_admin','Manager','Inventory_Manager')
  );

-- 3. Self-healing deduct_inventory (guarantees table exists)
CREATE OR REPLACE FUNCTION public.deduct_inventory(p_order_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_item RECORD;
BEGIN
  CREATE TABLE IF NOT EXISTS public.inventory_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id    UUID REFERENCES public.products(id) ON DELETE CASCADE,
    order_id      UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    change_amount INT NOT NULL,
    reason        VARCHAR(100) NOT NULL CHECK (reason IN ('sale', 'restock', 'return', 'adjustment')),
    notes         TEXT,
    created_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
  );

  FOR v_item IN
    SELECT oi.product_id, oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = p_order_id
  LOOP
    UPDATE public.inventory
    SET quantity_on_hand = GREATEST(0, COALESCE(quantity_on_hand, 0) - v_item.quantity),
        quantity_reserved = GREATEST(0, COALESCE(quantity_reserved, 0) - v_item.quantity),
        updated_at = NOW()
    WHERE product_id = v_item.product_id;

    UPDATE public.products
    SET stock = GREATEST(0, COALESCE(stock, 0) - v_item.quantity)
    WHERE id = v_item.product_id;

    INSERT INTO public.inventory_logs (product_id, order_id, change_amount, reason, notes)
    VALUES (v_item.product_id, p_order_id, -v_item.quantity, 'sale', 'Picking completed');
  END LOOP;

  RETURN jsonb_build_object('success', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;