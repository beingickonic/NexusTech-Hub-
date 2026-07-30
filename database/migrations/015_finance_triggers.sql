-- ==========================================
-- FINANCE ERP - AUTOMATION TRIGGERS
-- ==========================================

-- Trigger to auto-generate a finance invoice when an order is Delivered
CREATE OR REPLACE FUNCTION public.auto_generate_invoice_on_delivery()
RETURNS TRIGGER AS $$
DECLARE
    new_invoice_number VARCHAR;
    invoice_exists BOOLEAN;
BEGIN
    -- Only act when status changes to 'Delivered'
    IF NEW.status = 'Delivered' AND (OLD.status IS DISTINCT FROM 'Delivered') THEN
        
        -- Check if an invoice already exists for this order to prevent duplicates
        SELECT EXISTS(
            SELECT 1 FROM public.finance_invoices WHERE order_id = NEW.id
        ) INTO invoice_exists;

        IF NOT invoice_exists THEN
            -- Generate a simple invoice number based on order ID
            new_invoice_number := 'INV-ORD-' || NEW.id || '-' || extract(epoch from now())::int;

            -- Insert the invoice
            INSERT INTO public.finance_invoices (
                invoice_number,
                customer_id,
                order_id,
                amount,
                balance,
                status,
                due_date
            ) VALUES (
                new_invoice_number,
                NEW.user_id,
                NEW.id,
                NEW.total_amount,
                NEW.total_amount,
                'Sent', -- Initial status for auto-generated invoices
                CURRENT_DATE + INTERVAL '14 days' -- Default due date 14 days from delivery
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS order_delivered_invoice_trigger ON public.orders;
CREATE TRIGGER order_delivered_invoice_trigger
AFTER UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.auto_generate_invoice_on_delivery();
