-- Profiles: core fields required by Subscription Engine and Demo system
-- ======================================================================
-- Ensures all columns exist that are referenced by:
--   - handle_new_user() trigger (demo module 040-041)
--   - getUserTier() in core-access (subscription engine)
--   - API routes for tier detection and feature gating
--
-- This migration uses ADD COLUMN IF NOT EXISTS so it is safe to re-run.
-- It does NOT create the profiles table itself — that must already exist
-- with at least (id UUID PRIMARY KEY, email TEXT).

-- ── Identity & contact ──────────────────────────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS country_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_consent BOOLEAN NOT NULL DEFAULT FALSE;

-- ── Account numbering ───────────────────────────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_number INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- ── Invoice / business ──────────────────────────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS invoice_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS afm TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS doy TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activity TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_business BOOLEAN DEFAULT FALSE;

-- ── Subscription engine (getUserTier) ───────────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'demo';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT;   -- legacy; used by getUserTier() fallback & team view (010)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_purchased BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS account_purchased_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_month_free_expires_at TIMESTAMPTZ;

-- ── Stripe integration ────────────────────────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- ── VIP ─────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vip_expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vip_granted_by TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS vip_reason TEXT;

-- ── Demo ────────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS demo_expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS demo_started_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS demo_notified_at TIMESTAMPTZ;

-- ── Referral ────────────────────────────────────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referrals_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bonus_months INTEGER DEFAULT 0;

-- ── Email tracking (cron notifications) ─────────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS demo_expiring_email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS demo_expired_email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_expiring_email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_expired_email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS free_month_expiring_email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS free_month_expired_email_sent BOOLEAN DEFAULT FALSE;

-- ── Phone verification ──────────────────────────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;

-- ── Preferred language ────────────────────────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferred_language TEXT;

-- ── Timestamps ──────────────────────────────────────────────────────────

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── Indexes ─────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS idx_profiles_demo_expiring
  ON public.profiles(subscription_status, demo_expires_at)
  WHERE subscription_status = 'demo' AND demo_expiring_email_sent = FALSE;

-- ── Comments ────────────────────────────────────────────────────────────

COMMENT ON COLUMN public.profiles.subscription_status IS 'demo | active | expired | read-only | vip';
COMMENT ON COLUMN public.profiles.subscription_plan IS 'basic | standard | premium (null during demo/free month)';
COMMENT ON COLUMN public.profiles.demo_expires_at IS '48h after registration; NULL if never had demo';
COMMENT ON COLUMN public.profiles.first_month_free_expires_at IS '30 days after account purchase (before plan selection)';
COMMENT ON COLUMN public.profiles.vip_expires_at IS 'NULL = VIP forever; date = VIP until that date';
COMMENT ON COLUMN public.profiles.role IS 'user | admin';
COMMENT ON COLUMN public.profiles.subscription_tier IS 'Legacy: basic | standard | premium — used by getUserTier() fallback and team view';
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe Customer ID (cus_xxx)';
COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Stripe Subscription ID (sub_xxx); NULL if no active subscription';
COMMENT ON COLUMN public.profiles.preferred_language IS 'User preferred language code (el, en, etc.)';
COMMENT ON COLUMN public.profiles.free_month_expiring_email_sent IS 'True if "free month expiring" email was sent (cron)';
COMMENT ON COLUMN public.profiles.free_month_expired_email_sent IS 'True if "free month expired" email was sent (cron)';
