-- ==========================================
-- FINANCE ERP - PHASE 1
-- Tables: Invoices, Payments, Expenses
-- ==========================================

-- 1. Create finance_invoices table
CREATE TABLE IF NOT EXISTS public.finance_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    order_id BIGINT REFERENCES public.orders(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    vat DECIMAL(12, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    balance DECIMAL(12, 2) NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- Draft, Sent, Partially Paid, Paid, Overdue, Cancelled
    due_date DATE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create finance_payments table
CREATE TABLE IF NOT EXISTS public.finance_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID REFERENCES public.finance_invoices(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount DECIMAL(12, 2) NOT NULL,
    method VARCHAR(50) NOT NULL, -- Cash, Bank, M-Pesa, Card
    reference VARCHAR(100),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    recorded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create finance_expenses table
CREATE TABLE IF NOT EXISTS public.finance_expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL, -- Utilities, Office, Marketing, Salary, Maintenance, Transport, Miscellaneous
    vendor VARCHAR(255),
    description TEXT,
    amount DECIMAL(12, 2) NOT NULL,
    receipt_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- Draft, Submitted, Approved, Rejected, Paid
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES auth.users(id),
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.finance_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_expenses ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has finance access
CREATE OR REPLACE FUNCTION public.is_finance_user()
RETURNS BOOLEAN AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    RETURN user_role IN ('Admin', 'super_admin', 'Finance_Director', 'Finance_Manager', 'Accountant', 'Finance_Officer', 'Auditor');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_finance_admin()
RETURNS BOOLEAN AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    RETURN user_role IN ('Admin', 'super_admin', 'Finance_Director', 'Finance_Manager', 'Accountant');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Policies for Invoices
CREATE POLICY "Finance users can view invoices"
ON public.finance_invoices FOR SELECT
USING (public.is_finance_user());

CREATE POLICY "Finance admins can manage invoices"
ON public.finance_invoices FOR ALL
USING (public.is_finance_admin());

-- Policies for Payments
CREATE POLICY "Finance users can view payments"
ON public.finance_payments FOR SELECT
USING (public.is_finance_user());

CREATE POLICY "Finance admins can manage payments"
ON public.finance_payments FOR ALL
USING (public.is_finance_admin());

-- Policies for Expenses
CREATE POLICY "Finance users can view expenses"
ON public.finance_expenses FOR SELECT
USING (public.is_finance_user());

CREATE POLICY "Finance admins can manage expenses"
ON public.finance_expenses FOR ALL
USING (public.is_finance_admin());

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to update updated_at timestamp
-- Check if triggers already exist in Supabase or use DO blocks to avoid errors, but OR REPLACE usually handles functions. For triggers we use DROP IF EXISTS first.
DROP TRIGGER IF EXISTS update_finance_invoices_updated_at ON public.finance_invoices;
CREATE TRIGGER update_finance_invoices_updated_at
BEFORE UPDATE ON public.finance_invoices
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_finance_payments_updated_at ON public.finance_payments;
CREATE TRIGGER update_finance_payments_updated_at
BEFORE UPDATE ON public.finance_payments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_finance_expenses_updated_at ON public.finance_expenses;
CREATE TRIGGER update_finance_expenses_updated_at
BEFORE UPDATE ON public.finance_expenses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
