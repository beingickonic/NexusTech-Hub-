-- =============================================================================
-- NexusTech-Hub — Initial Database Schema
-- Migration: 20260614000001_initial_schema.sql
--
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
--
-- Sections:
--   1. Extensions
--   2. Tables (dependency order: categories → products → profiles → ...)
--   3. Indexes
--   4. Row-Level Security (enable + policies per table)
--   5. Triggers  (profiles auto-create on auth.users insert)
--   6. Storage buckets
--   7. Seed data  (categories)
-- =============================================================================


-- =============================================================================
-- 1. EXTENSIONS
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- =============================================================================
-- 2. TABLES
-- =============================================================================

-- ----------------------------------------------------------------------------
-- 2.1  categories
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id          BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name        TEXT    NOT NULL UNIQUE,
  slug        TEXT    UNIQUE,
  description TEXT,
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.categories IS 'Product categories (Laptops, Smartphones, etc.)';


-- ----------------------------------------------------------------------------
-- 2.2  products
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT        NOT NULL,
  brand        TEXT,
  sku          TEXT        UNIQUE,
  price        NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  old_price    NUMERIC(12, 2) CHECK (old_price >= 0),
  stock        INTEGER     NOT NULL DEFAULT 0 CHECK (stock >= 0),
  short_desc   TEXT,
  description  TEXT,
  features     TEXT,                        -- comma/newline-separated list
  image_url    TEXT,
  category_id  BIGINT      REFERENCES public.categories(id) ON DELETE SET NULL,
  availability BOOLEAN     NOT NULL DEFAULT true,
  featured     BOOLEAN     NOT NULL DEFAULT false,
  new_arrival  BOOLEAN     NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.products IS 'Product catalogue';
COMMENT ON COLUMN public.products.features IS 'Bullet-point features, comma or newline delimited';


