-- Migration: 001_add_missing_columns
-- Description: Add missing columns to expenses tables for localStorage compatibility
-- Date: 2026-01-18
-- Note: Receipt photos are NOT stored - they are only used for OCR recognition and then deleted

-- =============================================
-- GLOBAL EXPENSES - добавляем недостающие поля
-- =============================================

ALTER TABLE global_expenses
ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS input_method TEXT CHECK (input_method IN ('manual', 'voice', 'photo'));

-- Индекс для быстрого поиска по payment_method
CREATE INDEX IF NOT EXISTS idx_global_expenses_payment_method_id
ON global_expenses(payment_method_id);

-- =============================================
-- OBJECT EXPENSES - добавляем недостающие поля
-- =============================================

ALTER TABLE object_expenses
ADD COLUMN IF NOT EXISTS payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS input_method TEXT CHECK (input_method IN ('manual', 'voice', 'photo'));

-- Индекс для быстрого поиска по payment_method
CREATE INDEX IF NOT EXISTS idx_object_expenses_payment_method_id
ON object_expenses(payment_method_id);

-- =============================================
-- КОММЕНТАРИИ К КОЛОНКАМ (для документации)
-- =============================================

COMMENT ON COLUMN global_expenses.payment_method_id IS 'Способ оплаты (связь с payment_methods)';
COMMENT ON COLUMN global_expenses.description IS 'Дополнительное описание расхода';
COMMENT ON COLUMN global_expenses.input_method IS 'Способ ввода: manual, voice, photo';

COMMENT ON COLUMN object_expenses.payment_method_id IS 'Способ оплаты (связь с payment_methods)';
COMMENT ON COLUMN object_expenses.description IS 'Дополнительное описание расхода';
COMMENT ON COLUMN object_expenses.input_method IS 'Способ ввода: manual, voice, photo';

-- =============================================
-- Удаляем старые колонки для фото (если есть)
-- Фото не хранятся - используются только для OCR
-- =============================================

ALTER TABLE global_expenses DROP COLUMN IF EXISTS receipt_photo_url;
ALTER TABLE global_expenses DROP COLUMN IF EXISTS receipt_photo_path;

ALTER TABLE object_expenses DROP COLUMN IF EXISTS receipt_photo_url;
ALTER TABLE object_expenses DROP COLUMN IF EXISTS receipt_photo_path;
