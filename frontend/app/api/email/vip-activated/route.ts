import { NextRequest, NextResponse } from 'next/server';
import { sendVIPActivatedEmail } from '@/lib/email/notifications';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userEmail, userName, expiresAt, reason, locale } = body;

    if (!userEmail) {
      return NextResponse.json({ error: 'Missing userEmail' }, { status: 400 });
    }

    // Get user's account number
    let accountNumber = 0;
    if (userId) {
      const supabase = await createClient();
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_number')
        .eq('id', userId)
        .single();

      accountNumber = profile?.account_number || 0;
    }

    // Parse expiration date if provided
    const vipExpiresAt = expiresAt ? new Date(expiresAt) : null;

    const success = await sendVIPActivatedEmail(
      userEmail,
      accountNumber,
      vipExpiresAt,
      reason,
      locale || 'el'
    );

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending VIP activated email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
