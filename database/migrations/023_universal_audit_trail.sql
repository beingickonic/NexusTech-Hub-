-- ============================================================
-- MIGRATION 023: Universal Audit Trail
-- Every action logged with user, role, IP, device
-- ============================================================

-- 1. Create unified audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  role VARCHAR(50),
  department VARCHAR(50),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Admins can view audit logs') THEN
    CREATE POLICY "Admins can view audit logs" ON public.audit_logs
      FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'super_admin', 'Manager'))
      );
  END IF;
END $$;

-- 2. Core logging function
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id UUID DEFAULT NULL,
  p_action VARCHAR DEFAULT NULL,
  p_entity_type VARCHAR DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_old_status VARCHAR DEFAULT NULL,
  p_new_status VARCHAR DEFAULT NULL,
  p_old_data JSONB DEFAULT NULL,
  p_new_data JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_role VARCHAR;
  v_ip INET;
  v_ua TEXT;
  v_log_id UUID;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  SELECT role INTO v_role FROM public.profiles WHERE id = v_user_id;

  INSERT INTO public.audit_logs (
    user_id, role, department, action, entity_type, entity_id,
    old_status, new_status, old_data, new_data,
    ip_address, user_agent, metadata
  ) VALUES (
    v_user_id, v_role,
    CASE
      WHEN v_role IN ('Admin', 'super_admin') THEN 'admin'
      WHEN v_role IN ('Finance_Officer', 'Manager') THEN 'finance'
      WHEN v_role IN ('Warehouse_Staff', 'inventory') THEN 'inventory'
      WHEN v_role = 'Dispatch_Officer' THEN 'dispatch'
      WHEN v_role = 'Driver' THEN 'driver'
      WHEN v_role = 'Supplier' THEN 'supplier'
      ELSE 'customer'
    END,
    p_action, p_entity_type, p_entity_id,
    p_old_status, p_new_status, p_old_data, p_new_data,
    inet_client_addr(), current_setting('request.headers')::jsonb->>'user-agent',
    p_metadata
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Enhanced order status change trigger (logs to both order_status_history and audit_logs)
CREATE OR REPLACE FUNCTION public.enhanced_log_order_status()
RETURNS TRIGGER AS $$
DECLARE
  v_role VARCHAR;
  v_history_exists BOOLEAN;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid();

  -- Original: insert into order_status_history (if that table exists)
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_status_history') INTO v_history_exists;

  IF v_history_exists AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, from_status, to_status, changed_by, changed_at)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid(), NOW());
  END IF;

  -- New: insert into audit_logs
  PERFORM public.log_audit_event(
    auth.uid(),
    CASE
      WHEN OLD.status IS NULL THEN 'created'
      ELSE 'status_update'
    END,
    'order',
    NEW.id,
    OLD.status,
    NEW.status,
    row_to_json(OLD)::jsonb,
    row_to_json(NEW)::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Guard: only create trigger if orders table exists (from migration 018)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    DROP TRIGGER IF EXISTS trg_log_order_status ON public.orders;
    CREATE TRIGGER trg_log_order_status
      AFTER INSERT OR UPDATE OF status ON public.orders
      FOR EACH ROW
      EXECUTE FUNCTION public.enhanced_log_order_status();
  END IF;
END $$;

-- 4. Audit trigger for finance_approvals (requires migration 019)
CREATE OR REPLACE FUNCTION public.log_finance_audit()
RETURNS TRIGGER AS $$
DECLARE
  v_order_status VARCHAR;
BEGIN
  SELECT status INTO v_order_status FROM public.orders WHERE id = NEW.order_id;

  PERFORM public.log_audit_event(
    NEW.handled_by,
    NEW.action,
    'finance_approval',
    NEW.order_id,
    NULL,
    v_order_status,
    NULL,
    row_to_json(NEW)::jsonb,
    jsonb_build_object('order_status', v_order_status, 'finance_action', NEW.action)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'finance_approvals') THEN
    DROP TRIGGER IF EXISTS trg_log_finance_audit ON public.finance_approvals;
    CREATE TRIGGER trg_log_finance_audit
      AFTER INSERT ON public.finance_approvals
      FOR EACH ROW
      EXECUTE FUNCTION public.log_finance_audit();
  END IF;
END $$;

-- 5. Audit trigger for delivery_events (driver actions, requires migration 020)
CREATE OR REPLACE FUNCTION public.log_delivery_event_audit()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.log_audit_event(
    NEW.driver_id, NEW.event_type, 'delivery', COALESCE(NEW.dispatch_id, NEW.order_id),
    NULL, NEW.event_type, NULL, row_to_json(NEW)::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'delivery_events') THEN
    DROP TRIGGER IF EXISTS trg_log_delivery_audit ON public.delivery_events;
    CREATE TRIGGER trg_log_delivery_audit
      AFTER INSERT ON public.delivery_events
      FOR EACH ROW
      EXECUTE FUNCTION public.log_delivery_event_audit();
  END IF;
END $$;

-- 6. Audit trigger for supplier_deliveries (requires migration 022)
CREATE OR REPLACE FUNCTION public.log_supplier_delivery_audit()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM public.log_audit_event(
    NEW.delivered_by, 'supplier_delivery_' || NEW.status, 'supplier_delivery',
    NEW.id, NULL, NEW.status, NULL, row_to_json(NEW)::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'supplier_deliveries') THEN
    DROP TRIGGER IF EXISTS trg_log_supplier_delivery_audit ON public.supplier_deliveries;
    CREATE TRIGGER trg_log_supplier_delivery_audit
      AFTER INSERT OR UPDATE OF status ON public.supplier_deliveries
      FOR EACH ROW
      EXECUTE FUNCTION public.log_supplier_delivery_audit();
  END IF;
END $$;

-- 7. Audit trigger for purchase_orders (requires migration 022)
CREATE OR REPLACE FUNCTION public.log_po_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.log_audit_event(
      auth.uid(), 'po_' || NEW.status, 'purchase_order',
      NEW.id, OLD.status, NEW.status, row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'purchase_orders') THEN
    DROP TRIGGER IF EXISTS trg_log_po_audit ON public.purchase_orders;
    CREATE TRIGGER trg_log_po_audit
      AFTER UPDATE OF status ON public.purchase_orders
      FOR EACH ROW
      EXECUTE FUNCTION public.log_po_audit();
  END IF;
END $$;

-- 8. RPC to query audit logs with filters
CREATE OR REPLACE FUNCTION public.query_audit_logs(
  p_entity_type VARCHAR DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_action VARCHAR DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_from_date TIMESTAMPTZ DEFAULT NULL,
  p_to_date TIMESTAMPTZ DEFAULT NULL,
  p_limit INT DEFAULT 100,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  id UUID, user_id UUID, role VARCHAR, department VARCHAR,
  action VARCHAR, entity_type VARCHAR, entity_id UUID,
  old_status VARCHAR, new_status VARCHAR,
  old_data JSONB, new_data JSONB,
  ip_address INET, user_agent TEXT, metadata JSONB,
  created_at TIMESTAMPTZ,
  user_name VARCHAR, user_email VARCHAR
) AS $$
DECLARE
  v_query TEXT;
BEGIN
  v_query := 'SELECT a.id, a.user_id, a.role, a.department,
    a.action, a.entity_type, a.entity_id,
    a.old_status, a.new_status,
    a.old_data, a.new_data,
    a.ip_address, a.user_agent, a.metadata,
    a.created_at,
    p.full_name AS user_name, p.email AS user_email
  FROM public.audit_logs a
  LEFT JOIN public.profiles p ON p.id = a.user_id
  WHERE 1=1';

  IF p_entity_type IS NOT NULL THEN
    v_query := v_query || ' AND a.entity_type = ' || quote_literal(p_entity_type);
  END IF;
  IF p_entity_id IS NOT NULL THEN
    v_query := v_query || ' AND a.entity_id = ' || quote_literal(p_entity_id);
  END IF;
  IF p_action IS NOT NULL THEN
    v_query := v_query || ' AND a.action = ' || quote_literal(p_action);
  END IF;
  IF p_user_id IS NOT NULL THEN
    v_query := v_query || ' AND a.user_id = ' || quote_literal(p_user_id);
  END IF;
  IF p_from_date IS NOT NULL THEN
    v_query := v_query || ' AND a.created_at >= ' || quote_literal(p_from_date);
  END IF;
  IF p_to_date IS NOT NULL THEN
    v_query := v_query || ' AND a.created_at <= ' || quote_literal(p_to_date);
  END IF;

  v_query := v_query || ' ORDER BY a.created_at DESC LIMIT ' || p_limit || ' OFFSET ' || p_offset;

  RETURN QUERY EXECUTE v_query;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 9. Enable realtime
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'audit_logs') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
  END IF;
END $$;
