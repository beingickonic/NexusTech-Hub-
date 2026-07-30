-- ============================================================
--  NEXUS TECHHUB — Migration 003: Support Ticket Webhook
--  Run this in your Supabase SQL Editor to enable email notifications
-- ============================================================

-- First, ensure the pg_net extension is enabled (required for edge function HTTP requests)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.trigger_send_email()
RETURNS TRIGGER AS $$
BEGIN
  -- We assume you deploy the Edge Function 'send-email'
  -- Replace YOUR_PROJECT_REF with your actual Supabase project reference
  -- Or rely on pg_net to hit your endpoint.
  
  -- The simplest way in modern Supabase is using the built-in webhook UI:
  -- Database -> Webhooks -> Create Webhook
  -- Table: support_tickets
  -- Events: Insert
  -- Type: Edge Function
  -- Function: send-email
  
  -- This file acts as a placeholder documentation for that process
  -- since Supabase Dashboard is the safest way to configure Webhook Secrets.
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
