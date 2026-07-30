-- ==========================================
-- FINANCE ERP - PHASE 1 UPDATES
-- Refinements for architecture, automation, and logging
-- ==========================================

-- 1. Modify finance_invoices table
ALTER TABLE public.finance_invoices DROP COLUMN IF EXISTS order_id;
ALTER TABLE public.finance_invoices ADD COLUMN order_id BIGINT;
-- Note: Assuming public.orders exists and has id BIGINT
-- ALTER TABLE public.finance_invoices ADD CONSTRAINT fk_invoice_order FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;

ALTER TABLE public.finance_invoices ALTER COLUMN status SET DEFAULT 'Pending';
ALTER TABLE public.finance_invoices ALTER COLUMN invoice_number DROP NOT NULL;

-- 2. Invoice Numbering Sequence
CREATE SEQUENCE IF NOT EXISTS finance_invoice_seq START 1;

CREATE OR REPLACE FUNCTION generate_finance_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('finance_invoice_seq')::TEXT, 6, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_finance_invoice_number ON public.finance_invoices;
CREATE TRIGGER set_finance_invoice_number
BEFORE INSERT ON public.finance_invoices
FOR EACH ROW WHEN (NEW.invoice_number IS NULL)
EXECUTE FUNCTION generate_finance_invoice_number();


-- 3. Trigger: orders -> finance_invoices (Auto-generate invoice)
CREATE OR REPLACE FUNCTION auto_create_finance_invoice()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Delivered' AND OLD.status IS DISTINCT FROM 'Delivered' THEN
        INSERT INTO public.finance_invoices (customer_id, order_id, amount, balance, status, due_date)
        VALUES (NEW.user_id, NEW.id, NEW.total_amount, NEW.total_amount, 'Pending', CURRENT_DATE + INTERVAL '14 days');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_order_delivered_invoice ON public.orders;
CREATE TRIGGER trigger_order_delivered_invoice
AFTER UPDATE OF status ON public.orders
FOR EACH ROW
EXECUTE FUNCTION auto_create_finance_invoice();


-- 4. Trigger: finance_payments -> finance_invoices (Auto-update balance)
CREATE OR REPLACE FUNCTION update_invoice_balance_on_payment()
RETURNS TRIGGER AS $$
DECLARE
    total_paid DECIMAL(12,2);
    inv_amount DECIMAL(12,2);
    new_balance DECIMAL(12,2);
    target_invoice_id UUID;
BEGIN
    target_invoice_id := COALESCE(NEW.invoice_id, OLD.invoice_id);

    -- Calculate total payments for this invoice
    SELECT COALESCE(SUM(amount), 0) INTO total_paid FROM public.finance_payments WHERE invoice_id = target_invoice_id;
    
    -- Get invoice amount
    SELECT amount INTO inv_amount FROM public.finance_invoices WHERE id = target_invoice_id;
    
    -- Calculate new balance
    new_balance := inv_amount - total_paid;
    
    -- Update invoice status and balance
    UPDATE public.finance_invoices 
    SET 
        balance = new_balance,
        status = CASE 
            WHEN new_balance <= 0 THEN 'Paid'
            WHEN new_balance > 0 AND new_balance < inv_amount THEN 'Partially Paid'
            ELSE status
        END
    WHERE id = target_invoice_id;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_payment_updates_invoice_insupd ON public.finance_payments;
CREATE TRIGGER trigger_payment_updates_invoice_insupd
AFTER INSERT OR UPDATE OF amount ON public.finance_payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_balance_on_payment();

DROP TRIGGER IF EXISTS trigger_payment_updates_invoice_del ON public.finance_payments;
CREATE TRIGGER trigger_payment_updates_invoice_del
AFTER DELETE ON public.finance_payments
FOR EACH ROW
EXECUTE FUNCTION update_invoice_balance_on_payment();


-- 5. Audit Logs
CREATE TABLE IF NOT EXISTS public.finance_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_value JSONB,
    new_value JSONB,
    session_id VARCHAR(255),
    browser VARCHAR(255),
    os VARCHAR(255),
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION log_finance_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.finance_audit_logs (user_id, action, table_name, record_id, old_value, new_value)
    VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD)::JSONB ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::JSONB ELSE NULL END
    );
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_invoices ON public.finance_invoices;
CREATE TRIGGER log_invoices AFTER INSERT OR UPDATE OR DELETE ON public.finance_invoices FOR EACH ROW EXECUTE FUNCTION log_finance_action();

