// Stripe Subscription Checkout API Endpoint
// ==========================================
// Создает Stripe Checkout Session для месячной подписки (Basic, Standard, Premium)

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

// Инициализация Stripe (server-side)
// ВАЖНО: Используй SECRET ключ (sk_test_... или sk_live_...)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    // Проверяем, что Stripe настроен
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        {
          error: 'Stripe не настроен',
          message: 'Добавь STRIPE_SECRET_KEY в .env.local'
        },
        { status: 500 }
      );
    }

    // Получаем данные пользователя из Supabase
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Не авторизован' },
        { status: 401 }
      );
    }

    // Получаем профиль пользователя
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Профиль не найден' },
        { status: 404 }
      );
    }

    // Получаем данные из тела запроса
    const body = await request.json();
    const { planId, locale = 'el' } = body;

    if (!planId || !['basic', 'standard', 'premium'].includes(planId)) {
      return NextResponse.json(
        { error: 'Неверный план подписки' },
        { status: 400 }
      );
    }

    // Получаем Price ID для выбранного плана
    const priceIds = {
      basic: process.env.STRIPE_PRICE_BASIC_MONTHLY,
      standard: process.env.STRIPE_PRICE_STANDARD_MONTHLY,
      premium: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
    };

    const priceId = priceIds[planId as keyof typeof priceIds];

    if (!priceId) {
      return NextResponse.json(
        {
          error: 'Price ID не настроен',
          message: `Добавь STRIPE_PRICE_${planId.toUpperCase()}_MONTHLY в .env.local. Смотри STRIPE_RECURRING_SETUP.md`
        },
        { status: 500 }
      );
    }

    // URL для возврата
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${appUrl}/${locale}/subscription-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/${locale}/subscription`;

    // Проверяем bonus months - если есть, даем скидку 100% на первый месяц
    const hasBonusMonths = profile.bonus_months > 0;

    // Создаем Checkout Session для подписки
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        account_number: profile.account_number.toString(),
        plan_id: planId,
        invoice_type: profile.invoice_type || 'receipt',
        company_name: profile.company_name || '',
        afm: profile.afm || '',
        referral_code: profile.referred_by || '', // Код того, кто привел этого пользователя
        bonus_months: profile.bonus_months.toString(),
      },
      // Автоматическое начисление НДС (ΦΠΑ) для Греции
      automatic_tax: {
        enabled: true,
      },
      // Разрешить применение промо-кодов
      allow_promotion_codes: true,
    };

    // Если есть bonus months, добавляем 100% скидку на первый месяц
    if (hasBonusMonths) {
      // Создаем coupon для 100% скидки на первый месяц
      const coupon = await stripe.coupons.create({
        percent_off: 100,
        duration: 'once',
        name: `Bonus Month (${profile.referral_code})`,
      });

      sessionParams.discounts = [
        {
          coupon: coupon.id,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({
      sessionId: session.id,
      hasBonusMonths,
    });

  } catch (error: any) {
    console.error('Stripe subscription checkout error:', error);
    return NextResponse.json(
      {
        error: 'Ошибка создания сессии подписки',
        message: error.message
      },
      { status: 500 }
    );
  }
}
