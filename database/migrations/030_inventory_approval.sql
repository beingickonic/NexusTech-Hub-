-- ============================================================
-- MIGRATION 030: Inventory Approval Portal
-- Lets the inventory manager approve orders (after finance
-- approval) which reserves stock and always reflects it in DB.
--   Finance Approved -> (inventory approves) -> Reserved
--                                            -> Waiting for Stock (low stock)
-- ============================================================

-- 1. Inventory approval metadata on orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS inventory_status VARCHAR(20) DEFAULT 'pending'
  CHECK (inventory_status IN ('pending', 'approved', 'waiting', 'rejected'));
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS inventory_approved_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS inventory_approved_by UUID REFERENCES public.profiles(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS inventory_notes TEXT;

-- 2. inventory_approvals audit table
CREATE TABLE IF NOT EXISTS public.inventory_approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'waiting', 'rejected')),
  handled_by UUID NOT NULL REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inventory_approvals_order_id ON public.inventory_approvals(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_approvals_handled_by ON public.inventory_approvals(handled_by);

ALTER TABLE public.inventory_approvals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Inventory can read approvals" ON public.inventory_approvals;
CREATE POLICY "Inventory can read approvals" ON public.inventory_approvals
  FOR SELECT USING (
    public.get_user_role() IN ('Admin','super_admin','Manager','Inventory_Manager','Warehouse_Staff','inventory')
  );

-- 3. RLS: inventory roles can read orders / items / profiles for the approval queue
DROP POLICY IF EXISTS "Inventory can read orders" ON public.orders;
CREATE POLICY "Inventory can read orders" ON public.orders
  FOR SELECT USING (
    public.get_user_role() IN ('Admin','super_admin','Manager','Inventory_Manager','Warehouse_Staff','inventory')
  );

DROP POLICY IF EXISTS "Inventory can read order items" ON public.order_items;
CREATE POLICY "Inventory can read order items" ON public.order_items
  FOR SELECT USING (
    public.get_user_role() IN ('Admin','super_admin','Manager','Inventory_Manager','Warehouse_Staff','inventory')
  );

DROP POLICY IF EXISTS "Inventory can read profiles" ON public.profiles;
CREATE POLICY "Inventory can read profiles" ON public.profiles
  FOR SELECT USING (
    public.get_user_role() IN ('Admin','super_admin','Manager','Inventory_Manager','Warehouse_Staff','inventory')
  );

-- 4. RPC: inventory_approve_order
--    Reserves stock via reserve_inventory and records the approval.
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

  IF v_order.status NOT IN ('Finance Approved') THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Order must be Finance Approved before inventory can reserve it');
  END IF;

  v_reserve := public.reserve_inventory(p_order_id, p_officer_id);
  v_all_ok := COALESCE((v_reserve->>'success')::BOOLEAN, FALSE);
  v_status := v_reserve->>'status';

  UPDATE public.orders
  SET inventory_status = CASE WHEN v_all_ok THEN 'approved' ELSE 'waiting' END,
      inventory_approved_at = NOW(),
      inventory_approved_by = p_officer_id,
      inventory_notes = COALESCE(p_notes, inventory_notes),
      updated_at = NOW()
  WHERE id = p_order_id;

  INSERT INTO public.inventory_approvals (order_id, action, handled_by, notes)
  VALUES (p_order_id, CASE WHEN v_all_ok THEN 'approved' ELSE 'waiting' END, p_officer_id, p_notes);

  RETURN jsonb_build_object(
    'success', v_all_ok,
    'status', v_status,
    'inventory_status', CASE WHEN v_all_ok THEN 'approved' ELSE 'waiting' END,
    'low_stock_items', COALESCE(v_reserve->'low_stock_items', '[]'::jsonb)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC: inventory_reject_order
CREATE OR REPLACE FUNCTION public.inventory_reject_order(p_order_id UUID, p_officer_id UUID, p_notes TEXT)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF v_order.id IS NULL THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Order not found');
  END IF;

  IF v_order.status NOT IN ('Finance Approved') THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Order must be Finance Approved');
  END IF;

  UPDATE public.orders
  SET status = 'Cancelled',
      inventory_status = 'rejected',
      inventory_approved_at = NOW(),
      inventory_approved_by = p_officer_id,
      inventory_notes = p_notes,
      updated_at = NOW()
  WHERE id = p_order_id;

  INSERT INTO public.inventory_approvals (order_id, action, handled_by, notes)
  VALUES (p_order_id, 'rejected', p_officer_id, p_notes);

  RETURN jsonb_build_object('success', TRUE, 'status', 'Cancelled');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Notify inventory staff when an order needs inventory approval
CREATE OR REPLACE FUNCTION public.notify_inventory_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Finance Approved' THEN
    INSERT INTO public.notification_logs (user_id, channel, title, message, type, entity_type, entity_id)
    SELECT p.id, 'in_app', 'Inventory Approval Needed',
      'Order ' || COALESCE(NEW.order_number, '#' || NEW.id) || ' is awaiting inventory reservation.',
      'warning', 'order', NEW.id
    FROM public.profiles p
    WHERE p.role IN ('Admin','super_admin','Manager','Inventory_Manager','Warehouse_Staff','inventory');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    DROP TRIGGER IF EXISTS trg_notify_inventory_approval ON public.orders;
    CREATE TRIGGER trg_notify_inventory_approval
      AFTER UPDATE OF status ON public.orders
      FOR EACH ROW
      WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'Finance Approved')
      EXECUTE FUNCTION public.notify_inventory_approval();
  END IF;
END $$;

-- 7. Enable realtime for inventory_approvals
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'inventory_approvals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.inventory_approvals;
  END IF;
END $$;
