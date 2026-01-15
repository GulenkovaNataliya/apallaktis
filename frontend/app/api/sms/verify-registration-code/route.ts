// API Route: Verify SMS Code for Registration
// ============================================
// Проверка SMS кода верификации для регистрации (без userId)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return NextResponse.json(
        { error: 'Phone and code are required' },
        { status: 400 }
      );
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid code format' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    const supabase = await createClient();

    // Ищем действительный код
    const { data: verification, error: verifyError } = await supabase
      .from('registration_verification_codes')
      .select('*')
      .eq('phone', cleanPhone)
      .eq('code', code)
      .eq('verified', false)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (verifyError || !verification) {
      return NextResponse.json(
        { error: 'Invalid or expired code' },
        { status: 400 }
      );
    }

    // Помечаем код как использованный
    await supabase
      .from('registration_verification_codes')
      .update({ verified: true })
      .eq('id', verification.id);

    return NextResponse.json(
      { message: 'Phone verified successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in verify-registration-code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