-- ----------------------------------------------------------------------------
-- 2.3  profiles
-- (mirrors auth.users 1-to-1; auto-created via trigger)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  fcm_token   TEXT,                         -- Firebase / push notification token
  role        TEXT        NOT NULL DEFAULT 'Customer'
                          CHECK (role IN ('Customer', 'Manager', 'Admin', 'super_admin')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Extended user profile; 1-to-1 with auth.users';


-- ----------------------------------------------------------------------------
-- 2.4  orders
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status         TEXT        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','processing','Paid','shipped','delivered','cancelled','refunded')),
  payment_status TEXT        NOT NULL DEFAULT 'unpaid'
                             CHECK (payment_status IN ('unpaid','paid','failed','refunded')),
  total_amount   NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
  -- Shipping snapshot (captured at time of order)
  shipping_name  TEXT,
  shipping_phone TEXT,
  shipping_address TEXT,
  shipping_city  TEXT,
  shipping_postal_code TEXT,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.orders IS 'Customer orders';


-- ----------------------------------------------------------------------------
-- 2.5  order_items
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID        REFERENCES public.products(id) ON DELETE SET NULL,
  quantity   INTEGER     NOT NULL CHECK (quantity > 0),
  price      NUMERIC(12, 2) NOT NULL CHECK (price >= 0),  -- price at time of purchase
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.order_items IS 'Line items belonging to an order';


-- ----------------------------------------------------------------------------
-- 2.6  cart_items
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cart_items (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity   INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

COMMENT ON TABLE public.cart_items IS 'Persistent shopping cart (server-side)';


-- ----------------------------------------------------------------------------
-- 2.7  wishlist
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.wishlist (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

COMMENT ON TABLE public.wishlist IS 'User wishlists';


-- ----------------------------------------------------------------------------
-- 2.8  payments
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id                    UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id              UUID        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id               UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  provider              TEXT        NOT NULL
                                    CHECK (provider IN ('mpesa','flutterwave','paypal','stripe','cash')),
  amount                NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  currency              TEXT        NOT NULL DEFAULT 'KES',
  status                TEXT        NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending','processing','paid','failed','cancelled','refunded')),
  transaction_reference TEXT,       -- M-Pesa CheckoutRequestID / receipt, PayPal order ID, etc.
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.payments IS 'Payment records; one per payment attempt';


-- ----------------------------------------------------------------------------
-- 2.9  payment_logs
-- (internal webhook/event audit trail — never exposed to end-users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payment_logs (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id UUID        REFERENCES public.payments(id) ON DELETE CASCADE,
  provider   TEXT        NOT NULL,
  event_type TEXT        NOT NULL,
  payload    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.payment_logs IS 'Raw webhook payloads from payment providers (audit log)';


-- ----------------------------------------------------------------------------
-- 2.10  invoices
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invoices (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id       UUID        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_number TEXT        NOT NULL UNIQUE,
  pdf_url        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.invoices IS 'Generated PDF invoices stored in Supabase Storage';


-- ----------------------------------------------------------------------------
-- 2.11  site_settings  (singleton row — id is always 1)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.site_settings (
  id                  INTEGER     PRIMARY KEY DEFAULT 1
                                  CHECK (id = 1),  -- enforce singleton
  store_name          TEXT        NOT NULL DEFAULT 'NexusTech Hub',
  contact_email       TEXT,
  contact_phone       TEXT,
  currency            TEXT        NOT NULL DEFAULT 'KES',
  theme_primary_color TEXT        NOT NULL DEFAULT '#FF724C',
  logo_url            TEXT,
  favicon_url         TEXT,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert the default singleton row
INSERT INTO public.site_settings (id) VALUES (1)
  ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.site_settings IS 'Global store settings (singleton row, id=1)';


-- =============================================================================
-- 3. INDEXES
-- =============================================================================

-- products
CREATE INDEX IF NOT EXISTS idx_products_category  ON public.products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured   ON public.products (featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_new_arrival ON public.products (new_arrival) WHERE new_arrival = true;
CREATE INDEX IF NOT EXISTS idx_products_availability ON public.products (availability);
CREATE INDEX IF NOT EXISTS idx_products_title_search ON public.products USING GIN (to_tsvector('english', title));

-- orders
CREATE INDEX IF NOT EXISTS idx_orders_user_id    ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);

-- order_items
CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON public.order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items (product_id);

-- cart_items
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items (user_id);

-- wishlist
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON public.wishlist (user_id);

-- payments
CREATE INDEX IF NOT EXISTS idx_payments_order_id   ON public.payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id    ON public.payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status     ON public.payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_tx_ref     ON public.payments (transaction_reference);

-- payment_logs
CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_id ON public.payment_logs (payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_created_at ON public.payment_logs (created_at DESC);

-- invoices
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON public.invoices (order_id);


-- =============================================================================
-- 4. ROW-LEVEL SECURITY
-- =============================================================================

-- Enable RLS on every table
ALTER TABLE public.categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;


-- ─── categories ──────────────────────────────────────────────────────────────

-- Everyone (including anon visitors) can read categories
CREATE POLICY "categories_select_public"
  ON public.categories FOR SELECT
  USING (true);

-- Only service_role can insert/update/delete (managed via Supabase dashboard or admin functions)
-- No extra policies needed — service_role bypasses RLS by default.


-- ─── products ────────────────────────────────────────────────────────────────

-- Public read (browsing the store)
CREATE POLICY "products_select_public"
  ON public.products FOR SELECT
  USING (true);

-- No authenticated INSERT/UPDATE/DELETE from client — admin uses service_role key via Edge Functions or Dashboard.


-- ─── profiles ────────────────────────────────────────────────────────────────

-- Users can view their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- The trigger (section 5) inserts the row; no client INSERT policy needed.

-- Admin: select all profiles  (role check via profiles itself requires careful policy)
-- We expose this via a separate service_role call in adminService.getCustomers()
-- Alternatively, allow admins with the 'Admin' role:
CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid()
        AND p.role IN ('Admin', 'super_admin', 'Manager')
    )
  );


-- ─── orders ──────────────────────────────────────────────────────────────────

-- Users can only see their own orders
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create orders
CREATE POLICY "orders_insert_own"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins/Managers can view all orders
CREATE POLICY "orders_select_admin"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('Admin', 'super_admin', 'Manager')
    )
  );

-- Admins/Managers can update order status
CREATE POLICY "orders_update_admin"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('Admin', 'super_admin', 'Manager')
    )
  );


-- ─── order_items ─────────────────────────────────────────────────────────────

-- Users can read their own order items (join through orders)
CREATE POLICY "order_items_select_own"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Users can insert order items for their own orders
CREATE POLICY "order_items_insert_own"
  ON public.order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Admins can view all order items
CREATE POLICY "order_items_select_admin"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('Admin', 'super_admin', 'Manager')
    )
  );


