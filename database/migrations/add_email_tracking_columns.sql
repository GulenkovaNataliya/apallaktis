-- Migration: Add Email Tracking Columns
-- =======================================
-- Добавляем колонки для отслеживания отправленных email уведомлений
-- Дата: 2026-01-08

-- Добавляем колонки в таблицу profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS demo_expiring_email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS demo_expired_email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_expiring_email_sent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS subscription_expired_email_sent BOOLEAN DEFAULT false;

-- Добавляем комментарии для понимания
COMMENT ON COLUMN profiles.demo_expiring_email_sent IS 'Отправлен ли email: DEMO заканчивается через 24 часа';
COMMENT ON COLUMN profiles.demo_expired_email_sent IS 'Отправлен ли email: DEMO истекло';
COMMENT ON COLUMN profiles.subscription_expiring_email_sent IS 'Отправлен ли email: Подписка заканчивается через 2 дня';
COMMENT ON COLUMN profiles.subscription_expired_email_sent IS 'Отправлен ли email: Подписка истекла';

-- Создаем индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_profiles_demo_expiring
ON profiles(subscription_status, demo_expires_at)
WHERE subscription_status = 'demo' AND demo_expiring_email_sent = false;

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_expiring
ON profiles(subscription_status, subscription_expires_at)
WHERE subscription_status IN ('active', 'vip') AND subscription_expiring_email_sent = false;

-- Проверка: показать структуру таблицы
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN (
  'demo_expiring_email_sent',
  'demo_expired_email_sent',
  'subscription_expiring_email_sent',
  'subscription_expired_email_sent'
)
ORDER BY column_name;
