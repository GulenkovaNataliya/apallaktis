-- Migration: Add Admin Role to Profiles
-- ========================================
-- Добавляет колонку role для разделения прав доступа (user / admin)
-- Дата: 2026-01-08

-- Добавить колонку role
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Создать индекс для быстрого поиска админов
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Комментарий для понимания
COMMENT ON COLUMN profiles.role IS 'Роль пользователя: user (обычный пользователь) или admin (администратор)';

-- ========================================
-- ВАЖНО: Назначить первого администратора
-- ========================================
-- Замените email на ваш реальный email!
-- Например: natalia@example.com

UPDATE profiles
SET role = 'admin'
WHERE email = 'gulenkovanatalia@gmail.com';

-- Проверка: показать всех администраторов
SELECT
  id,
  email,
  name,
  account_number,
  role,
  created_at
FROM profiles
WHERE role = 'admin'
ORDER BY created_at DESC;

-- Проверка: показать структуру колонки role
SELECT
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'role';
