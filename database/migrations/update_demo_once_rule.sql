-- Migration: Update DEMO rule - 48 hours only ONCE for ALL users
-- ================================================================
-- Previously: users who purchased could get demo again
-- Now: demo 48 hours is given only ONCE per email, regardless of purchase history
-- Date: 2026-02-11

-- 1. Add email_normalized column for case-insensitive matching
ALTER TABLE public.used_emails
ADD COLUMN IF NOT EXISTS email_normalized TEXT;

-- 2. Populate email_normalized for existing rows
UPDATE public.used_emails
SET email_normalized = LOWER(TRIM(email))
WHERE email_normalized IS NULL;

-- 3. Create unique index on normalized email
CREATE UNIQUE INDEX IF NOT EXISTS idx_used_emails_normalized
ON public.used_emails(email_normalized);

-- 4. Update handle_new_user() - remove has_purchased check for demo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  next_account_number INTEGER;
  user_name TEXT;
  user_referral_code TEXT;
  user_referred_by TEXT;
  email_record RECORD;
  demo_expires TIMESTAMPTZ;
  v_contact_consent BOOLEAN;
  v_email_normalized TEXT;
BEGIN
  -- Normalize email for lookup
  v_email_normalized := LOWER(TRIM(NEW.email));

  -- Consent from signup checkbox
  v_contact_consent :=
    COALESCE((NEW.raw_user_meta_data ->> 'contact_consent')::boolean, FALSE);

  -- Check if email was previously used (case-insensitive)
  SELECT * INTO email_record
  FROM public.used_emails
  WHERE email_normalized = v_email_normalized;

  -- UPDATED RULE: Demo only ONCE per email, regardless of purchase history
  IF email_record IS NOT NULL THEN
    -- Email already used - NO demo (expired immediately)
    demo_expires := NOW() - INTERVAL '1 second';
  ELSE
    -- New email - give 48 hour demo
    demo_expires := NOW() + INTERVAL '48 hours';
  END IF;

  -- Get next account number
  SELECT COALESCE(MAX(account_number), 1000) + 1
  INTO next_account_number
  FROM public.profiles;

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
    country_code,
    account_number,
    referral_code,
    referred_by,
    invoice_type,
    company_name,
    afm,
    doy,
    address,
    activity,
    is_business,
    subscription_status,
    demo_expires_at,
    demo_started_at,
    contact_consent,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    user_name,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'country_code',
    next_account_number,
    user_referral_code,
    user_referred_by,
    COALESCE(NEW.raw_user_meta_data->>'invoice_type', 'receipt'),
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'afm',
    NEW.raw_user_meta_data->>'doy',
    NEW.raw_user_meta_data->>'address',
    NEW.raw_user_meta_data->>'activity',
    COALESCE((NEW.raw_user_meta_data->>'is_business')::boolean, FALSE),
    CASE WHEN demo_expires > NOW() THEN 'demo' ELSE 'read-only' END,
    demo_expires,
    CASE WHEN demo_expires > NOW() THEN NOW() ELSE NULL END,
    v_contact_consent,
    NOW(),
    NOW()
  );

  -- Record email usage (insert or do nothing if exists)
  INSERT INTO public.used_emails (email, email_normalized, first_used_at, has_purchased, created_at)
  VALUES (NEW.email, v_email_normalized, NOW(), FALSE, NOW())
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- 5. Comment
COMMENT ON FUNCTION public.handle_new_user() IS
'Creates user profile on registration. Demo 48h is given only ONCE per email (case-insensitive), regardless of purchase history.';
