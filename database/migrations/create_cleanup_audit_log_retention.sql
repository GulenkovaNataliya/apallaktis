-- Cleanup audit_log: retention 24 months
-- Called via: supabase.rpc('cleanup_audit_log_retention')
-- Scheduled: daily cron via /api/cron/cleanup-audit-log

CREATE OR REPLACE FUNCTION public.cleanup_audit_log_retention()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  deleted_count BIGINT;
BEGIN
  DELETE FROM public.audit_log
  WHERE created_at < NOW() - INTERVAL '24 months';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION public.cleanup_audit_log_retention() IS
'Deletes audit_log rows older than 24 months. Returns count of deleted rows.';

-- Only service_role can call this
REVOKE EXECUTE ON FUNCTION public.cleanup_audit_log_retention() FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION public.cleanup_audit_log_retention() TO service_role;
