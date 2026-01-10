-- Migration: Ensure Referral Program Columns
-- ============================================
-- Проверяем и добавляем колонки для реферальной программы если их нет
-- Дата: 2026-01-08

-- Добавляем колонки если их ещё нет
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by VARCHAR(20),
ADD COLUMN IF NOT EXISTS bonus_months INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS referrals_count INTEGER DEFAULT 0;

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by ON profiles(referred_by);

-- Комментарии для понимания
COMMENT ON COLUMN profiles.referral_code IS 'Уникальный реферальный код пользователя (например: NAT1001)';
COMMENT ON COLUMN profiles.referred_by IS 'Реферальный код того, кто пригласил этого пользователя';
COMMENT ON COLUMN profiles.bonus_months IS 'Количество бонусных месяцев (полученных через реферальную программу)';
COMMENT ON COLUMN profiles.referrals_count IS 'Количество пользователей, пришедших по реферальной ссылке и купивших аккаунт';

-- Генерация реферальных кодов для существующих пользователей (если еще нет)
-- Формат: первые 3 буквы имени + номер аккаунта
-- Например: NAT1001, JOH1002, MAR1003
UPDATE profiles
SET referral_code = UPPER(SUBSTRING(name FROM 1 FOR 3)) || account_number::text
WHERE referral_code IS NULL AND name IS NOT NULL AND account_number IS NOT NULL;

-- Для пользователей без имени: использовать первые 3 буквы ID + номер аккаунта
UPDATE profiles
SET referral_code = UPPER(SUBSTRING(id::text FROM 1 FOR 3)) || account_number::text
WHERE referral_code IS NULL AND account_number IS NOT NULL;

-- Проверка: показать структуру колонок
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('referral_code', 'referred_by', 'bonus_months', 'referrals_count')
ORDER BY column_name;
