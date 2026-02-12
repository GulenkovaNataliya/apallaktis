-- AUDIT LOG v1
-- Retention: 24 months (cleanup via cron)
-- Spec: docs/core/AUDIT_LOG_SPEC_v1.md

-- 1. Create table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_type TEXT NOT NULL,          -- 'user' | 'admin' | 'system' | 'stripe'
  actor_user_id UUID NULL,
  team_id UUID NULL,
  target_type TEXT NULL,
  target_id UUID NULL,
  action TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor_user_id ON public.audit_log (actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_team_id ON public.audit_log (team_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log (action);

-- 3. RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Service role: full access (insert from webhooks, edge functions, triggers)
CREATE POLICY "Service role full access"
  ON public.audit_log
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Admin: read-only via is_admin()
CREATE POLICY "Admin read access"
  ON public.audit_log
  AS PERMISSIVE
  FOR SELECT
  TO public
  USING (public.is_admin());
