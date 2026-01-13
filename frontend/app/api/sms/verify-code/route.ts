// API Route: Verify SMS Code
// ===========================
// Проверка SMS кода верификации

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { code, userId, phone } = await request.json();

    if (!code || !userId || !phone) {
      return NextResponse.json(
        { error: 'Code, userId, and phone are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Ищем код верификации
    const { data: verificationRecord, error: findError } = await supabase
      .from('phone_verification_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('phone', phone)
      .eq('code', code)
      .eq('verified', false)
      .single();

    if (findError || !verificationRecord) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Проверяем, не истек ли код
    const now = new Date();
    const expiresAt = new Date(verificationRecord.expires_at);

    if (now > expiresAt) {
      return NextResponse.json(
        { error: 'Verification code expired' },
        { status: 400 }
      );
    }

    // Помечаем код как использованный
    await supabase
      .from('phone_verification_codes')
      .update({ verified: true })
      .eq('id', verificationRecord.id);

    // Обновляем профиль пользователя
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        phone,
        phone_verified: true,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to verify phone' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Phone verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in verify-code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
