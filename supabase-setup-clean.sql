-- ==========================================
-- APALLAKTIS DATABASE SETUP - CLEAN INSTALL
-- Полная очистка и создание таблиц заново
-- ==========================================

-- ⚠️ ВАЖНО: Это удалит все существующие данные в таблице profiles!
-- Используйте только если у вас нет важных данных.

-- 1. Удаляем старые объекты (если есть)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP SEQUENCE IF EXISTS account_number_seq;

-- 2. Создаем последовательность для номеров аккаунтов
CREATE SEQUENCE account_number_seq START WITH 1010;

-- 3. Создаем таблицу профилей пользователей
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name text,
  phone text,
  country_code text,
  invoice_type text CHECK (invoice_type IN ('receipt', 'invoice')),
  company_name text,
  afm text,

  -- Account info
  account_number integer UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- DEMO period (48 hours)
  subscription_status text CHECK (subscription_status IN ('demo', 'active', 'expired', 'vip', 'read-only')) DEFAULT 'demo',
  demo_expires_at timestamp with time zone,

  -- Account purchase (95€+ΦΠΑ)
  account_purchased boolean DEFAULT false,
  account_purchased_at timestamp with time zone,
  first_month_free_expires_at timestamp with time zone,

  -- Subscription
  subscription_plan text CHECK (subscription_plan IN ('basic', 'standard', 'premium', 'vip', NULL)),
  subscription_expires_at timestamp with time zone,

  -- VIP (activated by admin)
  vip_expires_at timestamp with time zone,
  vip_granted_by text,
  vip_reason text,

  -- Referral program
  referral_code text UNIQUE NOT NULL,
  referred_by text,
  bonus_months integer DEFAULT 0
);

-- 4. Включаем Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Политика: пользователи могут видеть только свой профиль
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- 6. Политика: пользователи могут обновлять только свой профиль
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 7. Политика: автоматическая вставка профиля при регистрации
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 8. Функция: автоматическое создание профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_account_number integer;
  new_referral_code text;
BEGIN
  -- Generate next account number
  new_account_number := nextval('account_number_seq');

  -- Generate referral code: first 3 letters of name + account number
  new_referral_code := UPPER(SUBSTRING(new.raw_user_meta_data->>'name', 1, 3)) || new_account_number;

  INSERT INTO public.profiles (
    id, name, phone, country_code, invoice_type, company_name, afm,
    account_number, demo_expires_at, subscription_status, referral_code,
    referred_by
  )
  VALUES (
    new.id,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'country_code',
    new.raw_user_meta_data->>'invoice_type',
    new.raw_user_meta_data->>'company_name',
    new.raw_user_meta_data->>'afm',
    new_account_number,
    timezone('utc'::text, now()) + interval '48 hours', -- DEMO expires in 48 hours
    'demo', -- Initial subscription status
    new_referral_code, -- Generated referral code
    new.raw_user_meta_data->>'referred_by' -- Optional: code of who referred this user
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Триггер: вызов функции после регистрации пользователя
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- ✅ ГОТОВО!
-- Теперь можно тестировать регистрацию!
-- ==========================================
