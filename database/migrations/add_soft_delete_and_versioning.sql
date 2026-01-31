-- Migration: Add soft delete and optimistic locking
-- ==========================================================
-- 1. Soft delete (deleted_at column) for objects and expenses
-- 2. Optimistic locking (version column) for conflict prevention
-- Date: 2026-01-31

-- ============================================
-- 1. SOFT DELETE: Add deleted_at columns
-- ============================================

-- Objects table
ALTER TABLE public.objects
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_objects_deleted_at
ON public.objects(deleted_at) WHERE deleted_at IS NULL;

-- Object expenses
ALTER TABLE public.object_expenses
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_object_expenses_deleted_at
ON public.object_expenses(deleted_at) WHERE deleted_at IS NULL;

-- Object extras (additional works)
ALTER TABLE public.object_extras
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Object payments
ALTER TABLE public.object_payments
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Global expenses
ALTER TABLE public.global_expenses
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_global_expenses_deleted_at
ON public.global_expenses(deleted_at) WHERE deleted_at IS NULL;

-- Expense categories
ALTER TABLE public.expense_categories
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Payment methods
ALTER TABLE public.payment_methods
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- ============================================
-- 2. OPTIMISTIC LOCKING: Add version columns
-- ============================================

-- Objects table
ALTER TABLE public.objects
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;

-- Object expenses
ALTER TABLE public.object_expenses
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;

-- Object extras
ALTER TABLE public.object_extras
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;

-- Object payments
ALTER TABLE public.object_payments
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;

-- Global expenses
ALTER TABLE public.global_expenses
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1 NOT NULL;

-- ============================================
-- 3. SOFT DELETE FUNCTIONS
-- ============================================

