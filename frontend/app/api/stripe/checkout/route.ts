// Stripe Checkout API Endpoint
// ==============================
// Создает Stripe Checkout Session для покупки аккаунта

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
          message: 'Добавь STRIPE_SECRET_KEY в .env.local. Смотри STRIPE_SETUP.md'
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

    // Проверяем, что аккаунт еще не куплен
    if (profile.account_purchased) {
      return NextResponse.json(
        { error: 'Аккаунт уже куплен' },
        { status: 400 }
      );
    }

    // Получаем locale из тела запроса
    const body = await request.json();
    const locale = body.locale || 'el';

    // URL для возврата
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${appUrl}/${locale}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/${locale}/purchase-account`;

    // Проверяем наличие Price ID
    const accountPriceId = process.env.STRIPE_ACCOUNT_PRICE_ID;
    console.log('🔍 STRIPE_ACCOUNT_PRICE_ID from env:', accountPriceId ? `"${accountPriceId}" (length: ${accountPriceId.length})` : 'NOT SET');

    if (!accountPriceId) {
      console.error('❌ STRIPE_ACCOUNT_PRICE_ID не установлен в environment variables');
      return NextResponse.json(
        { error: 'Stripe Price ID не настроен. Обратитесь к администратору.' },
        { status: 500 }
      );
    }

    // Валидация формата Price ID
    if (!accountPriceId.startsWith('price_')) {
      console.error('❌ Invalid STRIPE_ACCOUNT_PRICE_ID format. Expected "price_..." but got:', accountPriceId);
      return NextResponse.json(
        { error: `Неверный формат Stripe Price ID. Ожидается "price_...", получено: "${accountPriceId.substring(0, 10)}..."` },
        { status: 500 }
      );
    }

    console.log('📦 Creating checkout session with price:', accountPriceId);

    // Создаем Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: accountPriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: user.email,
      metadata: {
        user_id: user.id,
        account_number: profile.account_number.toString(),
        invoice_type: profile.invoice_type || 'receipt',
        company_name: profile.company_name || '',
        afm: profile.afm || '',
        locale: locale,
      },
      // Автоматическое начисление НДС (ΦΠΑ) для Греции
      automatic_tax: {
        enabled: true,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      {
        error: 'Ошибка создания сессии оплаты',
        message: error.message
      },
      { status: 500 }
    );
  }
}
