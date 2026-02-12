-- Add audit logging to soft_delete_object / restore_object
-- Uses helper function to bypass RLS without opening audit_log to users

-- 1. Helper: insert into audit_log bypassing RLS (SECURITY DEFINER + row_security off)
CREATE OR REPLACE FUNCTION public.audit_log_insert(
  p_action TEXT,
  p_actor_type TEXT,
  p_actor_user_id UUID DEFAULT NULL,
  p_team_id UUID DEFAULT NULL,
  p_target_type TEXT DEFAULT NULL,
  p_target_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
SET row_security TO 'off'
AS $$
BEGIN
  INSERT INTO public.audit_log (action, actor_type, actor_user_id, team_id, target_type, target_id, metadata)
  VALUES (p_action, p_actor_type, p_actor_user_id, p_team_id, p_target_type, p_target_id, p_metadata);
END;
$$;

-- 2. Recreate soft_delete_object with audit logging
CREATE OR REPLACE FUNCTION public.soft_delete_object(p_object_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

    -- Audit (safe: exception swallowed so delete still succeeds)
    BEGIN
      PERFORM public.audit_log_insert(
        'object.soft_deleted',
        'user',
        COALESCE(p_user_id, auth.uid()),
        NULL,
        'object',
        p_object_id,
        '{"cascade":true}'::jsonb
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'audit_log_insert failed in soft_delete_object: %', SQLERRM;
    END;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- 3. Recreate restore_object with audit logging
CREATE OR REPLACE FUNCTION public.restore_object(p_object_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

    -- Audit (safe: exception swallowed so restore still succeeds)
    BEGIN
      PERFORM public.audit_log_insert(
        'object.restored',
        'user',
        COALESCE(p_user_id, auth.uid()),
        NULL,
        'object',
        p_object_id,
        '{"cascade":true}'::jsonb
      );
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'audit_log_insert failed in restore_object: %', SQLERRM;
    END;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

COMMENT ON FUNCTION public.audit_log_insert(TEXT,TEXT,UUID,UUID,TEXT,UUID,JSONB) IS
'Helper to insert into audit_log bypassing RLS. SECURITY DEFINER + row_security off.';

COMMENT ON FUNCTION public.soft_delete_object(UUID, UUID) IS
'Soft deletes an object and all related items. Logs to audit_log.';

COMMENT ON FUNCTION public.restore_object(UUID, UUID) IS
'Restores a soft-deleted object and all related items. Logs to audit_log.';

-- 4. Lock down audit_log_insert: only service_role (and owner) can call it directly.
--    SECURITY DEFINER functions called from other SECURITY DEFINER functions
--    (soft_delete_object, restore_object) still work because the caller runs as owner.
REVOKE EXECUTE ON FUNCTION public.audit_log_insert(TEXT,TEXT,UUID,UUID,TEXT,UUID,JSONB) FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.audit_log_insert(TEXT,TEXT,UUID,UUID,TEXT,UUID,JSONB) TO service_role;
