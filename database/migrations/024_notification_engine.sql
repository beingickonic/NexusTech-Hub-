-- ============================================================
-- MIGRATION 024: Notification Engine
-- Unified notifications with auto-triggers for every stage
-- ============================================================

-- 1. Create notification_logs for email/SMS tracking
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  channel VARCHAR(10) NOT NULL CHECK (channel IN ('in_app', 'email', 'sms', 'push')),
  title VARCHAR(200) NOT NULL,
  message TEXT,
  type VARCHAR(50) DEFAULT 'info',
  entity_type VARCHAR(50),
  entity_id UUID,
  read BOOLEAN DEFAULT FALSE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_user ON public.notification_logs(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notification_logs_created ON public.notification_logs(sent_at DESC);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_logs' AND policyname = 'Users view own notifications') THEN
    CREATE POLICY "Users view own notifications" ON public.notification_logs
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_logs' AND policyname = 'System can insert notifications') THEN
    CREATE POLICY "System can insert notifications" ON public.notification_logs
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- 2. Notification dispatch function
CREATE OR REPLACE FUNCTION public.send_notification(
  p_user_id UUID,
  p_title VARCHAR,
  p_message TEXT DEFAULT NULL,
  p_type VARCHAR DEFAULT 'info',
  p_entity_type VARCHAR DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_channels TEXT[] DEFAULT ARRAY['in_app']
)
RETURNS UUID AS $$
DECLARE
  v_notif_id UUID;
  v_channel TEXT;
  v_notifications_exists BOOLEAN;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') INTO v_notifications_exists;

  FOREACH v_channel IN ARRAY p_channels
  LOOP
    INSERT INTO public.notification_logs (user_id, channel, title, message, type, entity_type, entity_id)
    VALUES (p_user_id, v_channel, p_title, p_message, p_type, p_entity_type, p_entity_id)
    RETURNING id INTO v_notif_id;

    -- Legacy: also insert into old notifications table for in-app (if it exists)
    IF v_channel = 'in_app' AND v_notifications_exists THEN
      INSERT INTO public.notifications (user_id, title, message, type)
      VALUES (p_user_id, p_title, p_message, p_type)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RETURN v_notif_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Auto-notify on order status changes
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_title TEXT;
  v_message TEXT;
  v_type TEXT;
BEGIN
  SELECT user_id INTO v_user_id FROM public.orders WHERE id = NEW.id;

  IF OLD.status IS DISTINCT FROM NEW.status THEN
    CASE NEW.status
      WHEN 'Pending' THEN
        v_title := 'Order Received';
        v_message := 'Your order has been received and is being processed.';
        v_type := 'info';
      WHEN 'Paid' THEN
        v_title := 'Payment Successful';
        v_message := 'Your payment has been received. Awaiting finance approval.';
        v_type := 'success';
      WHEN 'Pending Finance Approval' THEN
        v_title := 'Payment Received';
        v_message := 'Your payment is pending finance verification.';
        v_type := 'info';
      WHEN 'Finance Approved' THEN
        v_title := 'Payment Verified';
        v_message := 'Your payment has been verified. Preparing your order.';
        v_type := 'success';
      WHEN 'Reserved' THEN
        v_title := 'Inventory Reserved';
        v_message := 'Items reserved for your order.';
        v_type := 'info';
      WHEN 'Ready for Dispatch' THEN
        v_title := 'Ready for Dispatch';
        v_message := 'Your order is being prepared for delivery.';
        v_type := 'info';
      WHEN 'Assigned' THEN
        v_title := 'Driver Assigned';
        v_message := 'A driver has been assigned to your delivery.';
        v_type := 'info';
      WHEN 'Out for Delivery' THEN
        v_title := 'Out for Delivery';
        v_message := 'Your order is on its way!';
        v_type := 'info';
      WHEN 'Delivered' THEN
        v_title := 'Order Arrived';
        v_message := 'Your order has arrived. Please confirm receipt.';
        v_type := 'success';
      WHEN 'Completed' THEN
        v_title := 'Order Completed';
        v_message := 'Thank you! Your order is complete.';
        v_type := 'success';
      WHEN 'Cancelled' THEN
        v_title := 'Order Cancelled';
        v_message := 'Your order has been cancelled.';
        v_type := 'error';
      WHEN 'Refunded' THEN
        v_title := 'Refund Processed';
        v_message := 'Your refund has been processed.';
        v_type := 'success';
      ELSE
        v_title := 'Order Updated';
        v_message := 'Your order status changed to ' || NEW.status;
        v_type := 'info';
    END CASE;

    IF v_user_id IS NOT NULL THEN
      PERFORM public.send_notification(v_user_id, v_title, v_message, v_type, 'order', NEW.id);
    END IF;

    -- Notify finance officers when finance approval is needed
    IF NEW.status = 'Pending Finance Approval' THEN
      INSERT INTO public.notification_logs (user_id, channel, title, message, type, entity_type, entity_id)
      SELECT p.id, 'in_app', 'Payment Pending Approval',
        'Order ' || COALESCE(NEW.order_number, '#' || NEW.id) || ' requires payment verification.',
        'warning', 'order', NEW.id
      FROM public.profiles p
      WHERE p.role IN ('Finance_Officer', 'Manager', 'Admin', 'super_admin');
    END IF;

    -- Notify warehouse staff when dispatch is ready
    IF NEW.status = 'Ready for Dispatch' THEN
      INSERT INTO public.notification_logs (user_id, channel, title, message, type, entity_type, entity_id)
      SELECT p.id, 'in_app', 'Order Ready for Dispatch',
        'Order ' || COALESCE(NEW.order_number, '#' || NEW.id) || ' is ready to ship.',
        'info', 'order', NEW.id
      FROM public.profiles p
      WHERE p.role IN ('Dispatch_Officer', 'Warehouse_Staff', 'Manager', 'Admin', 'super_admin');
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') THEN
    DROP TRIGGER IF EXISTS trg_notify_order_status ON public.orders;
    CREATE TRIGGER trg_notify_order_status
      AFTER UPDATE OF status ON public.orders
      FOR EACH ROW
      WHEN (OLD.status IS DISTINCT FROM NEW.status)
      EXECUTE FUNCTION public.notify_order_status_change();
  END IF;
END $$;

-- 4. Notify on finance approval actions
CREATE OR REPLACE FUNCTION public.notify_finance_action()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
  v_order_no VARCHAR;
BEGIN
  SELECT user_id, order_number INTO v_user_id, v_order_no FROM public.orders WHERE id = NEW.order_id;

  IF NEW.action = 'approved' THEN
    IF v_user_id IS NOT NULL THEN
      PERFORM public.send_notification(v_user_id,
        'Payment Verified',
        'Your payment for Order ' || COALESCE(v_order_no, '#' || NEW.order_id) || ' has been verified.',
        'success', 'order', NEW.order_id);
    END IF;
  ELSIF NEW.action = 'rejected' THEN
    IF v_user_id IS NOT NULL THEN
      PERFORM public.send_notification(v_user_id,
        'Payment Rejected',
        'Your payment for Order ' || COALESCE(v_order_no, '#' || NEW.order_id) || ' was rejected. Reason: ' || COALESCE(NEW.notes, 'N/A'),
        'error', 'order', NEW.order_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'finance_approvals') THEN
    DROP TRIGGER IF EXISTS trg_notify_finance_action ON public.finance_approvals;
    CREATE TRIGGER trg_notify_finance_action
      AFTER INSERT ON public.finance_approvals
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_finance_action();
  END IF;
END $$;

-- 5. Notify driver on dispatch assignment
CREATE OR REPLACE FUNCTION public.notify_driver_assignment()
RETURNS TRIGGER AS $$
DECLARE
  v_driver_user_id UUID;
BEGIN
  IF NEW.status = 'assigned' AND NEW.driver_id IS NOT NULL THEN
    SELECT user_id INTO v_driver_user_id FROM public.drivers WHERE id = NEW.driver_id;

    IF v_driver_user_id IS NOT NULL THEN
      PERFORM public.send_notification(v_driver_user_id,
        'New Delivery Assigned',
        'You have been assigned a delivery to ' || COALESCE(NEW.delivery_address, 'unknown address'),
        'info', 'dispatch', NEW.id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dispatches') THEN

    DROP TRIGGER IF EXISTS trg_notify_driver_assignment ON public.dispatches;
    CREATE TRIGGER trg_notify_driver_assignment
      AFTER INSERT OR UPDATE OF status ON public.dispatches
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_driver_assignment();
  END IF;
END $$;

-- 6. Notify customer on delivery completed
CREATE OR REPLACE FUNCTION public.notify_delivery_complete()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NEW.status = 'delivered' AND (OLD.status IS DISTINCT FROM 'delivered') THEN
    SELECT user_id INTO v_user_id FROM public.orders WHERE id = NEW.order_id;

    IF v_user_id IS NOT NULL THEN
      PERFORM public.send_notification(v_user_id,
        'Delivery Complete',
        'Your order has been delivered. Please confirm receipt.',
        'success', 'order', NEW.order_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dispatches') THEN
    DROP TRIGGER IF EXISTS trg_notify_delivery_complete ON public.dispatches;
    CREATE TRIGGER trg_notify_delivery_complete
      AFTER UPDATE OF status ON public.dispatches
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_delivery_complete();
  END IF;
END $$;

-- 7. Notify low stock to suppliers
CREATE OR REPLACE FUNCTION public.notify_low_stock()
RETURNS TRIGGER AS $$
DECLARE
  v_supplier_user_id UUID;
  v_product_title VARCHAR;
BEGIN
  -- Check if stock dropped below reorder level
  IF NEW.quantity_on_hand < COALESCE(NEW.reorder_level, 10) AND
     (OLD.quantity_on_hand IS NULL OR OLD.quantity_on_hand >= COALESCE(OLD.reorder_level, 10)) THEN

    SELECT title INTO v_product_title FROM public.products WHERE id = NEW.product_id;

    INSERT INTO public.notification_logs (user_id, channel, title, message, type, entity_type, entity_id)
    SELECT s.user_id, 'in_app', 'Low Stock Alert',
      v_product_title || ' is running low (' || NEW.quantity_on_hand || ' remaining). Please restock.',
      'warning', 'inventory', NEW.product_id
    FROM public.suppliers s
    JOIN public.products p ON p.supplier_id = s.id
    WHERE p.id = NEW.product_id AND s.user_id IS NOT NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'inventory') THEN
    DROP TRIGGER IF EXISTS trg_notify_low_stock ON public.inventory;
    CREATE TRIGGER trg_notify_low_stock
      AFTER UPDATE OF quantity_on_hand ON public.inventory
      FOR EACH ROW
      EXECUTE FUNCTION public.notify_low_stock();
  END IF;
END $$;

-- 8. RPC to mark notifications as read
CREATE OR REPLACE FUNCTION public.mark_notifications_read(p_notification_ids UUID[])
RETURNS JSONB AS $$
BEGIN
  UPDATE public.notification_logs
  SET read = TRUE
  WHERE id = ANY(p_notification_ids) AND user_id = auth.uid();

  RETURN jsonb_build_object('success', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. RPC to get unread count
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INT AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.notification_logs
  WHERE user_id = auth.uid() AND read = FALSE;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- 10. Enable realtime
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'notification_logs') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_logs;
  END IF;
END $$;
