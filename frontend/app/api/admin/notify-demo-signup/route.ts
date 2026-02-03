/**
 * API: Notify admin about new demo signup (ONCE per user)
 *
 * Uses atomic update to ensure notification is sent only once:
 * UPDATE profiles SET demo_notified_at = now()
 * WHERE id = user_id AND demo_notified_at IS NULL
 * RETURNING ...
 *
 * If no rows returned -> already notified, skip.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTelegramMessage } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    // Check env toggle (default: enabled)
    if (process.env.TELEGRAM_DEMO_ENABLED === 'false') {
      return NextResponse.json({ success: true, skipped: 'disabled by env' });
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, check if user is demo and needs notification
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, subscription_status, demo_started_at, demo_notified_at, phone, contact_consent')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Only process demo users
    if (profile.subscription_status !== 'demo') {
      return NextResponse.json({ success: true, skipped: 'not demo' });
    }

    // Already notified?
    if (profile.demo_notified_at) {
      return NextResponse.json({ success: true, alreadySent: true });
    }

    // Set demo_started_at if not set (first time becoming demo)
    if (!profile.demo_started_at) {
      await supabase
        .from('profiles')
        .update({ demo_started_at: new Date().toISOString() })
        .eq('id', user.id);
    }

    // Atomic update: set demo_notified_at ONLY if null
    // This prevents race conditions (multiple tabs, retries)
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({ demo_notified_at: new Date().toISOString() })
      .eq('id', user.id)
      .is('demo_notified_at', null)  // Only if not already set
      .select('id, phone, contact_consent, demo_started_at')
      .single();

    if (updateError || !updated) {
      // No rows updated = already notified (race condition handled)
      return NextResponse.json({ success: true, alreadySent: true });
    }

    // Send Telegram notification
    const message = formatDemoMessage({
      email: user.email || user.id,
      phone: updated.phone,
      consent: updated.contact_consent ?? true,
      demoStartedAt: updated.demo_started_at || new Date().toISOString(),
    });

    await sendTelegramMessage(message);
    console.log(`[notify-demo-signup] Telegram sent for user ${user.id}`);

    return NextResponse.json({ success: true, sent: true });

  } catch (error: any) {
    console.error('[notify-demo-signup] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}

/**
 * Format demo signup message (simple format per user request)
 */
function formatDemoMessage(data: {
  email: string;
  phone?: string | null;
  consent: boolean;
  demoStartedAt: string;
}): string {
  return `🆕 DEMO signup: ${data.email} | phone: ${data.phone || '-'} | consent: ${data.consent} | time: ${data.demoStartedAt}`;
}
