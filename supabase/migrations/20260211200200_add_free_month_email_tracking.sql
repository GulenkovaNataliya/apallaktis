-- Migration: Add free month email tracking columns
-- ================================================
-- Tracks whether emails were sent for expiring/expired free month
-- Date: 2026-02-11

-- Add columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS free_month_expiring_email_sent BOOLEAN DEFAULT FALSE;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS free_month_expired_email_sent BOOLEAN DEFAULT FALSE;

-- Comments
COMMENT ON COLUMN public.profiles.free_month_expiring_email_sent IS 'True if "free month expiring" email was sent';
COMMENT ON COLUMN public.profiles.free_month_expired_email_sent IS 'True if "free month expired" email was sent';
