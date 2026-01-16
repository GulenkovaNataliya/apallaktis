import { NextRequest, NextResponse } from 'next/server';
import { sendVIPCancelledEmail } from '@/lib/email/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userEmail, userName, locale } = body;

    if (!userEmail || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields: userEmail, userName' },
        { status: 400 }
      );
    }

    const success = await sendVIPCancelledEmail(
      userEmail,
      userName,
      locale || 'el'
    );

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending VIP cancelled email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
