-- Migration: Add tables for Telegram notification deduplication
-- Date: 2024-02-03

-- Table for Stripe webhook event deduplication
-- Prevents sending duplicate Telegram notifications on webhook retries
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cleanup of old events (optional, for maintenance)
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_created_at
  ON stripe_webhook_events(created_at);

-- Table for admin notification deduplication
-- Prevents sending duplicate notifications (e.g., new_demo_signup)
CREATE TABLE IF NOT EXISTS admin_notifications_sent (
  event_key TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for cleanup
CREATE INDEX IF NOT EXISTS idx_admin_notifications_sent_created_at
  ON admin_notifications_sent(created_at);

-- Add contact_consent column to profiles if not exists
-- This tracks if user agreed to be contacted for marketing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'contact_consent'
  ) THEN
    ALTER TABLE profiles ADD COLUMN contact_consent BOOLEAN NOT NULL DEFAULT TRUE;
    COMMENT ON COLUMN profiles.contact_consent IS 'User agreed to be contacted (from registration terms)';
  END IF;
END
$$;

-- Grant permissions to authenticated users (for Supabase RLS)
-- Note: Adjust based on your RLS policies
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications_sent ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can insert/read (webhook runs as service role)
CREATE POLICY "Service role only" ON stripe_webhook_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role only" ON admin_notifications_sent
  FOR ALL USING (auth.role() = 'service_role');

-- Comment
COMMENT ON TABLE stripe_webhook_events IS 'Deduplication for Stripe webhook Telegram notifications';
COMMENT ON TABLE admin_notifications_sent IS 'Deduplication for admin notifications (demo signups, etc.)';
