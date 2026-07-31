-- ============================================================
-- MIGRATION 022: Supplier Replenishment & Inventory Receiving
-- Purchase orders, supplier deliveries, stock receiving
-- ============================================================

-- 1. Purchase Orders table
CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  po_number VARCHAR(20) UNIQUE,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'in_transit', 'partially_received', 'received', 'cancelled')),
  total_amount DECIMAL(12,2) DEFAULT 0,
  notes TEXT,
  ordered_by UUID REFERENCES public.profiles(id),
  approved_by UUID REFERENCES public.profiles(id),
  expected_date DATE,
  received_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity_ordered INT NOT NULL,
  quantity_received INT DEFAULT 0,
  quantity_damaged INT DEFAULT 0,
  quantity_rejected INT DEFAULT 0,
  unit_price DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'partially_received', 'received', 'cancelled'))
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON public.purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON public.purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po_id ON public.purchase_order_items(purchase_order_id);

ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;

-- 2. Auto-generate PO number
CREATE SEQUENCE IF NOT EXISTS public.po_seq START 1001;

CREATE OR REPLACE FUNCTION public.generate_po_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.po_number := 'PO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(nextval('public.po_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_po_number ON public.purchase_orders;
CREATE TRIGGER trg_generate_po_number
  BEFORE INSERT ON public.purchase_orders
  FOR EACH ROW
  WHEN (NEW.po_number IS NULL)
  EXECUTE FUNCTION public.generate_po_number();

