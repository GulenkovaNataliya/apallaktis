/**
 * Stripe Subscription Checkout API
 * Создаёт Checkout Session для ежемесячной подписки
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    const { priceId, locale = 'el' } = await request.json();

    if (!priceId) {
      console.error('❌ Missing priceId in request body');
      return NextResponse.json(
        { error: 'Missing priceId' },
        { status: 400 }
      );
    }

    console.log('📦 Subscription checkout with priceId:', priceId);

    // Получаем текущего пользователя
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Проверяем что аккаунт куплен
    if (!profile.account_purchased) {
      return NextResponse.json(
        { error: 'Account not purchased. Please purchase account first.' },
        { status: 400 }
      );
    }

    // Определяем тариф по priceId
    let planName = 'unknown';
    const basicPriceId = process.env.STRIPE_PRICE_BASIC_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC;
    const standardPriceId = process.env.STRIPE_PRICE_STANDARD_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_STANDARD;
    const premiumPriceId = process.env.STRIPE_PRICE_PREMIUM_MONTHLY || process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM;

    if (priceId === basicPriceId) {
      planName = 'basic';
    } else if (priceId === standardPriceId) {
      planName = 'standard';
    } else if (priceId === premiumPriceId) {
      planName = 'premium';
    }

    console.log('📊 Plan detection:', { priceId, planName, basicPriceId, standardPriceId, premiumPriceId });

    // Создаём Stripe Customer если не существует
    let customerId = profile.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email!,
        name: profile.name,
        phone: profile.phone,
        metadata: {
          user_id: user.id,
          account_number: profile.account_number.toString(),
        },
      });

      customerId = customer.id;

      // Сохраняем Customer ID в профиль
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Создаём Checkout Session для подписки
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Добавляем НДС 24% (Greece)
      automatic_tax: {
        enabled: false, // Отключаем автоматический расчёт, добавим вручную
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          account_number: profile.account_number.toString(),
          plan: planName,
        },
        // Дата начала подписки = сегодня
        // Дата следующего платежа = через месяц от даты покупки аккаунта
        trial_end: profile.account_purchased_at
          ? Math.floor(new Date(profile.account_purchased_at).getTime() / 1000) + 30 * 24 * 60 * 60
          : undefined,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/subscription?cancelled=true`,
      metadata: {
        user_id: user.id,
        type: 'subscription',
        plan: planName,
        locale,
        invoice_type: profile.invoice_type,
        account_number: profile.account_number.toString(),
      },
    });

    // Логируем создание subscription checkout
    console.log('✅ Subscription Checkout Session created:', {
      sessionId: session.id,
      userId: user.id,
      plan: planName,
      priceId,
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error: any) {
    console.error('❌ Subscription Checkout Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
