-- ============================================================
-- MIGRATION 021: Customer Delivery Confirmation
-- Customer explicitly confirms delivery with rating & feedback
-- ============================================================

-- 1. Add customer confirmation columns to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_confirmed_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_rating INT CHECK (delivery_rating BETWEEN 1 AND 5);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_feedback TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS confirmed_by UUID REFERENCES public.profiles(id);

-- 2. Add loyalty_points column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS loyalty_points INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_orders INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_spent DECIMAL(12,2) DEFAULT 0;

-- 3. Create customer_delivery_confirms table for audit trail
CREATE TABLE IF NOT EXISTS public.customer_delivery_confirms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  rating INT CHECK (rating BETWEEN 1 AND 5),
  feedback TEXT,
  confirmed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customer_delivery_confirms_order_id ON public.customer_delivery_confirms(order_id);

ALTER TABLE public.customer_delivery_confirms ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customer_delivery_confirms' AND policyname = 'Customer delivery confirm access') THEN
    CREATE POLICY "Customer delivery confirm access" ON public.customer_delivery_confirms
      FOR ALL USING (
        auth.uid() = customer_id
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'super_admin', 'Manager'))
      );
  END IF;
END $$;

-- 4. RPC: customer_confirm_delivery
CREATE OR REPLACE FUNCTION public.customer_confirm_delivery(
  p_order_id UUID,
  p_customer_id UUID,
  p_rating INT DEFAULT NULL,
  p_feedback TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_order RECORD;
  v_loyalty_earned INT;
BEGIN
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;

  IF v_order.status NOT IN ('Delivered') THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'Order must be in Delivered status to confirm');
  END IF;

  IF v_order.user_id IS DISTINCT FROM p_customer_id THEN
    RETURN jsonb_build_object('success', FALSE, 'error', 'This order does not belong to you');
  END IF;

  UPDATE public.orders
  SET status = 'Completed',
      delivery_confirmed_at = NOW(),
      delivery_rating = p_rating,
      delivery_feedback = p_feedback,
      confirmed_by = p_customer_id,
      updated_at = NOW()
  WHERE id = p_order_id;

  INSERT INTO public.customer_delivery_confirms (order_id, customer_id, rating, feedback)
  VALUES (p_order_id, p_customer_id, p_rating, p_feedback);

  -- Award loyalty points (10 points per order, +5 bonus for 5-star rating)
  v_loyalty_earned := 10 + CASE WHEN p_rating = 5 THEN 5 ELSE 0 END;
  UPDATE public.profiles
  SET loyalty_points = COALESCE(loyalty_points, 0) + v_loyalty_earned,
      total_orders = COALESCE(total_orders, 0) + 1,
      total_spent = COALESCE(total_spent, 0) + COALESCE(v_order.total_amount, 0),
      updated_at = NOW()
  WHERE id = p_customer_id;

  RETURN jsonb_build_object('success', TRUE, 'status', 'Completed', 'loyalty_points_earned', v_loyalty_earned);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Enable realtime
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'customer_delivery_confirms') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_delivery_confirms;
  END IF;
END $$;
