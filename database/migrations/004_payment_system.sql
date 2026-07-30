-- ============================================================
--  NEXUS TECHHUB — Migration 004: Payment System & RLS
--  Phases 1 & 2: Database Design and Security
-- ============================================================

-- 1. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,
  type        VARCHAR(50) DEFAULT 'info' 
              CHECK (type IN ('info', 'success', 'warning', 'error', 'order', 'payment', 'inventory')),
  is_read     BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. COUPONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            VARCHAR(50) UNIQUE NOT NULL,
  discount_type   VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_amount NUMERIC(12, 2) NOT NULL,
  min_spend       NUMERIC(12, 2) DEFAULT 0,
  max_uses        INT DEFAULT NULL,
  used_count      INT DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PAYMENT CALLBACKS TABLE (Raw M-Pesa Data)
CREATE TABLE IF NOT EXISTS public.payment_callbacks (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id          UUID REFERENCES public.payments(id) ON DELETE CASCADE,
  merchant_request_id VARCHAR(255),
  checkout_request_id VARCHAR(255) UNIQUE,
  result_code         INT,
  result_desc         TEXT,
  amount              NUMERIC(12, 2),
  mpesa_receipt       VARCHAR(100),
  phone_number        VARCHAR(50),
  transaction_date    TIMESTAMPTZ,
  raw_payload         JSONB,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REFUNDS TABLE
CREATE TABLE IF NOT EXISTS public.refunds (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id      UUID REFERENCES public.payments(id) ON DELETE CASCADE,
  order_id        UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount          NUMERIC(12, 2) NOT NULL,
  reason          TEXT,
  status          VARCHAR(50) DEFAULT 'pending' 
                  CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  processed_by    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 5. INVENTORY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.inventory_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id      UUID REFERENCES public.products(id) ON DELETE CASCADE,
  order_id        UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  change_amount   INT NOT NULL,
  reason          VARCHAR(100) NOT NULL CHECK (reason IN ('sale', 'restock', 'return', 'adjustment')),
  notes           TEXT,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread  ON public.notifications(user_id) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);

CREATE INDEX IF NOT EXISTS idx_payment_callbacks_checkout_id ON public.payment_callbacks(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_payment_callbacks_payment_id  ON public.payment_callbacks(payment_id);

CREATE INDEX IF NOT EXISTS idx_refunds_payment_id ON public.refunds(payment_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status     ON public.refunds(status);

CREATE INDEX IF NOT EXISTS idx_inventory_logs_product_id ON public.inventory_logs(product_id);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage notifications" ON public.notifications FOR ALL USING (get_my_role() IN ('Admin', 'Manager'));

-- COUPONS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL USING (get_my_role() IN ('Admin', 'Manager'));

-- PAYMENT CALLBACKS (Strictly system & admin only)
ALTER TABLE public.payment_callbacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view callbacks" ON public.payment_callbacks FOR SELECT USING (get_my_role() IN ('Admin', 'Manager'));

-- REFUNDS
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own refunds" ON public.refunds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage refunds" ON public.refunds FOR ALL USING (get_my_role() IN ('Admin', 'Manager'));

-- INVENTORY LOGS
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage inventory logs" ON public.inventory_logs FOR ALL USING (get_my_role() IN ('Admin', 'Manager'));

-- Ensure existing payments and orders tables have RLS enforced correctly for the payment flows
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
CREATE POLICY "Admins can view all payments" ON public.payments FOR SELECT USING (get_my_role() IN ('Admin', 'Manager'));
DROP POLICY IF EXISTS "Users can create payments" ON public.payments;
CREATE POLICY "Users can create payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can update payments" ON public.payments;
CREATE POLICY "Admins can update payments" ON public.payments FOR UPDATE USING (get_my_role() IN ('Admin', 'Manager'));

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = invoices.order_id AND orders.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Admins can view all invoices" ON public.invoices;
CREATE POLICY "Admins can view all invoices" ON public.invoices FOR SELECT USING (get_my_role() IN ('Admin', 'Manager'));