DROP TRIGGER IF EXISTS log_payments ON public.finance_payments;
CREATE TRIGGER log_payments AFTER INSERT OR UPDATE OR DELETE ON public.finance_payments FOR EACH ROW EXECUTE FUNCTION log_finance_action();

DROP TRIGGER IF EXISTS log_expenses ON public.finance_expenses;
CREATE TRIGGER log_expenses AFTER INSERT OR UPDATE OR DELETE ON public.finance_expenses FOR EACH ROW EXECUTE FUNCTION log_finance_action();


-- 6. Notifications
CREATE TABLE IF NOT EXISTS public.finance_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- 7. Advanced RLS Policies
-- First, drop existing policies created in 014 to replace them
DROP POLICY IF EXISTS "Finance users can view invoices" ON public.finance_invoices;
DROP POLICY IF EXISTS "Finance admins can manage invoices" ON public.finance_invoices;
DROP POLICY IF EXISTS "Finance users can view payments" ON public.finance_payments;
DROP POLICY IF EXISTS "Finance admins can manage payments" ON public.finance_payments;
DROP POLICY IF EXISTS "Finance users can view expenses" ON public.finance_expenses;
DROP POLICY IF EXISTS "Finance admins can manage expenses" ON public.finance_expenses;

-- Check function
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS VARCHAR AS $$
DECLARE
    user_role VARCHAR;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Invoices Policies
CREATE POLICY "Finance Read Invoices" ON public.finance_invoices FOR SELECT USING (public.get_user_role() IN ('Admin', 'super_admin', 'Finance_Director', 'Finance_Manager', 'Accountant', 'Finance_Officer', 'Auditor'));
CREATE POLICY "Finance Insert Invoices" ON public.finance_invoices FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin', 'Finance_Director', 'Finance_Manager', 'Accountant', 'Finance_Officer'));
CREATE POLICY "Finance Update Invoices" ON public.finance_invoices FOR UPDATE USING (public.get_user_role() IN ('super_admin', 'Finance_Director', 'Finance_Manager', 'Accountant'));
CREATE POLICY "Finance Delete Invoices" ON public.finance_invoices FOR DELETE USING (public.get_user_role() IN ('super_admin', 'Finance_Director', 'Finance_Manager'));

-- Payments Policies
CREATE POLICY "Finance Read Payments" ON public.finance_payments FOR SELECT USING (public.get_user_role() IN ('Admin', 'super_admin', 'Finance_Director', 'Finance_Manager', 'Accountant', 'Finance_Officer', 'Auditor'));
CREATE POLICY "Finance Insert Payments" ON public.finance_payments FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin', 'Finance_Director', 'Finance_Manager', 'Accountant', 'Finance_Officer'));
CREATE POLICY "Finance Update Payments" ON public.finance_payments FOR UPDATE USING (public.get_user_role() IN ('super_admin', 'Finance_Director', 'Finance_Manager', 'Accountant'));
CREATE POLICY "Finance Delete Payments" ON public.finance_payments FOR DELETE USING (public.get_user_role() IN ('super_admin', 'Finance_Director', 'Finance_Manager'));

-- Expenses Policies
CREATE POLICY "Finance Read Expenses" ON public.finance_expenses FOR SELECT USING (public.get_user_role() IN ('Admin', 'super_admin', 'Finance_Director', 'Finance_Manager', 'Accountant', 'Finance_Officer', 'Auditor'));
CREATE POLICY "Finance Insert Expenses" ON public.finance_expenses FOR INSERT WITH CHECK (public.get_user_role() IN ('super_admin', 'Finance_Director', 'Finance_Manager', 'Accountant', 'Finance_Officer'));
CREATE POLICY "Finance Update Expenses" ON public.finance_expenses FOR UPDATE USING (public.get_user_role() IN ('super_admin', 'Finance_Director', 'Finance_Manager', 'Accountant'));
CREATE POLICY "Finance Delete Expenses" ON public.finance_expenses FOR DELETE USING (public.get_user_role() IN ('super_admin', 'Finance_Director', 'Finance_Manager'));

-- Audit Logs Policy
ALTER TABLE public.finance_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auditors and Admins can view logs" ON public.finance_audit_logs FOR SELECT USING (public.get_user_role() IN ('Admin', 'super_admin', 'Finance_Director', 'Auditor'));

-- Notifications Policy
ALTER TABLE public.finance_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.finance_notifications FOR SELECT USING (user_id = auth.uid() OR public.get_user_role() IN ('Admin', 'super_admin', 'Finance_Director', 'Finance_Manager', 'Accountant', 'Finance_Officer', 'Auditor'));