-- Soft delete an object (and cascade to related items)
CREATE OR REPLACE FUNCTION soft_delete_object(
  p_object_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Soft delete the object
  UPDATE public.objects
  SET deleted_at = NOW(), updated_at = NOW()
  WHERE id = p_object_id
    AND user_id = p_user_id
    AND deleted_at IS NULL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  IF deleted_count > 0 THEN
    -- Soft delete related items
    UPDATE public.object_expenses SET deleted_at = NOW()
    WHERE object_id = p_object_id AND deleted_at IS NULL;

    UPDATE public.object_extras SET deleted_at = NOW()
    WHERE object_id = p_object_id AND deleted_at IS NULL;

    UPDATE public.object_payments SET deleted_at = NOW()
    WHERE object_id = p_object_id AND deleted_at IS NULL;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Restore a soft-deleted object
CREATE OR REPLACE FUNCTION restore_object(
  p_object_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  restored_count INTEGER;
BEGIN
  -- Restore the object
  UPDATE public.objects
  SET deleted_at = NULL, updated_at = NOW()
  WHERE id = p_object_id
    AND user_id = p_user_id
    AND deleted_at IS NOT NULL;

  GET DIAGNOSTICS restored_count = ROW_COUNT;

  IF restored_count > 0 THEN
    -- Restore related items
    UPDATE public.object_expenses SET deleted_at = NULL
    WHERE object_id = p_object_id AND deleted_at IS NOT NULL;

    UPDATE public.object_extras SET deleted_at = NULL
    WHERE object_id = p_object_id AND deleted_at IS NOT NULL;

    UPDATE public.object_payments SET deleted_at = NULL
    WHERE object_id = p_object_id AND deleted_at IS NOT NULL;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generic soft delete function
CREATE OR REPLACE FUNCTION soft_delete_item(
  p_table_name TEXT,
  p_item_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  EXECUTE format(
    'UPDATE public.%I SET deleted_at = NOW() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
    p_table_name
  ) USING p_item_id, p_user_id;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Generic restore function
CREATE OR REPLACE FUNCTION restore_item(
  p_table_name TEXT,
  p_item_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  restored_count INTEGER;
BEGIN
  EXECUTE format(
    'UPDATE public.%I SET deleted_at = NULL WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL',
    p_table_name
  ) USING p_item_id, p_user_id;

  GET DIAGNOSTICS restored_count = ROW_COUNT;
  RETURN restored_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permanently delete old soft-deleted items (cleanup job)
CREATE OR REPLACE FUNCTION permanently_delete_old_items(
  p_days_old INTEGER DEFAULT 30
) RETURNS TABLE(table_name TEXT, deleted_count BIGINT) AS $$
DECLARE
  cutoff_date TIMESTAMPTZ;
BEGIN
  cutoff_date := NOW() - (p_days_old || ' days')::INTERVAL;

  -- Delete old soft-deleted objects (CASCADE will delete related)
  DELETE FROM public.objects WHERE deleted_at < cutoff_date;
  table_name := 'objects';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN NEXT;

  -- Delete old soft-deleted global expenses
  DELETE FROM public.global_expenses WHERE deleted_at < cutoff_date;
  table_name := 'global_expenses';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN NEXT;

  -- Delete old soft-deleted categories
  DELETE FROM public.expense_categories WHERE deleted_at < cutoff_date;
  table_name := 'expense_categories';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN NEXT;

  -- Delete old soft-deleted payment methods
  DELETE FROM public.payment_methods WHERE deleted_at < cutoff_date;
  table_name := 'payment_methods';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. OPTIMISTIC LOCKING FUNCTION
-- ============================================

-- Update with version check (returns false if version mismatch)
CREATE OR REPLACE FUNCTION update_with_version_check(
  p_table_name TEXT,
  p_item_id UUID,
  p_expected_version INTEGER,
  p_updates JSONB
) RETURNS TABLE(success BOOLEAN, new_version INTEGER, error_message TEXT) AS $$
DECLARE
  current_version INTEGER;
  updated_count INTEGER;
BEGIN
  -- Get current version
  EXECUTE format(
    'SELECT version FROM public.%I WHERE id = $1 AND deleted_at IS NULL',
    p_table_name
  ) INTO current_version USING p_item_id;

  IF current_version IS NULL THEN
    success := FALSE;
    new_version := NULL;
    error_message := 'Item not found';
    RETURN NEXT;
    RETURN;
  END IF;

  IF current_version != p_expected_version THEN
    success := FALSE;
    new_version := current_version;
    error_message := 'Version mismatch: someone else modified this item';
    RETURN NEXT;
    RETURN;
  END IF;

  -- Update with incremented version
  -- Note: actual column updates should be done by the caller
  EXECUTE format(
    'UPDATE public.%I SET version = version + 1, updated_at = NOW() WHERE id = $1 AND version = $2',
    p_table_name
  ) USING p_item_id, p_expected_version;

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  IF updated_count > 0 THEN
    success := TRUE;
    new_version := p_expected_version + 1;
    error_message := NULL;
  ELSE
    success := FALSE;
    new_version := current_version;
    error_message := 'Concurrent modification detected';
  END IF;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. AUTO-INCREMENT VERSION TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version := COALESCE(OLD.version, 0) + 1;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
DROP TRIGGER IF EXISTS tr_objects_version ON public.objects;
CREATE TRIGGER tr_objects_version
  BEFORE UPDATE ON public.objects
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION increment_version();

DROP TRIGGER IF EXISTS tr_object_expenses_version ON public.object_expenses;
CREATE TRIGGER tr_object_expenses_version
  BEFORE UPDATE ON public.object_expenses
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION increment_version();

DROP TRIGGER IF EXISTS tr_global_expenses_version ON public.global_expenses;
CREATE TRIGGER tr_global_expenses_version
  BEFORE UPDATE ON public.global_expenses
  FOR EACH ROW
  WHEN (OLD.* IS DISTINCT FROM NEW.*)
  EXECUTE FUNCTION increment_version();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON FUNCTION soft_delete_object IS
'Soft deletes an object and all related items (expenses, extras, payments)';

COMMENT ON FUNCTION restore_object IS
'Restores a soft-deleted object and all related items';

COMMENT ON FUNCTION soft_delete_item IS
'Generic function to soft delete any item by table name';

COMMENT ON FUNCTION restore_item IS
'Generic function to restore any soft-deleted item by table name';

COMMENT ON FUNCTION permanently_delete_old_items IS
'Cleanup job: permanently deletes items that were soft-deleted more than N days ago';

COMMENT ON FUNCTION update_with_version_check IS
'Optimistic locking: checks version before update to prevent concurrent modifications';

COMMENT ON FUNCTION increment_version IS
'Trigger function: auto-increments version on every update';
