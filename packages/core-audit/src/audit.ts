/**
 * Server-side audit helpers (service_role).
 * All functions are non-fatal: errors are logged but never thrown.
 */

type LimitAction =
  | 'limits.objects_denied'
  | 'limits.team_members_denied'
  | 'limits.voice_denied'
  | 'limits.photo_denied'
  | 'limits.referral_denied'
  | 'limits.feature_denied';

const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function toUuid(v: unknown): string | null {
  return typeof v === 'string' && UUID_RE.test(v) ? v : null;
}

function getServiceClient() {
  const { createClient } = require('@supabase/supabase-js');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

/**
 * General-purpose audit log insert.
 * UUID fields are validated — non-UUID values become null.
 * Never throws — safe to call from any context.
 */
export async function logAudit(entry: {
  action: string;
  actor_type: string;
  actor_user_id?: string | null;
  team_id?: string | null;
  target_type?: string | null;
  target_id?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const sb = getServiceClient();
    await sb.from('audit_log').insert({
      action: entry.action,
      actor_type: entry.actor_type,
      actor_user_id: toUuid(entry.actor_user_id),
      team_id: toUuid(entry.team_id),
      target_type: entry.target_type ?? null,
      target_id: toUuid(entry.target_id),
      metadata: entry.metadata ?? {},
    });
  } catch (e) {
    console.error('⚠️ AUDIT: logAudit failed (non-fatal):', e);
  }
}

/**
 * Log a "limit denied" event with 10-min cooldown per user+action.
 * Safe to call from any API route — never throws.
 */
export async function logLimitDenied(params: {
  action: LimitAction;
  userId: string;
  teamId?: string | null;
  metadata: {
    tier: string;
    current?: number;
    max?: number;
    upgrade_to?: string;
    feature?: string;
    [key: string]: unknown;
  };
}) {
  try {
    const sb = getServiceClient();

    // Cooldown: skip if same user+action logged within 10 minutes
    const since = new Date(Date.now() - COOLDOWN_MS).toISOString();
    const { data: recent } = await sb
      .from('audit_log')
      .select('id')
      .eq('actor_user_id', params.userId)
      .eq('action', params.action)
      .gte('created_at', since)
      .limit(1);

    if (recent && recent.length > 0) return;

    await sb.from('audit_log').insert({
      action: params.action,
      actor_type: 'user',
      actor_user_id: params.userId,
      team_id: params.teamId ?? null,
      target_type: null,
      target_id: null,
      metadata: params.metadata,
    });
  } catch (e) {
    console.error('⚠️ AUDIT: logLimitDenied failed (non-fatal):', e);
  }
}

/**
 * Log a rate_limit.blocked event with 10-min cooldown per user.
 * For anonymous (IP-only) blocks cooldown is skipped (no stable actor_user_id).
 */
export async function logRateLimitBlocked(params: {
  userId?: string | null;
  metadata: {
    route: string;
    key_type: 'user' | 'ip';
    limit: number;
    retry_after_sec: number;
    [key: string]: unknown;
  };
}) {
  try {
    const sb = getServiceClient();

    // Cooldown: deduplicate per user within 10 minutes
    if (params.userId) {
      const since = new Date(Date.now() - COOLDOWN_MS).toISOString();
      const { data: recent } = await sb
        .from('audit_log')
        .select('id')
        .eq('actor_user_id', params.userId)
        .eq('action', 'rate_limit.blocked')
        .gte('created_at', since)
        .limit(1);

      if (recent && recent.length > 0) return;
    }

    await sb.from('audit_log').insert({
      action: 'rate_limit.blocked',
      actor_type: params.userId ? 'user' : 'system',
      actor_user_id: params.userId ?? null,
      team_id: null,
      target_type: null,
      target_id: null,
      metadata: params.metadata,
    });
  } catch (e) {
    console.error('⚠️ AUDIT: logRateLimitBlocked failed (non-fatal):', e);
  }
}
