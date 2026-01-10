-- Migration: Add Phone Verification
-- ==================================
-- Добавляет поля для верификации телефона
-- Дата: 2026-01-08

-- Добавить колонку phone_verified (подтвержден ли телефон)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;

-- Создать таблицу для хранения кодов верификации
CREATE TABLE IF NOT EXISTS phone_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false
);

-- Создать индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_phone_verification_user_id ON phone_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verification_phone ON phone_verification_codes(phone);
CREATE INDEX IF NOT EXISTS idx_phone_verification_code ON phone_verification_codes(code);

-- Автоматическое удаление старых кодов (старше 24 часов)
-- Можно добавить в cron job или использовать pg_cron

-- Комментарии
COMMENT ON COLUMN profiles.phone_verified IS 'Подтвержден ли номер телефона пользователя';
COMMENT ON TABLE phone_verification_codes IS 'Коды верификации телефонов (действительны 10 минут)';

-- Проверка: показать структуру
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'phone_verified';

SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'phone_verification_codes'
ORDER BY ordinal_position;
