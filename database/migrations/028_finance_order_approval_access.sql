-- ============================================================
-- MIGRATION 028: Finance order approval access (RLS + FK)
-- Lets the finance team SEE orders awaiting approval so the
-- Approvals page and Finance dashboard actually show pending
-- orders until finance approves them.
--
-- Run this whole file in the Supabase SQL Editor.
-- ============================================================

-- 1. FK: orders.user_id -> profiles(id)
--    PostgREST needs this direct FK to embed `profiles:user_id`
--    in financeService.getPendingApprovals / getOrderInvoice.
--    Without it those queries fail with PGRST200.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'fk_orders_user_profiles' AND conrelid = 'public.orders'::regclass
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT fk_orders_user_profiles
      FOREIGN KEY (user_id) REFERENCES public.profiles(id);
  END IF;
END $$;

-- 2. Finance roles can read orders (pending approvals + order details)
DROP POLICY IF EXISTS "Finance can read orders" ON public.orders;
CREATE POLICY "Finance can read orders" ON public.orders
  FOR SELECT USING (
    public.get_user_role() IN ('Admin','super_admin','Manager','Finance_Director','Finance_Manager','Accountant','Finance_Officer','Auditor')
  );

-- 3. Finance roles can read payments (shown in the approval review panel)
DROP POLICY IF EXISTS "Finance can read payments" ON public.payments;
CREATE POLICY "Finance can read payments" ON public.payments
  FOR SELECT USING (
    public.get_user_role() IN ('Admin','super_admin','Manager','Finance_Director','Finance_Manager','Accountant','Finance_Officer','Auditor')
  );

-- 4. Finance roles can read finance_approvals history
--    (the 019 policy only allowed Finance_Officer)
DROP POLICY IF EXISTS "Finance can read approvals" ON public.finance_approvals;
CREATE POLICY "Finance can read approvals" ON public.finance_approvals
  FOR SELECT USING (
    public.get_user_role() IN ('Admin','super_admin','Manager','Finance_Director','Finance_Manager','Accountant','Finance_Officer','Auditor')
  );

-- 5. Finance roles can read invoices
DROP POLICY IF EXISTS "Finance can read invoices" ON public.invoices;
CREATE POLICY "Finance can read invoices" ON public.invoices
  FOR SELECT USING (
    public.get_user_role() IN ('Admin','super_admin','Manager','Finance_Director','Finance_Manager','Accountant','Finance_Officer','Auditor')
  );

-- 6. Finance roles can read customer profiles (name / contact on approvals)
DROP POLICY IF EXISTS "Finance can read profiles" ON public.profiles;
CREATE POLICY "Finance can read profiles" ON public.profiles
  FOR SELECT USING (
    public.get_user_role() IN ('Admin','super_admin','Manager','Finance_Director','Finance_Manager','Accountant','Finance_Officer','Auditor')
  );

-- 7. Finance roles can read order_items (Order Items panel on the review)
DROP POLICY IF EXISTS "Finance can read order items" ON public.order_items;
CREATE POLICY "Finance can read order items" ON public.order_items
  FOR SELECT USING (
    public.get_user_role() IN ('Admin','super_admin','Manager','Finance_Director','Finance_Manager','Accountant','Finance_Officer','Auditor')
  );
