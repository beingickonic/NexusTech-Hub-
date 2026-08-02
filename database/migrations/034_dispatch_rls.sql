-- ============================================================
-- MIGRATION 034: Dispatch Role RLS Access
--
-- Root cause (verified live): RLS is enabled on orders/order_items
-- (migration 016). Finance (028) and Inventory (030) got SELECT
-- policies, Drivers got scoped policies (033), but NOTHING granted
-- the Dispatch_Officer role SELECT on orders / order_items /
-- customer profiles. The Dispatch Portal reads the orders table
-- (fallback mode — the `dispatches` table is absent in this DB),
-- so the real Dispatch Officer saw ZERO orders while the
-- service-role key saw all of them.
--
-- This grants the Dispatch role ONLY the access the portal needs:
--   SELECT orders / order_items / profiles  -> the dispatch queue
--   UPDATE orders                            -> assign driver, set
--      Assigned / Out for Delivery / Delivered in the fallback flow
-- Roles: Admin, super_admin, Manager, Dispatch_Officer
-- (matches the frontend DispatchRoute allowlist).
-- ============================================================

-- 1. Dispatch can read orders (the Ready-for-Dispatch queue)
DROP POLICY IF EXISTS "Dispatch can read orders" ON public.orders;
CREATE POLICY "Dispatch can read orders" ON public.orders
  FOR SELECT USING (
    public.get_user_role() IN ('Admin','super_admin','Manager','Dispatch_Officer')
  );

-- 2. Dispatch can update orders (assign driver + move status through fulfillment)
DROP POLICY IF EXISTS "Dispatch can update orders" ON public.orders;
CREATE POLICY "Dispatch can update orders" ON public.orders
  FOR UPDATE USING (
    public.get_user_role() IN ('Admin','super_admin','Manager','Dispatch_Officer')
  )
  WITH CHECK (
    public.get_user_role() IN ('Admin','super_admin','Manager','Dispatch_Officer')
  );

-- 3. Dispatch can read order items (line items shown in the queue)
DROP POLICY IF EXISTS "Dispatch can read order items" ON public.order_items;
CREATE POLICY "Dispatch can read order items" ON public.order_items
  FOR SELECT USING (
    public.get_user_role() IN ('Admin','super_admin','Manager','Dispatch_Officer')
  );

-- 4. Dispatch can read customer profiles (name/phone/address in the queue)
DROP POLICY IF EXISTS "Dispatch can read profiles" ON public.profiles;
CREATE POLICY "Dispatch can read profiles" ON public.profiles
  FOR SELECT USING (
    public.get_user_role() IN ('Admin','super_admin','Manager','Dispatch_Officer')
  );