-- ─── cart_items ──────────────────────────────────────────────────────────────

CREATE POLICY "cart_items_all_own"
  ON public.cart_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─── wishlist ────────────────────────────────────────────────────────────────

CREATE POLICY "wishlist_all_own"
  ON public.wishlist FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─── payments ────────────────────────────────────────────────────────────────

-- Users can view their own payments
CREATE POLICY "payments_select_own"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert (initiate) their own payments
CREATE POLICY "payments_insert_own"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all payments
CREATE POLICY "payments_select_admin"
  ON public.payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('Admin', 'super_admin', 'Manager')
    )
  );

-- NOTE: payment UPDATE (e.g. status → paid) must come from Edge Functions
-- using service_role key, which bypasses RLS automatically.
-- No client-side UPDATE policy is intentionally left out for security.


-- ─── payment_logs ────────────────────────────────────────────────────────────

-- No public access. Only service_role (Edge Functions) writes to this table.
-- Admins can read for the dashboard webhook log view.
CREATE POLICY "payment_logs_select_admin"
  ON public.payment_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('Admin', 'super_admin', 'Manager')
    )
  );


-- ─── invoices ────────────────────────────────────────────────────────────────

-- Users can read their own invoices (via order ownership)
CREATE POLICY "invoices_select_own"
  ON public.invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = invoices.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- Admins can read all invoices
CREATE POLICY "invoices_select_admin"
  ON public.invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('Admin', 'super_admin', 'Manager')
    )
  );

-- INSERT only from Edge Functions (service_role key, bypasses RLS).


-- ─── site_settings ───────────────────────────────────────────────────────────

-- Only admins can read settings
CREATE POLICY "site_settings_select_admin"
  ON public.site_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('Admin', 'super_admin')
    )
  );

-- Only admins can update settings
CREATE POLICY "site_settings_update_admin"
  ON public.site_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('Admin', 'super_admin')
    )
  );


-- =============================================================================
-- 5. TRIGGERS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 5.1  Auto-create profile row when a new auth user is created
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'phone',
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'Customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop the trigger if it already exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ---------------------------------------------------------------------------
-- 5.2  Auto-update updated_at columns
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply to tables that have updated_at
CREATE OR REPLACE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- =============================================================================
-- 6. STORAGE BUCKETS
-- (Run via Supabase SQL Editor — storage schema is managed by Supabase)
-- =============================================================================

-- Products bucket (public — product images are publicly accessible)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'products',
  'products',
  true,
  5242880,   -- 5 MB max per file
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Invoices bucket (private — only accessible by the owner or admin)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'invoices',
  'invoices',
  false,
  10485760,  -- 10 MB max per file
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;


-- Storage RLS: products bucket (public read, auth write)
CREATE POLICY "products_storage_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'products');

CREATE POLICY "products_storage_auth_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'products'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "products_storage_admin_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'products'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('Admin', 'super_admin')
    )
  );

-- Storage RLS: invoices bucket (service_role writes, users read their own)
CREATE POLICY "invoices_storage_owner_read"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'invoices'
    AND auth.role() = 'authenticated'
  );


-- =============================================================================
-- 7. SEED DATA — Categories
-- =============================================================================
INSERT INTO public.categories (name, slug) VALUES
  ('Laptops & Notebooks',      'laptops-notebooks'),
  ('Smartphones & Tablets',    'smartphones-tablets'),
  ('Desktops & Workstations',  'desktops-workstations'),
  ('Networking',               'networking'),
  ('Accessories',              'accessories'),
  ('Software & Licenses',      'software-licenses'),
  ('Storage',                  'storage'),
  ('Printers & Scanners',      'printers-scanners'),
  ('Gaming',                   'gaming'),
  ('Monitors & Displays',      'monitors-displays')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- END OF MIGRATION
-- =============================================================================
