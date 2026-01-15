// API Route: Send SMS Verification Code for Registration
// ======================================================
// Отправка SMS кода верификации для регистрации (без userId)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  sendVerificationCode,
  generateVerificationCode,
  isTwilioConfigured
} from '@/lib/sms/twilio';

export async function POST(request: NextRequest) {
  try {
    // Проверка конфигурации Twilio
    if (!isTwilioConfigured()) {
      return NextResponse.json(
        { error: 'SMS service is not configured' },
        { status: 500 }
      );
    }

    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone is required' },
        { status: 400 }
      );
    }

    // Validate phone format (basic)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (!/^\+\d{10,15}$/.test(cleanPhone)) {
      return NextResponse.json(
        { error: 'Invalid phone format' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Delete any existing codes for this phone (cleanup)
    await supabase
      .from('registration_verification_codes')
      .delete()
      .eq('phone', cleanPhone);

    // Генерируем код верификации
    const code = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Код действителен 10 минут

    // Сохраняем код в базу данных
    const { error: codeError } = await supabase
      .from('registration_verification_codes')
      .insert({
        phone: cleanPhone,
        code,
        expires_at: expiresAt.toISOString(),
        verified: false,
      });

    if (codeError) {
      console.error('Error saving verification code:', codeError);
      return NextResponse.json(
        { error: 'Failed to generate verification code' },
        { status: 500 }
      );
    }

    // Отправляем SMS
    const smsSent = await sendVerificationCode(cleanPhone, code);

    if (!smsSent) {
      return NextResponse.json(
        { error: 'Failed to send SMS' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Verification code sent successfully',
        expiresAt: expiresAt.toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in send-registration-code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
