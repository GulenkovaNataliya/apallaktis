-- Migration: Add demo tracking columns to profiles
-- Date: 2024-02-03
--
-- Purpose: Track when demo started and when Telegram notification was sent.
-- This enables "send once" logic for demo signup notifications.

-- Add demo_started_at: when user first became demo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'demo_started_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN demo_started_at TIMESTAMPTZ;
    COMMENT ON COLUMN profiles.demo_started_at IS 'When user first became demo (for tracking demo duration)';
  END IF;
END
$$;

-- Add demo_notified_at: when Telegram notification was sent (null = not sent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'demo_notified_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN demo_notified_at TIMESTAMPTZ;
    COMMENT ON COLUMN profiles.demo_notified_at IS 'When Telegram demo notification was sent (null = not sent yet)';
  END IF;
END
$$;

-- Backfill: Set demo_started_at = created_at for existing demo users
-- (This is a one-time migration, existing users won't get notifications)
UPDATE profiles
SET
  demo_started_at = created_at,
  demo_notified_at = created_at  -- Mark as already notified to prevent spam
WHERE subscription_status = 'demo'
  AND demo_started_at IS NULL;

-- Index for quick lookup of users needing notification
CREATE INDEX IF NOT EXISTS idx_profiles_demo_not_notified
ON profiles(subscription_status)
WHERE subscription_status = 'demo' AND demo_notified_at IS NULL;