-- 3. Supplier Deliveries table
CREATE TABLE IF NOT EXISTS public.supplier_deliveries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_order_id UUID REFERENCES public.purchase_orders(id),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  delivery_note VARCHAR(100),
  batch_number VARCHAR(50),
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'partially_accepted', 'accepted', 'rejected')),
  notes TEXT,
  delivered_by UUID REFERENCES public.profiles(id),
  verified_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.supplier_delivery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_delivery_id UUID NOT NULL REFERENCES public.supplier_deliveries(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  quantity_delivered INT NOT NULL,
  quantity_accepted INT DEFAULT 0,
  quantity_damaged INT DEFAULT 0,
  quantity_rejected INT DEFAULT 0,
  warehouse_location_id UUID REFERENCES public.warehouse_locations(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'partially_accepted', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_supplier_deliveries_po_id ON public.supplier_deliveries(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_supplier_deliveries_supplier_id ON public.supplier_deliveries(supplier_id);

ALTER TABLE public.supplier_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_delivery_items ENABLE ROW LEVEL SECURITY;

-- 4. RPC: create_purchase_order
CREATE OR REPLACE FUNCTION public.create_purchase_order(
  p_supplier_id UUID,
  p_items JSONB,
  p_notes TEXT DEFAULT NULL,
  p_expected_date DATE DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_po_id UUID;
  v_item JSONB;
  v_total DECIMAL(12,2) := 0;
BEGIN
  INSERT INTO public.purchase_orders (supplier_id, notes, expected_date, status, ordered_by)
  VALUES (p_supplier_id, p_notes, p_expected_date, 'sent', auth.uid())
  RETURNING id INTO v_po_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO public.purchase_order_items (purchase_order_id, product_id, quantity_ordered, unit_price)
    VALUES (v_po_id, (v_item->>'product_id')::UUID, (v_item->>'quantity')::INT, (v_item->>'unit_price')::DECIMAL);

    v_total := v_total + ((v_item->>'quantity')::INT * (v_item->>'unit_price')::DECIMAL);
  END LOOP;

  UPDATE public.purchase_orders SET total_amount = v_total WHERE id = v_po_id;

  RETURN jsonb_build_object('success', TRUE, 'po_id', v_po_id, 'po_number', (SELECT po_number FROM public.purchase_orders WHERE id = v_po_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC: receive_supplier_delivery
CREATE OR REPLACE FUNCTION public.receive_supplier_delivery(
  p_purchase_order_id UUID,
  p_supplier_id UUID,
  p_delivery_note TEXT DEFAULT NULL,
  p_batch_number TEXT DEFAULT NULL,
  p_expiry_date DATE DEFAULT NULL,
  p_items JSONB DEFAULT '[]'::JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_delivery_id UUID;
  v_item JSONB;
  v_accepted INT;
  v_damaged INT;
  v_rejected INT;
  v_location UUID;
  v_inventory_id UUID;
BEGIN
  INSERT INTO public.supplier_deliveries (purchase_order_id, supplier_id, delivery_note, batch_number, expiry_date, status, delivered_by)
  VALUES (p_purchase_order_id, p_supplier_id, p_delivery_note, p_batch_number, p_expiry_date, 'pending', auth.uid())
  RETURNING id INTO v_delivery_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_accepted := (v_item->>'quantity_accepted')::INT;
    v_damaged := COALESCE((v_item->>'quantity_damaged')::INT, 0);
    v_rejected := COALESCE((v_item->>'quantity_rejected')::INT, 0);
    v_location := (v_item->>'warehouse_location_id')::UUID;

    INSERT INTO public.supplier_delivery_items (supplier_delivery_id, product_id, quantity_delivered, quantity_accepted, quantity_damaged, quantity_rejected, warehouse_location_id)
    VALUES (v_delivery_id, (v_item->>'product_id')::UUID, (v_item->>'quantity_delivered')::INT, v_accepted, v_damaged, v_rejected, v_location);

    -- Update inventory
    IF v_accepted > 0 THEN
      UPDATE public.inventory
      SET quantity_on_hand = COALESCE(quantity_on_hand, 0) + v_accepted,
          updated_at = NOW()
      WHERE product_id = (v_item->>'product_id')::UUID;

      IF NOT FOUND THEN
        INSERT INTO public.inventory (product_id, quantity_on_hand, warehouse_location_id)
        VALUES ((v_item->>'product_id')::UUID, v_accepted, v_location);
      END IF;

      INSERT INTO public.inventory_logs (product_id, change_amount, reason, notes)
      VALUES ((v_item->>'product_id')::UUID, v_accepted, 'supplier_delivery', 'PO ' || p_purchase_order_id || ' accepted ' || v_accepted);

      UPDATE public.products SET stock = COALESCE(stock, 0) + v_accepted WHERE id = (v_item->>'product_id')::UUID;
    END IF;

    IF v_damaged > 0 THEN
      INSERT INTO public.inventory_logs (product_id, change_amount, reason, notes)
      VALUES ((v_item->>'product_id')::UUID, -v_damaged, 'damaged', 'PO ' || p_purchase_order_id || ' damaged ' || v_damaged);
    END IF;

    -- Update PO item quantities
    UPDATE public.purchase_order_items
    SET quantity_received = quantity_received + v_accepted,
        quantity_damaged = quantity_damaged + v_damaged,
        quantity_rejected = quantity_rejected + v_rejected,
        status = CASE
          WHEN quantity_received + quantity_rejected + quantity_damaged >= quantity_ordered THEN 'received'
          ELSE 'partially_received'
        END
    WHERE purchase_order_id = p_purchase_order_id AND product_id = (v_item->>'product_id')::UUID;
  END LOOP;

  UPDATE public.supplier_deliveries SET status = 'verified', verified_by = auth.uid() WHERE id = v_delivery_id;

  UPDATE public.purchase_orders
  SET status = CASE
    WHEN NOT EXISTS (SELECT 1 FROM public.purchase_order_items WHERE purchase_order_id = p_purchase_order_id AND status != 'received') THEN 'received'
    ELSE 'partially_received'
  END,
  received_date = NOW(),
  updated_at = NOW()
  WHERE id = p_purchase_order_id;

  RETURN jsonb_build_object('success', TRUE, 'delivery_id', v_delivery_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RPC: check_low_stock (returns products below reorder level)
CREATE OR REPLACE FUNCTION public.check_low_stock()
RETURNS TABLE (
  product_id UUID,
  title VARCHAR,
  sku VARCHAR,
  current_stock INT,
  reorder_level INT,
  supplier_id UUID,
  supplier_name VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.title,
    p.sku,
    COALESCE(p.stock, 0)::INT,
    COALESCE(i.reorder_level, 10)::INT,
    s.id,
    s.name
  FROM public.products p
  LEFT JOIN public.inventory i ON i.product_id = p.id
  LEFT JOIN public.suppliers s ON s.id = p.supplier_id
  WHERE COALESCE(p.stock, 0) < COALESCE(i.reorder_level, 10)
  ORDER BY (COALESCE(p.stock, 0) - COALESCE(i.reorder_level, 10)) ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 7. Enable realtime
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'purchase_orders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.purchase_orders;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'supplier_deliveries') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.supplier_deliveries;
  END IF;
END $$;
