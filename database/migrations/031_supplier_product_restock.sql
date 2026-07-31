-- ============================================================
-- MIGRATION 031: Supplier Product Restock
-- Suppliers submit products into inventory. The inventory
-- manager approves them -> product goes live + stock added.
--   Supplier adds product (pending) -> inventory approves
--   -> approval_status='approved', availability=true,
--      inventory row created/updated with quantity_on_hand.
-- ============================================================

-- 1. Extend products with supplier link + approval status
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'approved'
  CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Keep the FK name stable so client embeds can use it explicitly.
ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS fk_products_supplier_profiles;

ALTER TABLE public.products
  ADD CONSTRAINT fk_products_supplier_profiles
  FOREIGN KEY (supplier_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. RLS: suppliers can manage products they submitted
DROP POLICY IF EXISTS "Suppliers can read own submitted products" ON public.products;
CREATE POLICY "Suppliers can read own submitted products"
  ON public.products FOR SELECT
  USING (supplier_id = auth.uid());

DROP POLICY IF EXISTS "Suppliers can add products" ON public.products;
CREATE POLICY "Suppliers can add products"
  ON public.products FOR INSERT
  WITH CHECK (supplier_id = auth.uid());

DROP POLICY IF EXISTS "Suppliers can update own pending products" ON public.products;
CREATE POLICY "Suppliers can update own pending products"
  ON public.products FOR UPDATE
  USING (supplier_id = auth.uid() AND approval_status = 'pending');

DROP POLICY IF EXISTS "Suppliers can delete own pending products" ON public.products;
CREATE POLICY "Suppliers can delete own pending products"
  ON public.products FOR DELETE
  USING (supplier_id = auth.uid() AND approval_status = 'pending');

-- 3. RLS: inventory staff can see and approve/reject submissions
DROP POLICY IF EXISTS "Inventory staff read all products" ON public.products;
CREATE POLICY "Inventory staff read all products"
  ON public.products FOR SELECT
  USING (public.get_user_role() IN ('Admin','super_admin','Manager','Warehouse_Staff','inventory','Inventory_Manager'));

DROP POLICY IF EXISTS "Inventory staff update products" ON public.products;
CREATE POLICY "Inventory staff update products"
  ON public.products FOR UPDATE
  USING (public.get_user_role() IN ('Admin','super_admin','Manager','Warehouse_Staff','inventory','Inventory_Manager'));

-- 4. RPC: approve a supplier product submission (restock)
CREATE OR REPLACE FUNCTION public.approve_supplier_product(
  p_product_id UUID,
  p_quantity   INT DEFAULT NULL,
  p_unit_cost  DECIMAL(10,2) DEFAULT NULL
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_product     RECORD;
  v_qty         INT;
  v_cost        DECIMAL(10,2);
  v_inv_id      UUID;
BEGIN
  SELECT * INTO v_product FROM public.products WHERE id = p_product_id;

  IF v_product.id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Product not found');
  END IF;

  v_qty  := COALESCE(p_quantity,  COALESCE(v_product.stock, 0));
  v_cost := COALESCE(p_unit_cost, COALESCE(v_product.price, 0));

  UPDATE public.products
    SET approval_status = 'approved',
        availability    = TRUE,
        stock           = v_qty,
        updated_at      = NOW()
  WHERE id = p_product_id;

  SELECT id INTO v_inv_id
  FROM public.inventory
  WHERE product_id = p_product_id
  LIMIT 1;

  IF v_inv_id IS NULL THEN
    INSERT INTO public.inventory (product_id, quantity_on_hand, quantity_reserved, reorder_level, reorder_quantity, cost_price, last_restocked)
    VALUES (p_product_id, v_qty, 0, 10, 50, v_cost, NOW());
  ELSE
    UPDATE public.inventory
      SET quantity_on_hand = v_qty,
          cost_price       = v_cost,
          last_restocked   = NOW(),
          updated_at       = NOW()
    WHERE id = v_inv_id;
  END IF;

  RETURN jsonb_build_object('success', TRUE, 'product_id', p_product_id, 'quantity', v_qty);
END;
$$;

-- 5. RPC: reject a supplier product submission
CREATE OR REPLACE FUNCTION public.reject_supplier_product(
  p_product_id UUID
) RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_product RECORD;
BEGIN
  SELECT id INTO v_product FROM public.products WHERE id = p_product_id;

  IF v_product.id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Product not found');
  END IF;

  UPDATE public.products
    SET approval_status = 'rejected',
        availability    = FALSE,
        updated_at      = NOW()
  WHERE id = p_product_id;

  RETURN jsonb_build_object('success', TRUE, 'product_id', p_product_id);
END;
$$;

-- 6. Default EXECUTE is PUBLIC for these SECURITY DEFINER RPCs, but
--    lock them down to authenticated app users explicitly.
REVOKE ALL ON FUNCTION public.approve_supplier_product(UUID, INT, DECIMAL) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reject_supplier_product(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_supplier_product(UUID, INT, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_supplier_product(UUID) TO authenticated;
