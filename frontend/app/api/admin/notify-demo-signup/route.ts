/**
 * API: Notify admin about new demo signup
 *
 * Called on first dashboard load to send Telegram notification.
 * Uses deduplication to prevent multiple notifications.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendTelegramMessage, formatDemoSignupMessage } from '@/lib/telegram';

/**
 * Check if notification was already sent (deduplication)
 */
async function isNotificationSent(eventKey: string): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('admin_notifications_sent')
    .insert({ event_key: eventKey });

  if (error) {
    // Unique constraint violation = already sent
    if (error.code === '23505') {
      return true;
    }
    console.error('[notify-demo-signup] Dedup check error:', error.message);
  }

  return false;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check deduplication
    const eventKey = `new_demo_signup:${user.id}`;
    const alreadySent = await isNotificationSent(eventKey);

    if (alreadySent) {
      return NextResponse.json({ success: true, alreadySent: true });
    }

    // Get profile for phone and consent
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone, contact_consent')
      .eq('id', user.id)
      .single();

    // Send Telegram notification
    await sendTelegramMessage(formatDemoSignupMessage({
      userId: user.id,
      email: user.email || '',
      phone: profile?.phone || undefined,
      consent: profile?.contact_consent ?? true, // Default true if not set (they agreed to terms)
    }));

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
