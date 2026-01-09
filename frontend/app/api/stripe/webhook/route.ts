// Stripe Webhook Handler
// =======================
// Обрабатывает события от Stripe (успешная оплата, ошибки и т.д.)
// ВАЖНО: Это критически важный endpoint для безопасности платежей!

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { sendAccountPurchaseEmail } from '@/lib/email/send';
import { sendReceiptEmail } from '@/lib/email/send-receipt';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  try {
    // Получаем тело запроса как текст (не JSON!)
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('⚠️ WEBHOOK: Отсутствует Stripe signature');
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    if (!webhookSecret) {
      console.error('⚠️ WEBHOOK: STRIPE_WEBHOOK_SECRET не настроен!');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Проверяем подпись события (ВАЖНО для безопасности!)
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('⚠️ WEBHOOK: Ошибка проверки подписи:', err.message);
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    console.log('✅ WEBHOOK: Получено событие:', event.type);

    // Обрабатываем различные типы событий
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'payment_intent.succeeded':
        console.log('✅ WEBHOOK: Платеж успешен');
        break;

      case 'payment_intent.payment_failed':
        console.log('❌ WEBHOOK: Платеж отклонен');
        // TODO: Отправить email пользователю об ошибке
        break;

      default:
        console.log(`ℹ️ WEBHOOK: Необработанное событие: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('❌ WEBHOOK: Ошибка обработки:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Обработка успешного завершения Checkout Session
 * Активирует аккаунт и отправляет чек/инвойс
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  console.log('💳 WEBHOOK: Обработка успешной оплаты...', session.id);

  const supabase = await createClient();

  // Извлекаем metadata из session
  const userId = session.metadata?.user_id;
  const accountNumber = session.metadata?.account_number;
  const invoiceType = session.metadata?.invoice_type;

  if (!userId) {
    console.error('❌ WEBHOOK: user_id не найден в metadata');
    return;
  }

  try {
    // Получаем профиль пользователя (до обновления, чтобы иметь все данные)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('❌ WEBHOOK: Профиль не найден:', profileError);
      throw profileError || new Error('Profile not found');
    }

    // Активируем аккаунт пользователя
    const now = new Date().toISOString();
    const firstMonthFreeExpiresAt = new Date();
    firstMonthFreeExpiresAt.setDate(firstMonthFreeExpiresAt.getDate() + 30);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        account_purchased: true,
        account_purchased_at: now,
        first_month_free_expires_at: firstMonthFreeExpiresAt.toISOString(),
        subscription_status: 'active',
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ WEBHOOK: Ошибка активации аккаунта:', updateError);
      throw updateError;
    }

    console.log(`✅ WEBHOOK: Аккаунт #${accountNumber} активирован для пользователя ${userId}`);

    // Получаем email пользователя
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const userEmail = user?.email;
    const userLocale = session.metadata?.locale || 'el';

    if (userEmail) {
      // Отправить email с благодарностью
      await sendAccountPurchaseEmail(userEmail, parseInt(accountNumber || '0'), userLocale);

      // Сгенерировать и отправить чек/инвойс
      await generateAndSendReceipt(userEmail, session, profile, userLocale);
    }

  } catch (error) {
    console.error('❌ WEBHOOK: Ошибка при обработке оплаты:', error);
    throw error;
  }
}


/**
 * Генерация и отправка чека/инвойса
 */
async function generateAndSendReceipt(
  userEmail: string,
  session: Stripe.Checkout.Session,
  profile: any,
  locale: string
) {
  console.log('📄 WEBHOOK: Генерация чека/инвойса...');

  const invoiceType = profile.invoice_type || 'receipt';
  console.log(`   Тип документа: ${invoiceType === 'invoice' ? 'ИНВОЙС (τιμολόγιο)' : 'ЧЕК (απόδειξη)'}`);

  // Рассчитываем суммы (Stripe возвращает в копейках)
  const totalAmount = (session.amount_total || 0) / 100;
  const taxAmount = totalAmount * 0.24 / 1.24; // ΦΠΑ 24%
  const baseAmount = totalAmount - taxAmount;

  console.log(`   Базовая сумма: ${baseAmount.toFixed(2)}€`);
  console.log(`   ΦΠΑ 24%: ${taxAmount.toFixed(2)}€`);
  console.log(`   Итого: ${totalAmount.toFixed(2)}€`);

  try {
    // Отправляем чек/инвойс на email
    await sendReceiptEmail(
      userEmail,
      {
        accountNumber: profile.account_number,
        amount: baseAmount,
        tax: taxAmount,
        total: totalAmount,
        date: new Date(),
        invoiceType: invoiceType as 'receipt' | 'invoice',
        companyName: profile.company_name,
        afm: profile.afm,
        doy: profile.doy,
      },
      locale
    );

    console.log('✅ WEBHOOK: Чек/инвойс отправлен на email');

    // TODO: Сохранение PDF в Supabase Storage (опционально)
    // const pdf = await generatePDF(receiptHTML);
    // await supabase.storage.from('receipts').upload(`${userId}/receipt_${accountNumber}.pdf`, pdf);

  } catch (error) {
    console.error('❌ WEBHOOK: Ошибка отправки чека/инвойса:', error);
    throw error;
  }
}

/**
 * Обработка создания новой подписки
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('📅 WEBHOOK: Создание новой подписки...', subscription.id);

  const supabase = await createClient();
  const userId = subscription.metadata?.user_id;
  const plan = subscription.metadata?.plan; // 'basic', 'standard', 'premium'

  if (!userId) {
    console.error('❌ WEBHOOK: user_id не найден в metadata');
    return;
  }

  try {
    const now = new Date().toISOString();

    // Рассчитываем дату окончания подписки (через 1 месяц)
    const subscriptionExpiresAt = new Date((subscription as any).current_period_end * 1000).toISOString();

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_plan: plan || null,
        subscription_status: 'active',
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer as string,
        subscription_expires_at: subscriptionExpiresAt,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ WEBHOOK: Ошибка активации подписки:', updateError);
      throw updateError;
    }

    console.log(`✅ WEBHOOK: Подписка ${plan} активирована для пользователя ${userId}`);
    console.log(`   Действует до: ${subscriptionExpiresAt}`);

  } catch (error) {
    console.error('❌ WEBHOOK: Ошибка при создании подписки:', error);
    throw error;
  }
}

/**
 * Начисление bonus month рефереру
 */
async function rewardReferrer(newUserId: string, referralCode: string) {
  console.log('🎁 WEBHOOK: Начисление bonus month рефереру...', referralCode);

  const supabase = await createClient();

  try {
    // Находим реферера по его referral_code
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id, bonus_months, referrals_count')
      .eq('referral_code', referralCode)
      .single();

    if (referrerError || !referrer) {
      console.error('❌ WEBHOOK: Реферер не найден по коду:', referralCode);
      return;
    }

    // Начисляем +1 bonus month рефереру
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        bonus_months: (referrer.bonus_months || 0) + 1,
        referrals_count: (referrer.referrals_count || 0) + 1,
      })
      .eq('id', referrer.id);

    if (updateError) {
      console.error('❌ WEBHOOK: Ошибка начисления bonus month:', updateError);
      throw updateError;
    }

    console.log(`✅ WEBHOOK: +1 bonus month начислен рефереру ${referrer.id}`);
    console.log(`   Новый баланс: ${(referrer.bonus_months || 0) + 1} bonus months`);

  } catch (error) {
    console.error('❌ WEBHOOK: Ошибка при начислении bonus month:', error);
    throw error;
  }
}

