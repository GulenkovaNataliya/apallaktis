-- Migration: Save referred_by from user_metadata to profiles
-- ==========================================================
-- При регистрации referred_by передается через user_metadata
-- Этот триггер копирует его в таблицу profiles
-- Дата: 2026-01-23

-- Обновляем функцию handle_new_user чтобы сохранять referred_by
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  next_account_number INTEGER;
  user_name TEXT;
  user_referral_code TEXT;
  user_referred_by TEXT;
BEGIN
  -- Получаем следующий номер аккаунта
  SELECT COALESCE(MAX(account_number), 1000) + 1 INTO next_account_number FROM profiles;

  -- Получаем имя из метаданных
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Генерируем реферальный код: первые 3 буквы имени + номер аккаунта
  user_referral_code := UPPER(SUBSTRING(user_name FROM 1 FOR 3)) || next_account_number::text;

  -- Получаем referred_by из метаданных (если пришел по реферальной ссылке)
  user_referred_by := NEW.raw_user_meta_data->>'referred_by';

  -- Создаем профиль
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
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    user_name,
    NEW.raw_user_meta_data->>'phone',
    next_account_number,
    user_referral_code,
    user_referred_by,  -- Сохраняем реферальный код пригласившего
    COALESCE(NEW.raw_user_meta_data->>'invoice_type', 'receipt'),
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'afm',
    NEW.raw_user_meta_data->>'doy',
    NEW.raw_user_meta_data->>'address',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'el'),
    'demo',
    NOW(),
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Пересоздаем триггер если нужно
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Добавляем комментарий
COMMENT ON FUNCTION public.handle_new_user() IS
'Создает профиль пользователя при регистрации. Сохраняет referred_by из метаданных для реферальной программы.';
