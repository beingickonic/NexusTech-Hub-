-- ============================================================
-- MIGRATION 020: Driver Delivery Workflow
-- Adds GPS tracking, delivery proofs, driver accept/reject
-- ============================================================

-- 1. Add driver workflow columns to dispatches (only if table exists)
DO $block$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dispatches') THEN
    EXECUTE 'ALTER TABLE public.dispatches ADD COLUMN IF NOT EXISTS driver_accepted_at TIMESTAMPTZ';
    EXECUTE 'ALTER TABLE public.dispatches ADD COLUMN IF NOT EXISTS driver_rejected_at TIMESTAMPTZ';
    EXECUTE 'ALTER TABLE public.dispatches ADD COLUMN IF NOT EXISTS driver_rejected_reason TEXT';
    EXECUTE 'ALTER TABLE public.dispatches ADD COLUMN IF NOT EXISTS delivery_notes TEXT';
    EXECUTE 'ALTER TABLE public.dispatches ADD COLUMN IF NOT EXISTS customer_notes TEXT';
    EXECUTE 'ALTER TABLE public.dispatches ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ';
  END IF;
END $block$;

-- 2. Create delivery_proofs table (dispatch FK conditional)
DO $block$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'delivery_proofs') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dispatches') THEN
      CREATE TABLE public.delivery_proofs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        dispatch_id UUID REFERENCES public.dispatches(id) ON DELETE CASCADE,
        order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
        driver_id UUID REFERENCES public.profiles(id),
        photo_urls JSONB DEFAULT '[]'::JSONB,
        signature_url TEXT,
        customer_name TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    ELSE
      CREATE TABLE public.delivery_proofs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        dispatch_id UUID,
        order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
        driver_id UUID REFERENCES public.profiles(id),
        photo_urls JSONB DEFAULT '[]'::JSONB,
        signature_url TEXT,
        customer_name TEXT,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    END IF;
  END IF;
END $block$;

CREATE INDEX IF NOT EXISTS idx_delivery_proofs_dispatch_id ON public.delivery_proofs(dispatch_id);
CREATE INDEX IF NOT EXISTS idx_delivery_proofs_order_id ON public.delivery_proofs(order_id);

ALTER TABLE public.delivery_proofs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'delivery_proofs' AND policyname = 'Delivery proofs access') THEN
    CREATE POLICY "Delivery proofs access" ON public.delivery_proofs
      FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'super_admin', 'Driver', 'Dispatch_Officer', 'Manager'))
        OR auth.uid() IN (SELECT user_id FROM public.orders WHERE id = order_id)
      );
  END IF;
END $$;

-- 3. Create enhanced delivery_events with GPS tracking (dispatch FK conditional)
DO $block$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'delivery_events') THEN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dispatches') THEN
      CREATE TABLE public.delivery_events (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        dispatch_id UUID REFERENCES public.dispatches(id) ON DELETE CASCADE,
        order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
        driver_id UUID REFERENCES public.profiles(id),
        event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
          'accepted', 'rejected', 'picked_up', 'in_transit', 'gps_update',
          'photo_taken', 'signature_captured', 'delivered', 'failed',
          'customer_unavailable', 'wrong_address', 'returned', 'notes'
        )),
        location_lat DECIMAL(10,7),
        location_lng DECIMAL(10,7),
        location_name TEXT,
        photo_url TEXT,
        notes TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    ELSE
      CREATE TABLE public.delivery_events (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        dispatch_id UUID,
        order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
        driver_id UUID REFERENCES public.profiles(id),
        event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
          'accepted', 'rejected', 'picked_up', 'in_transit', 'gps_update',
          'photo_taken', 'signature_captured', 'delivered', 'failed',
          'customer_unavailable', 'wrong_address', 'returned', 'notes'
        )),
        location_lat DECIMAL(10,7),
        location_lng DECIMAL(10,7),
        location_name TEXT,
        photo_url TEXT,
        notes TEXT,
        metadata JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    END IF;
  END IF;
END $block$;

