// API Route: Send SMS Verification Code
// ======================================
// Отправка SMS кода верификации на телефон пользователя

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

    const { phone, userId } = await request.json();

    if (!phone || !userId) {
      return NextResponse.json(
        { error: 'Phone and userId are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Проверяем, существует ли пользователь
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, phone, phone_verified')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Проверяем, не верифицирован ли телефон уже
    if (user.phone_verified && user.phone === phone) {
      return NextResponse.json(
        { message: 'Phone already verified' },
        { status: 200 }
      );
    }

    // Генерируем код верификации
    const code = generateVerificationCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Код действителен 10 минут

    // Сохраняем код в базу данных
    const { error: codeError } = await supabase
      .from('phone_verification_codes')
      .insert({
        user_id: userId,
        phone,
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
    const smsSent = await sendVerificationCode(phone, code);

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
    console.error('Error in send-verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
