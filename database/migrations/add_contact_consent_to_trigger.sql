-- Migration: Add contact_consent to handle_new_user trigger
-- Date: 2024-02-03
--
-- Updates the trigger to save contact_consent from user metadata to profiles

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  next_account_number INTEGER;
  user_name TEXT;
  user_referral_code TEXT;
  user_referred_by TEXT;
  user_contact_consent BOOLEAN;
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

  -- Get contact_consent from metadata (default false if not set)
  user_contact_consent := COALESCE((NEW.raw_user_meta_data->>'contact_consent')::boolean, FALSE);

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
    contact_consent,
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
    user_contact_consent,
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

COMMENT ON FUNCTION public.handle_new_user() IS
'Creates user profile on registration. Checks used_emails to prevent demo abuse. Saves referred_by and contact_consent from metadata.';
