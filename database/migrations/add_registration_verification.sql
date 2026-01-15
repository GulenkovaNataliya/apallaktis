-- Migration: Add Registration Phone Verification
-- ==============================================
-- Таблица для верификации телефона при регистрации (без user_id)
-- Дата: 2026-01-15

-- Создать таблицу для хранения кодов верификации при регистрации
CREATE TABLE IF NOT EXISTS registration_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false
);

-- Создать индексы для быстрого поиска
CREATE INDEX IF NOT EXISTS idx_reg_verification_phone ON registration_verification_codes(phone);
CREATE INDEX IF NOT EXISTS idx_reg_verification_code ON registration_verification_codes(code);
CREATE INDEX IF NOT EXISTS idx_reg_verification_expires ON registration_verification_codes(expires_at);

-- Комментарии
COMMENT ON TABLE registration_verification_codes IS 'Коды верификации телефонов для регистрации (действительны 10 минут)';

-- RLS политики
ALTER TABLE registration_verification_codes ENABLE ROW LEVEL SECURITY;

-- Разрешить вставку и выборку для анонимных пользователей (при регистрации)
CREATE POLICY "Allow insert for registration" ON registration_verification_codes
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow select for verification" ON registration_verification_codes
  FOR SELECT
  TO anon
  USING (expires_at > NOW());

CREATE POLICY "Allow update for verification" ON registration_verification_codes
  FOR UPDATE
  TO anon
  USING (expires_at > NOW())
  WITH CHECK (true);

CREATE POLICY "Allow delete for cleanup" ON registration_verification_codes
  FOR DELETE
  TO anon
  USING (true);

-- Проверка: показать структуру
SELECT
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'registration_verification_codes'
ORDER BY ordinal_position;
