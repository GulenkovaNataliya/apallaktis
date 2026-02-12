-- Migration: Add used_emails table to prevent demo abuse
-- ==========================================================
-- Prevents users from getting unlimited demos by deleting and re-registering
-- Date: 2026-01-31

-- 1. Create used_emails table
CREATE TABLE IF NOT EXISTS public.used_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  demo_used BOOLEAN DEFAULT TRUE,
  account_purchased BOOLEAN DEFAULT FALSE,
  last_registration_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_used_emails_email ON public.used_emails(email);

-- Comment
COMMENT ON TABLE public.used_emails IS
'Tracks emails that have used demo to prevent abuse. Email stays here even after account deletion.';

-- 2. Populate with existing users
INSERT INTO public.used_emails (email, first_used_at, demo_used, account_purchased)
SELECT
  email,
  created_at,
  TRUE,
  COALESCE(account_purchased, FALSE)
FROM public.profiles
ON CONFLICT (email) DO NOTHING;

-- 3. Update handle_new_user to check used_emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  next_account_number INTEGER;
  user_name TEXT;
  user_referral_code TEXT;
  user_referred_by TEXT;
  email_record RECORD;
  demo_expires TIMESTAMPTZ;
BEGIN
  -- Check if email was previously used
  SELECT * INTO email_record FROM public.used_emails WHERE email = NEW.email;

  -- Determine demo expiration
  IF email_record IS NOT NULL AND email_record.demo_used = TRUE AND email_record.account_purchased = FALSE THEN
    -- Email already used demo and didn't purchase - no new demo (expired immediately)
    demo_expires := NOW() - INTERVAL '1 second';
    RAISE NOTICE 'Demo abuse prevented for email: %', NEW.email;
  ELSE
    -- New email or purchased account - give 48 hour demo
    demo_expires := NOW() + INTERVAL '48 hours';
  END IF;

  -- Get next account number
  SELECT COALESCE(MAX(account_number), 1000) + 1 INTO next_account_number FROM profiles;

  -- Get name from metadata
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Generate referral code
  user_referral_code := UPPER(SUBSTRING(user_name FROM 1 FOR 3)) || next_account_number::text;

  -- Get referred_by from metadata
  user_referred_by := NEW.raw_user_meta_data->>'referred_by';

  -- Create profile
  INSERT INTO public.profiles (
    id,
    email,
    name,
    phone,
    account_number,
    referral_code,
    referred_by,
    invoice_type,
    company_name,
    afm,
    doy,
    address,
    preferred_language,
    subscription_status,
    demo_expires_at,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    user_name,
    NEW.raw_user_meta_data->>'phone',
    next_account_number,
    user_referral_code,
    user_referred_by,
    COALESCE(NEW.raw_user_meta_data->>'invoice_type', 'receipt'),
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'afm',
    NEW.raw_user_meta_data->>'doy',
    NEW.raw_user_meta_data->>'address',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'el'),
    CASE WHEN demo_expires > NOW() THEN 'demo' ELSE 'read-only' END,
    demo_expires,
    NOW(),
    NOW()
  );

  -- Record email usage (insert or update)
  INSERT INTO public.used_emails (email, first_used_at, demo_used, last_registration_at)
  VALUES (NEW.email, NOW(), TRUE, NOW())
  ON CONFLICT (email) DO UPDATE SET
    last_registration_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Update used_emails when account is purchased
CREATE OR REPLACE FUNCTION public.mark_email_as_purchased()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_purchased = TRUE AND (OLD.account_purchased IS NULL OR OLD.account_purchased = FALSE) THEN
    UPDATE public.used_emails
    SET account_purchased = TRUE
    WHERE email = NEW.email;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_account_purchased ON public.profiles;
CREATE TRIGGER on_account_purchased
  AFTER UPDATE OF account_purchased ON public.profiles
  FOR EACH ROW
  WHEN (NEW.account_purchased = TRUE)
  EXECUTE FUNCTION public.mark_email_as_purchased();

COMMENT ON FUNCTION public.handle_new_user() IS
'Creates user profile on registration. Checks used_emails to prevent demo abuse. Saves referred_by from metadata.';

COMMENT ON FUNCTION public.mark_email_as_purchased() IS
'Updates used_emails when user purchases account, allowing future re-registration with demo if they delete and come back.';
