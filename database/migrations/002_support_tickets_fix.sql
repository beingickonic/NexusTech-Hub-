-- ============================================================
--  NEXUS TECHHUB — Migration 002: Support Tickets Fix
--  Run this in your Supabase SQL Editor to sync schema with frontend
-- ============================================================

-- First, define the helper function used by RLS policies
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS VARCHAR AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Drop the old table if it exists (to fix the BIGINT vs UUID conflict)
DROP TABLE IF EXISTS public.ticket_messages CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;

-- Create the new support_tickets table with UUID
CREATE TABLE public.support_tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name        TEXT,
  email       TEXT,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  priority    TEXT DEFAULT 'normal',
  status      TEXT DEFAULT 'Open',
  admin_reply TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable insert for everyone"
  ON public.support_tickets FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Enable select for users and admins"
  ON public.support_tickets FOR SELECT
  TO public
  USING (
    auth.uid() = user_id 
    OR public.get_my_role() IN ('Admin', 'Manager')
  );

CREATE POLICY "Enable update for users and admins"
  ON public.support_tickets FOR UPDATE
  TO public
  USING (
    auth.uid() = user_id 
    OR public.get_my_role() IN ('Admin', 'Manager')
  )
  WITH CHECK (
    auth.uid() = user_id 
    OR public.get_my_role() IN ('Admin', 'Manager')
  );

CREATE POLICY "Enable delete for admins"
  ON public.support_tickets FOR DELETE
  TO public
  USING (
    public.get_my_role() IN ('Admin', 'Manager')
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_email ON public.support_tickets(email);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.support_tickets(status);

-- Trigger for updated_at (assuming set_updated_at() function was created in migration 001)
CREATE OR REPLACE TRIGGER trg_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