/**
 * Обработка обновления подписки
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 WEBHOOK: Обновление подписки...', subscription.id);

  const supabase = await createClient();
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    console.error('❌ WEBHOOK: user_id не найден в metadata');
    return;
  }

  try {
    const status = subscription.status === 'active' ? 'active' : 'inactive';

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: status,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ WEBHOOK: Ошибка обновления подписки:', updateError);
      throw updateError;
    }

    console.log(`✅ WEBHOOK: Подписка обновлена для пользователя ${userId}, статус: ${status}`);
  } catch (error) {
    console.error('❌ WEBHOOK: Ошибка при обновлении подписки:', error);
    throw error;
  }
}

/**
 * Обработка отмены подписки
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('❌ WEBHOOK: Отмена подписки...', subscription.id);

  const supabase = await createClient();
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    console.error('❌ WEBHOOK: user_id не найден в metadata');
    return;
  }

  try {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'inactive',
        subscription_plan: null,
        stripe_subscription_id: null,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ WEBHOOK: Ошибка отмены подписки:', updateError);
      throw updateError;
    }

    console.log(`✅ WEBHOOK: Подписка отменена для пользователя ${userId}`);
  } catch (error) {
    console.error('❌ WEBHOOK: Ошибка при отмене подписки:', error);
    throw error;
  }
}

/**
 * Обработка успешной оплаты invoice (recurring payment)
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 WEBHOOK: Успешная оплата invoice...', invoice.id);

  const supabase = await createClient();
  const subscription = (invoice as any).subscription;
  const subscriptionId = typeof subscription === 'string' ? subscription : subscription?.id;

  if (!subscriptionId) {
    console.log('ℹ️ WEBHOOK: Invoice не связан с подпиской (возможно, one-time платеж)');
    return;
  }

  try {
    // Получаем информацию о подписке
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.user_id;
    const plan = subscription.metadata?.plan;

    if (!userId) {
      console.error('❌ WEBHOOK: user_id не найден в подписке');
      return;
    }

    // Получаем профиль пользователя
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('❌ WEBHOOK: Профиль не найден');
      return;
    }

    // Проверяем есть ли bonus months
    const bonusMonths = profile.bonus_months || 0;

    // Если есть bonus months, уменьшаем на 1 и НЕ списываем деньги
    if (bonusMonths > 0) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          bonus_months: bonusMonths - 1,
        })
        .eq('id', userId);

      if (updateError) {
        console.error('❌ WEBHOOK: Ошибка обновления bonus_months:', updateError);
      } else {
        console.log(`✅ WEBHOOK: Использован bonus month: ${bonusMonths} → ${bonusMonths - 1}`);
      }
    }

    // Продлеваем подписку на +1 месяц
    const subscriptionExpiresAt = new Date((subscription as any).current_period_end * 1000).toISOString();

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_expires_at: subscriptionExpiresAt,
        subscription_status: 'active',
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ WEBHOOK: Ошибка продления подписки:', updateError);
      throw updateError;
    }

    console.log(`✅ WEBHOOK: Подписка продлена до ${subscriptionExpiresAt}`);

    // Отправляем чек/инвойс на email (только если были списаны деньги)
    if (bonusMonths === 0) {
      const { data: { user } } = await supabase.auth.admin.getUserById(userId);
      const userEmail = user?.email;
      const userLocale = subscription.metadata?.locale || 'el';

      if (userEmail && invoice.amount_paid > 0) {
        const totalAmount = (invoice.amount_paid || 0) / 100;
        const taxAmount = totalAmount * 0.24 / 1.24;
        const baseAmount = totalAmount - taxAmount;

        await sendReceiptEmail(
          userEmail,
          {
            accountNumber: profile.account_number,
            amount: baseAmount,
            tax: taxAmount,
            total: totalAmount,
            date: new Date(),
            invoiceType: profile.invoice_type as 'receipt' | 'invoice',
            companyName: profile.company_name,
            afm: profile.afm,
            doy: profile.doy,
          },
          userLocale
        );

        console.log('✅ WEBHOOK: Чек/инвойс за подписку отправлен');
      }
    }

  } catch (error) {
    console.error('❌ WEBHOOK: Ошибка при обработке оплаты invoice:', error);
    throw error;
  }
}

/**
 * Обработка неудачной оплаты invoice
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('❌ WEBHOOK: Неудачная оплата invoice...', invoice.id);

  const supabase = await createClient();
  const subscription = (invoice as any).subscription;
  const subscriptionId = typeof subscription === 'string' ? subscription : subscription?.id;

  if (!subscriptionId) {
    console.log('ℹ️ WEBHOOK: Invoice не связан с подпиской');
    return;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const userId = subscription.metadata?.user_id;

    if (!userId) {
      console.error('❌ WEBHOOK: user_id не найден в подписке');
      return;
    }

    // TODO: Отправить email пользователю о неудачной оплате
    console.log(`⚠️ WEBHOOK: Платеж не прошел для пользователя ${userId}`);
    console.log('   Необходимо обновить платежный метод');

  } catch (error) {
    console.error('❌ WEBHOOK: Ошибка при обработке failed invoice:', error);
    throw error;
  }
}