CREATE INDEX IF NOT EXISTS idx_delivery_events_dispatch_id ON public.delivery_events(dispatch_id);
CREATE INDEX IF NOT EXISTS idx_delivery_events_order_id ON public.delivery_events(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_events_created_at ON public.delivery_events(created_at DESC);

ALTER TABLE public.delivery_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'delivery_events' AND policyname = 'Delivery events access') THEN
    CREATE POLICY "Delivery events access" ON public.delivery_events
      FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'super_admin', 'Driver', 'Dispatch_Officer', 'Manager'))
        OR auth.uid() IN (SELECT user_id FROM public.orders WHERE id = order_id)
      );
  END IF;
END $$;

-- 4. RPC: driver_accept_delivery
CREATE OR REPLACE FUNCTION public.driver_accept_delivery(p_dispatch_id UUID, p_driver_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_dispatch RECORD;
BEGIN
  SELECT * INTO v_dispatch FROM public.dispatches WHERE id = p_dispatch_id FOR UPDATE;

  IF v_dispatch.status NOT IN ('pending', 'assigned') THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Dispatch is not in assignable status');
  END IF;

  UPDATE public.dispatches
  SET status = 'accepted',
      driver_accepted_at = NOW(),
      updated_at = NOW()
  WHERE id = p_dispatch_id;

  UPDATE public.orders
  SET status = 'Assigned', driver_id = p_driver_id
  WHERE id = v_dispatch.order_id;

  INSERT INTO public.delivery_events (dispatch_id, order_id, driver_id, event_type)
  VALUES (p_dispatch_id, v_dispatch.order_id, p_driver_id, 'accepted');

  RETURN jsonb_build_object('success', TRUE, 'status', 'accepted');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. RPC: driver_reject_delivery
CREATE OR REPLACE FUNCTION public.driver_reject_delivery(p_dispatch_id UUID, p_driver_id UUID, p_reason TEXT)
RETURNS JSONB AS $$
DECLARE
  v_dispatch RECORD;
BEGIN
  SELECT * INTO v_dispatch FROM public.dispatches WHERE id = p_dispatch_id FOR UPDATE;

  IF v_dispatch.status NOT IN ('assigned') THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Dispatch must be in assigned status');
  END IF;

  UPDATE public.dispatches
  SET status = 'pending',
      driver_id = NULL,
      driver_rejected_at = NOW(),
      driver_rejected_reason = p_reason,
      updated_at = NOW()
  WHERE id = p_dispatch_id;

  INSERT INTO public.delivery_events (dispatch_id, order_id, driver_id, event_type, notes)
  VALUES (p_dispatch_id, v_dispatch.order_id, p_driver_id, 'rejected', p_reason);

  RETURN jsonb_build_object('success', TRUE, 'status', 'pending', 'message', 'Delivery unassigned');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RPC: driver_start_delivery
CREATE OR REPLACE FUNCTION public.driver_start_delivery(p_dispatch_id UUID, p_driver_id UUID, p_lat DECIMAL DEFAULT NULL, p_lng DECIMAL DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
  v_dispatch RECORD;
BEGIN
  SELECT * INTO v_dispatch FROM public.dispatches WHERE id = p_dispatch_id FOR UPDATE;

  IF v_dispatch.driver_id IS DISTINCT FROM p_driver_id THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'This delivery is not assigned to you');
  END IF;

  IF v_dispatch.status = 'accepted' THEN
    UPDATE public.dispatches
    SET status = 'picked_up', updated_at = NOW()
    WHERE id = p_dispatch_id;

    UPDATE public.orders SET status = 'Picking' WHERE id = v_dispatch.order_id;
  END IF;

  INSERT INTO public.delivery_events (dispatch_id, order_id, driver_id, event_type, location_lat, location_lng)
  VALUES (p_dispatch_id, v_dispatch.order_id, p_driver_id, 'picked_up', p_lat, p_lng);

  RETURN jsonb_build_object('success', TRUE, 'status', 'picked_up');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RPC: driver_record_gps
CREATE OR REPLACE FUNCTION public.driver_record_gps(p_dispatch_id UUID, p_driver_id UUID, p_lat DECIMAL, p_lng DECIMAL, p_location_name TEXT DEFAULT NULL)
RETURNS JSONB AS $$
BEGIN
  INSERT INTO public.delivery_events (dispatch_id, order_id, driver_id, event_type, location_lat, location_lng, location_name)
  SELECT p_dispatch_id, order_id, p_driver_id, 'gps_update', p_lat, p_lng, p_location_name
  FROM public.dispatches WHERE id = p_dispatch_id;

  RETURN jsonb_build_object('success', TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. RPC: driver_complete_delivery
CREATE OR REPLACE FUNCTION public.driver_complete_delivery(
  p_dispatch_id UUID,
  p_driver_id UUID,
  p_photo_urls JSONB DEFAULT '[]'::JSONB,
  p_signature_url TEXT DEFAULT NULL,
  p_customer_name TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_lat DECIMAL DEFAULT NULL,
  p_lng DECIMAL DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_dispatch RECORD;
  v_order_id UUID;
BEGIN
  SELECT * INTO v_dispatch FROM public.dispatches WHERE id = p_dispatch_id FOR UPDATE;

  IF v_dispatch.driver_id IS DISTINCT FROM p_driver_id THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'This delivery is not assigned to you');
  END IF;

  IF v_dispatch.status = 'delivered' THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Already marked as delivered');
  END IF;

  v_order_id := v_dispatch.order_id;

  UPDATE public.dispatches
  SET status = 'delivered',
      delivered_at = NOW(),
      delivery_notes = COALESCE(p_notes, delivery_notes),
      updated_at = NOW()
  WHERE id = p_dispatch_id;

  UPDATE public.orders
  SET status = 'Delivered',
      dispatched_at = COALESCE(dispatched_at, NOW())
  WHERE id = v_order_id;

  INSERT INTO public.delivery_events (dispatch_id, order_id, driver_id, event_type, location_lat, location_lng, notes)
  VALUES (p_dispatch_id, v_order_id, p_driver_id, 'delivered', p_lat, p_lng, p_notes);

  INSERT INTO public.delivery_proofs (dispatch_id, order_id, driver_id, photo_urls, signature_url, customer_name, notes)
  VALUES (p_dispatch_id, v_order_id, p_driver_id, p_photo_urls, p_signature_url, p_customer_name, p_notes);

  RETURN jsonb_build_object('success', TRUE, 'status', 'delivered', 'order_id', v_order_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. RPC: driver_report_failure
CREATE OR REPLACE FUNCTION public.driver_report_failure(
  p_dispatch_id UUID,
  p_driver_id UUID,
  p_failure_type VARCHAR,
  p_notes TEXT,
  p_lat DECIMAL DEFAULT NULL,
  p_lng DECIMAL DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_dispatch RECORD;
BEGIN
  SELECT * INTO v_dispatch FROM public.dispatches WHERE id = p_dispatch_id FOR UPDATE;

  IF v_dispatch.driver_id IS DISTINCT FROM p_driver_id THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'This delivery is not assigned to you');
  END IF;

  UPDATE public.dispatches
  SET status = p_failure_type,
      delivery_notes = COALESCE(p_notes, delivery_notes),
      updated_at = NOW()
  WHERE id = p_dispatch_id;

  UPDATE public.orders
  SET status = CASE
    WHEN p_failure_type IN ('returned', 'wrong_address') THEN 'Cancelled'
    ELSE 'Out for Delivery'
  END
  WHERE id = v_dispatch.order_id;

  INSERT INTO public.delivery_events (dispatch_id, order_id, driver_id, event_type, location_lat, location_lng, notes)
  VALUES (p_dispatch_id, v_dispatch.order_id, p_driver_id, p_failure_type, p_lat, p_lng, p_notes);

  RETURN jsonb_build_object('success', TRUE, 'status', p_failure_type);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Enable realtime (conditional on table existence)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'delivery_events') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'delivery_events') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_events;
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'delivery_proofs') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'delivery_proofs') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.delivery_proofs;
    END IF;
  END IF;
END $$;
