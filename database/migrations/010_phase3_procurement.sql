-- ============================================================
--  NEXUS TECHHUB -- Phase 3 Procurement Migration
--  Migration: 010_phase3_procurement.sql
-- ============================================================

-- 1. Extend purchase_requests status to include 'Draft'
DO $$ 
DECLARE 
  r RECORD;
BEGIN 
  FOR r IN (
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.purchase_requests'::regclass AND contype = 'c'
  ) LOOP 
    EXECUTE 'ALTER TABLE public.purchase_requests DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP; 
END $$;

ALTER TABLE public.purchase_requests ADD CONSTRAINT purchase_requests_status_check
  CHECK (status IN ('Draft','Pending','Approved','Rejected','In Transit','Received','Cancelled','Awaiting Approval'));

-- 2. Create notification triggers for PO updates
CREATE OR REPLACE FUNCTION public.handle_po_notifications()
RETURNS TRIGGER AS $$
DECLARE
  v_title TEXT;
  v_msg TEXT;
  v_action TEXT;
  v_supplier_name VARCHAR;
  v_product_title VARCHAR;
BEGIN
  -- Get Supplier and Product titles for richer notifications
  SELECT name INTO v_supplier_name FROM public.suppliers WHERE id = NEW.supplier_id;
  SELECT title INTO v_product_title FROM public.products WHERE id = NEW.product_id;

  -- Only trigger if status changed
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) OR (TG_OP = 'INSERT') THEN
    IF NEW.status = 'Pending' AND (TG_OP = 'INSERT' OR OLD.status = 'Draft') THEN
      v_title := 'New Purchase Order Pending';
      v_msg := 'A new purchase order for ' || COALESCE(NEW.quantity::text, '0') || 'x ' || COALESCE(v_product_title, 'Unknown Product') || ' from ' || COALESCE(v_supplier_name, 'Unknown Supplier') || ' is pending approval.';
      v_action := 'Review and approve/reject.';
      PERFORM public.generate_stock_alert(NULL, 'po_pending', 'info'); -- fallback if inventory_id is needed, but we don't have it directly. Let's insert directly into stock_alerts instead.
      
      INSERT INTO public.stock_alerts (alert_type, severity, title, message, suggested_action, product_id, warehouse_id, status)
      VALUES ('po_pending', 'info', v_title, v_msg, v_action, NEW.product_id, NEW.warehouse_id, 'active');
      
    ELSIF NEW.status = 'Approved' THEN
      v_title := 'Purchase Order Approved';
      v_msg := 'Purchase order for ' || COALESCE(NEW.quantity::text, '0') || 'x ' || COALESCE(v_product_title, 'Unknown') || ' has been approved.';
      v_action := 'Await delivery.';
      INSERT INTO public.stock_alerts (alert_type, severity, title, message, suggested_action, product_id, warehouse_id, status)
      VALUES ('po_approved', 'info', v_title, v_msg, v_action, NEW.product_id, NEW.warehouse_id, 'active');
      
    ELSIF NEW.status = 'Cancelled' THEN
      v_title := 'Purchase Order Cancelled/Rejected';
      v_msg := 'Purchase order for ' || COALESCE(NEW.quantity::text, '0') || 'x ' || COALESCE(v_product_title, 'Unknown') || ' has been cancelled/rejected.';
      v_action := 'Review notes.';
      INSERT INTO public.stock_alerts (alert_type, severity, title, message, suggested_action, product_id, warehouse_id, status)
      VALUES ('po_cancelled', 'warning', v_title, v_msg, v_action, NEW.product_id, NEW.warehouse_id, 'active');
      
    ELSIF NEW.status = 'Received' THEN
      v_title := 'Goods Received';
      v_msg := 'Goods for purchase order of ' || COALESCE(NEW.quantity::text, '0') || 'x ' || COALESCE(v_product_title, 'Unknown') || ' have been received.';
      v_action := 'Verify inventory stock.';
      INSERT INTO public.stock_alerts (alert_type, severity, title, message, suggested_action, product_id, warehouse_id, status)
      VALUES ('po_received', 'info', v_title, v_msg, v_action, NEW.product_id, NEW.warehouse_id, 'active');
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_po_notifications ON public.purchase_requests;
CREATE TRIGGER trigger_po_notifications
  AFTER INSERT OR UPDATE OF status ON public.purchase_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_po_notifications();

SELECT '010_phase3_procurement.sql completed' AS result;
