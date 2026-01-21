-- Migration: fix_object_expenses
-- Description: Добавить недостающие колонки и RLS политики для object_expenses
-- Date: 2026-01-21
-- ВЫПОЛНИТЬ В SUPABASE SQL EDITOR

-- =============================================
-- 1. ДОБАВИТЬ НЕДОСТАЮЩИЕ КОЛОНКИ
-- =============================================

-- Добавляем payment_method_id если нет
ALTER TABLE object_expenses
ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL;

-- Добавляем description если нет
ALTER TABLE object_expenses
ADD COLUMN IF NOT EXISTS description TEXT;

-- Добавляем input_method если нет
ALTER TABLE object_expenses
ADD COLUMN IF NOT EXISTS input_method TEXT CHECK (input_method IN ('manual', 'voice', 'photo'));

-- Индекс для payment_method_id
CREATE INDEX IF NOT EXISTS idx_object_expenses_payment_method_id
ON object_expenses(payment_method_id);

-- =============================================
-- 2. RLS ПОЛИТИКИ ДЛЯ OBJECT_EXPENSES
-- =============================================

-- Включаем RLS (если ещё не включен)
ALTER TABLE object_expenses ENABLE ROW LEVEL SECURITY;

-- Удаляем старые политики если есть (чтобы избежать конфликтов)
DROP POLICY IF EXISTS "Users can view own object expenses" ON object_expenses;
DROP POLICY IF EXISTS "Users can insert own object expenses" ON object_expenses;
DROP POLICY IF EXISTS "Users can update own object expenses" ON object_expenses;
DROP POLICY IF EXISTS "Users can delete own object expenses" ON object_expenses;

-- Политика SELECT: пользователь может видеть расходы своих объектов
CREATE POLICY "Users can view own object expenses"
ON object_expenses FOR SELECT
USING (
  object_id IN (SELECT id FROM objects WHERE user_id = auth.uid())
);

-- Политика INSERT: пользователь может добавлять расходы в свои объекты
CREATE POLICY "Users can insert own object expenses"
ON object_expenses FOR INSERT
WITH CHECK (
  object_id IN (SELECT id FROM objects WHERE user_id = auth.uid())
);

-- Политика UPDATE: пользователь может обновлять расходы своих объектов
CREATE POLICY "Users can update own object expenses"
ON object_expenses FOR UPDATE
USING (
  object_id IN (SELECT id FROM objects WHERE user_id = auth.uid())
);

-- Политика DELETE: пользователь может удалять расходы своих объектов
CREATE POLICY "Users can delete own object expenses"
ON object_expenses FOR DELETE
USING (
  object_id IN (SELECT id FROM objects WHERE user_id = auth.uid())
);

-- =============================================
-- 3. ПРОВЕРКА
-- =============================================

-- Проверить структуру таблицы после выполнения:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'object_expenses';

-- Проверить RLS политики:
-- SELECT * FROM pg_policies WHERE tablename = 'object_expenses';
