-- ============================================================
-- MIGRATION 029: Invoice CRUD for finance
-- Enables create / edit / delete of customer invoices
-- from the Finance Invoices page.
-- ============================================================

-- 1. Display columns used by the invoices page (balance + due date)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS balance NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;

-- 2. Auto-generate invoice number on manual create
--    (verify_mock_payment supplies its own; manual creates leave it NULL)
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 4));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_invoice_number ON public.invoices;
CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION public.generate_invoice_number();

-- 3. RLS: finance roles can insert / update / delete invoices
DROP POLICY IF EXISTS "Finance can insert invoices" ON public.invoices;
CREATE POLICY "Finance can insert invoices" ON public.invoices
  FOR INSERT WITH CHECK (
    public.get_user_role() IN ('Admin','super_admin','Finance_Director','Finance_Manager','Accountant','Finance_Officer')
  );

DROP POLICY IF EXISTS "Finance can update invoices" ON public.invoices;
CREATE POLICY "Finance can update invoices" ON public.invoices
  FOR UPDATE USING (
    public.get_user_role() IN ('Admin','super_admin','Finance_Director','Finance_Manager','Accountant','Finance_Officer')
  );

DROP POLICY IF EXISTS "Finance can delete invoices" ON public.invoices;
CREATE POLICY "Finance can delete invoices" ON public.invoices
  FOR DELETE USING (
    public.get_user_role() IN ('Admin','super_admin','Finance_Director','Finance_Manager')
  );
