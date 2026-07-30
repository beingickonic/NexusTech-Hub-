-- ============================================================
--  NEXUS TECHHUB -- Simplified Checkout Migration
--  Migration: 011_simplified_checkout.sql
-- ============================================================

-- 1. Add address fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS address VARCHAR(255),
  ADD COLUMN IF NOT EXISTS city VARCHAR(100),
  ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20);

-- 2. Update orders.status constraint
DO $$ 
DECLARE 
  r RECORD;
BEGIN 
  FOR r IN (
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.orders'::regclass AND contype = 'c' AND conname LIKE '%status%'
  ) LOOP 
    EXECUTE 'ALTER TABLE public.orders DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP; 
END $$;

ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('Pending', 'Awaiting Payment', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded', 'Pending Payment Verification', 'Payment Failed'));

-- 3. Update payments.status constraint
DO $$ 
DECLARE 
  r RECORD;
BEGIN 
  FOR r IN (
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.payments'::regclass AND contype = 'c' AND conname LIKE '%status%'
  ) LOOP 
    EXECUTE 'ALTER TABLE public.payments DROP CONSTRAINT ' || quote_ident(r.conname);
  END LOOP; 
END $$;

ALTER TABLE public.payments ADD CONSTRAINT payments_status_check
  CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'cancelled', 'refunded', 'rejected'));

SELECT '011_simplified_checkout.sql completed' AS result;
