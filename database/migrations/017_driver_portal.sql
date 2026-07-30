-- ============================================================
--  NEXUS TECHHUB — ERP Business Modules Migration
--  Migration: 017_driver_portal.sql
-- ============================================================

-- 1. driver_assignments table
CREATE TABLE IF NOT EXISTS public.driver_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'picking_up', 'in_transit', 'delivered', 'failed', 'returned')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_driver_assignments_driver ON public.driver_assignments(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_order ON public.driver_assignments(order_id);
CREATE INDEX IF NOT EXISTS idx_driver_assignments_status ON public.driver_assignments(status);

-- Enable RLS
ALTER TABLE public.driver_assignments ENABLE ROW LEVEL SECURITY;

-- Driver can view their own assignments
CREATE POLICY "Drivers can view their own assignments" 
  ON public.driver_assignments FOR SELECT 
  USING (driver_id = auth.uid());

-- Driver can update their own assignments
CREATE POLICY "Drivers can update their own assignments" 
  ON public.driver_assignments FOR UPDATE 
  USING (driver_id = auth.uid());

-- Admin/Dispatch can do all
CREATE POLICY "Admin/Dispatch full access on driver_assignments" 
  ON public.driver_assignments FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('Admin', 'super_admin', 'Manager', 'Dispatch', 'Dispatch_Manager')
    )
  );


-- 2. delivery_events table (Audit log of delivery statuses)
CREATE TABLE IF NOT EXISTS public.delivery_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  driver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('assigned', 'picked_up', 'in_transit', 'delivered', 'delayed', 'customer_unavailable', 'wrong_address', 'returned', 'failed')),
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_events_order ON public.delivery_events(order_id);
CREATE INDEX IF NOT EXISTS idx_delivery_events_driver ON public.delivery_events(driver_id);

-- Enable RLS
ALTER TABLE public.delivery_events ENABLE ROW LEVEL SECURITY;

-- Driver can view their own events
CREATE POLICY "Drivers can view their own events" 
  ON public.delivery_events FOR SELECT 
  USING (driver_id = auth.uid());

-- Driver can insert events for themselves
CREATE POLICY "Drivers can insert their own events" 
  ON public.delivery_events FOR INSERT 
  WITH CHECK (driver_id = auth.uid());

-- Admin/Dispatch can do all
CREATE POLICY "Admin/Dispatch full access on delivery_events" 
  ON public.delivery_events FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('Admin', 'super_admin', 'Manager', 'Dispatch', 'Dispatch_Manager')
    )
  );

-- Customer can view events for their orders
CREATE POLICY "Customers can view events for their orders" 
  ON public.delivery_events FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE id = delivery_events.order_id AND customer_id = auth.uid()
    )
  );

-- 3. Extend orders table to easily track current driver (optional but helpful for fast queries)
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
