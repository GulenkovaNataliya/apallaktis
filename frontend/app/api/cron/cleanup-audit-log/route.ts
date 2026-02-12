// Cron Job: Cleanup old audit_log entries
// =========================================
// Deletes audit_log records older than 24 months.
// Retention policy: docs/core/AUDIT_LOG_SPEC_v1.md §1
//
// SETUP:
// - Vercel Cron or external scheduler (EasyCron, cron-job.org)
// - Run daily (e.g. 03:00 UTC)
// - Requires CRON_SECRET env variable

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Auth: verify CRON_SECRET
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Service role client (bypasses RLS)
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } },
    );

    // Delete records older than 24 months (SQL function handles the logic)
    const { data: deleted, error } = await supabase.rpc('cleanup_audit_log_retention');

    if (error) {
      console.error('❌ CRON cleanup-audit-log: rpc failed:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ CRON cleanup-audit-log: deleted ${deleted} rows`);

    return NextResponse.json({ deleted });
  } catch (error: unknown) {
    console.error('❌ CRON cleanup-audit-log error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
