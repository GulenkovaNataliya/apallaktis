// Referral Code Validation API
// =============================
// Проверяет валидность реферального кода перед регистрацией
//
// Ограничения:
// 1. Нельзя приглашать самого себя (код не должен принадлежать тому же email)
// 2. Код должен существовать в базе данных
// 3. Реферер должен иметь активный/оплаченный аккаунт

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { referralCode, userEmail } = await request.json();

    if (!referralCode) {
      return NextResponse.json({
        valid: false,
        error: 'MISSING_CODE',
        message: 'Referral code is required',
      });
    }

    const supabase = await createClient();

    // Находим реферера по коду
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id, email, referral_code, account_purchased, subscription_status')
      .eq('referral_code', referralCode.toUpperCase())
      .single();

    if (referrerError || !referrer) {
      console.log('❌ Referral validation: код не найден:', referralCode);
      return NextResponse.json({
        valid: false,
        error: 'INVALID_CODE',
        message: 'Referral code not found',
      });
    }

    // Проверка 1: Нельзя приглашать самого себя
    if (userEmail && referrer.email?.toLowerCase() === userEmail.toLowerCase()) {
      console.log('❌ Referral validation: попытка пригласить себя:', userEmail);
      return NextResponse.json({
        valid: false,
        error: 'SELF_REFERRAL',
        message: 'You cannot use your own referral code',
      });
    }

    // Проверка 2: Реферер должен иметь оплаченный аккаунт ИЛИ быть VIP
    // (VIP может использовать реферальную программу даже без account_purchased)
    const isVip = referrer.subscription_status === 'vip';
    if (!referrer.account_purchased && !isVip) {
      console.log('❌ Referral validation: реферер не оплатил аккаунт и не VIP:', referralCode);
      return NextResponse.json({
        valid: false,
        error: 'REFERRER_NOT_ACTIVE',
        message: 'Referrer account is not active',
      });
    }

    console.log('✅ Referral validation: код валидный:', referralCode);
    return NextResponse.json({
      valid: true,
      referralCode: referrer.referral_code,
    });

  } catch (error: any) {
    console.error('❌ Referral validation error:', error);
    return NextResponse.json({
      valid: false,
      error: 'SERVER_ERROR',
      message: 'Server error during validation',
    }, { status: 500 });
  }
}
