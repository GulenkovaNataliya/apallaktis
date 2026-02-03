// Stripe Webhook Handler
// =======================
// Обрабатывает события от Stripe (успешная оплата, ошибки и т.д.)
// ВАЖНО: Это критически важный endpoint для безопасности платежей!

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';
import { sendAccountPurchaseEmail } from '@/lib/email/send';
import { sendReceiptEmail } from '@/lib/email/send-receipt';
import { sendReferralPurchaseEmail, sendAdminPaymentNotificationEmail } from '@/lib/email/notifications';
import { addCalendarMonthClamped } from '@/lib/date-utils';
import { sendTelegramMessage, formatPaymentMessage } from '@/lib/telegram';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

/**
 * Record payment in payments table for admin journal.
 * Returns true if new record created, false if duplicate (already exists).
 * This is the single source of truth for payment deduplication + Telegram.
 *
 * NOTE: amount is in EUR (not cents) — Stripe returns cents, we divide by 100 before calling.
 * NOTE: Uses service role client to bypass RLS (webhook has no user auth context).
 */
async function recordPayment(data: {
  userId: string;
  stripeEventId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  paidAt: Date;
  amount: number;  // EUR, not cents!
  currency?: string;
  type: 'account_purchase' | 'subscription_payment';
  plan?: string;
}): Promise<boolean> {
  // Use service role client for webhook operations (no user auth context)
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js');
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const { error } = await supabase
    .from('payments')
    .insert({
      user_id: data.userId,
      stripe_event_id: data.stripeEventId,
      stripe_customer_id: data.stripeCustomerId || null,
      stripe_subscription_id: data.stripeSubscriptionId || null,
      paid_at: data.paidAt.toISOString(),
      amount: data.amount,
      currency: data.currency || 'eur',
      type: data.type,
      plan: data.plan || null,
    });

  if (error) {
    // Duplicate (unique constraint on stripe_event_id) = already processed
    if (error.code === '23505') {
      console.log(`ℹ️ WEBHOOK: Payment already recorded for event ${data.stripeEventId}`);
      return false;
    }
    console.error('❌ WEBHOOK: Failed to record payment:', error.message);
    return false;
  }

  console.log(`✅ WEBHOOK: Payment recorded: ${data.type}, €${data.amount}`);
  return true;
}

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
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, event.id);
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
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice, event.id);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'payment_intent.succeeded':
        console.log('✅ WEBHOOK: Платеж успешен');
        break;

      case 'payment_intent.payment_failed':
        // Email отправляется через invoice.payment_failed (содержит привязку к подписке)
        console.log('❌ WEBHOOK: Платеж отклонен (email через invoice.payment_failed)');
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
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, eventId: string) {
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
    // Используем время из Stripe события (не new Date()), чтобы не терять время при задержке webhook
    const purchaseDate = new Date(session.created * 1000); // session.created - Unix timestamp в секундах
    const purchasedAt = purchaseDate.toISOString();
    // Бесплатный месяц = 1 календарный месяц от даты покупки (не 30 дней!)
    // Например: 31 Jan → 28/29 Feb, 15 Mar → 15 Apr
    const firstMonthFreeExpiresAt = addCalendarMonthClamped(purchaseDate);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        account_purchased: true,
        account_purchased_at: purchasedAt,
        first_month_free_expires_at: firstMonthFreeExpiresAt.toISOString(),
        subscription_status: 'active',
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ WEBHOOK: Ошибка активации аккаунта:', updateError);
      throw updateError;
    }

    console.log(`✅ WEBHOOK: Аккаунт #${accountNumber} активирован для пользователя ${userId}`);

    // 🎁 РЕФЕРАЛЬНАЯ ПРОГРАММА: Начисление bonus month
    // Если пользователь пришел по реферальной ссылке - начислить +1 месяц рефереру
    // ТОЛЬКО за реальный платеж (не $0 / trial)
    const paymentAmount = (session.amount_total || 0) / 100;

    if (profile.referred_by) {
      console.log(`🎁 WEBHOOK: Пользователь пришел по реферальной ссылке: ${profile.referred_by}`);
      console.log(`   Сумма платежа: ${paymentAmount}€`);
      await rewardReferrer(userId, profile.referred_by, profile.email, paymentAmount);
    } else {
      console.log('ℹ️ WEBHOOK: Пользователь не использовал реферальную ссылку');
    }

    // Получаем email пользователя
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const userEmail = user?.email;
    const userLocale = session.metadata?.locale || 'el';

    if (userEmail) {
      // Отправить email с благодарностью
      await sendAccountPurchaseEmail(userEmail, parseInt(accountNumber || '0'), userLocale);

      // Сгенерировать и отправить подтверждение оплаты (НЕ налоговый документ!)
      await generateAndSendReceipt(userEmail, session, profile, userLocale);

      // 📧 Уведомление администратору для выдачи Τιμολόγιο через myDATA
      const adminEmail = process.env.ADMIN_EMAIL;
      if (adminEmail) {
        const totalAmount = (session.amount_total || 0) / 100;
        const taxAmount = totalAmount * 0.24 / 1.24;
        const baseAmount = totalAmount - taxAmount;

        await sendAdminPaymentNotificationEmail(adminEmail, {
          legalName: profile.company_name || profile.name || '',
          afm: profile.afm || '',
          address: profile.address || '',
          clientEmail: userEmail,
          amount: baseAmount,
          tax: taxAmount,
          total: totalAmount,
          paymentType: 'purchase',
          accountNumber: profile.account_number,
          stripePaymentId: session.payment_intent as string,
        });

        console.log('✅ WEBHOOK: Уведомление администратору отправлено');
      }
    }

    // 📋 Записываем платёж в журнал (для админки) + 📱 Telegram если новый
    const isNewPayment = await recordPayment({
      userId,
      stripeEventId: eventId,
      stripeCustomerId: session.customer as string,
      paidAt: purchaseDate,
      amount: paymentAmount,
      type: 'account_purchase',
    });

    if (isNewPayment) {
      try {
        await sendTelegramMessage(formatPaymentMessage({
          type: 'account_purchase',
          userId,
          email: userEmail,
          amount: paymentAmount,
          paidAt: purchaseDate.toISOString(),
        }));
        console.log('✅ WEBHOOK: Telegram уведомление отправлено');
      } catch (e) {
        console.error('⚠️ WEBHOOK: Telegram error (non-fatal):', e);
      }
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
 *
 * ОГРАНИЧЕНИЯ ANTI-FRAUD:
 * 1. Нельзя приглашать самого себя (проверка на этапе регистрации)
 * 2. Бонус только за реального платящего клиента (проверка payment_status)
 * 3. Защита от цепочек фейков (проверки ниже)
 */
async function rewardReferrer(
  newUserId: string,
  referralCode: string,
  newUserEmail: string,
  paymentAmount: number
) {
  console.log('🎁 WEBHOOK: Начисление bonus month рефереру...', referralCode);

  const supabase = await createClient();

  try {
    // ⚠️ ANTI-FRAUD ПРОВЕРКА 1: Платеж должен быть реальным (не $0)
    if (paymentAmount <= 0) {
      console.error('❌ WEBHOOK: Отклонено - платеж $0 (trial/free):', newUserEmail);
      return;
    }

    // Находим реферера по его referral_code
    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id, email, bonus_months, referrals_count, name, preferred_language, account_purchased, subscription_status, vip_expires_at')
      .eq('referral_code', referralCode)
      .single();

    if (referrerError || !referrer) {
      console.error('❌ WEBHOOK: Реферер не найден по коду:', referralCode);
      return;
    }

    // ⚠️ ANTI-FRAUD ПРОВЕРКА 2: Нельзя приглашать самого себя
    if (referrer.email?.toLowerCase() === newUserEmail.toLowerCase()) {
      console.error('❌ WEBHOOK: Отклонено - попытка self-referral:', newUserEmail);
      return;
    }

    // ⚠️ ANTI-FRAUD ПРОВЕРКА 3: Реферер должен сам иметь оплаченный аккаунт ИЛИ быть VIP
    const isVip = referrer.subscription_status === 'vip';
    if (!referrer.account_purchased && !isVip) {
      console.error('❌ WEBHOOK: Отклонено - реферер без оплаченного аккаунта и не VIP:', referralCode);
      return;
    }

    // ⚠️ ANTI-FRAUD ПРОВЕРКА 4: Проверка на цепочки фейков
    // Получаем всех рефералов этого реферера за последние 24 часа
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    const { data: recentReferrals, error: recentError } = await supabase
      .from('profiles')
      .select('id, email, created_at')
      .eq('referred_by', referralCode)
      .gte('created_at', oneDayAgo.toISOString());

    if (!recentError && recentReferrals && recentReferrals.length >= 5) {
      // Более 5 рефералов за 24 часа - подозрительная активность
      console.error('⚠️ WEBHOOK: Подозрительная активность - слишком много рефералов за 24ч:', {
        referralCode,
        count: recentReferrals.length,
        referrerEmail: referrer.email,
      });
      // Продолжаем начисление, но логируем для ручной проверки
    }

    // ⚠️ ANTI-FRAUD ПРОВЕРКА 5: Проверка на одинаковый email domain
    const newUserDomain = newUserEmail.split('@')[1]?.toLowerCase();
    const referrerDomain = referrer.email?.split('@')[1]?.toLowerCase();

    if (newUserDomain && referrerDomain && newUserDomain === referrerDomain) {
      // Одинаковый домен email - может быть легитимно (корпоративный), логируем
      console.log('⚠️ WEBHOOK: Внимание - одинаковый email domain:', {
        referralCode,
        domain: newUserDomain,
      });
    }

    // ✅ Все проверки пройдены - начисляем бонус
    // Специальная логика для VIP:
    // - VIP навсегда (vip_expires_at = null) → не добавляем bonus (некуда), но считаем реферала
    // - VIP до даты (vip_expires_at !== null) → добавляем +1 месяц к vip_expires_at
    // - Обычный пользователь → добавляем +1 к bonus_months

    let updateData: any = {
      referrals_count: (referrer.referrals_count || 0) + 1,
    };

    let bonusMessage = '';

    if (isVip) {
      if (referrer.vip_expires_at === null) {
        // VIP навсегда — бонус не начисляется (некуда добавить)
        bonusMessage = 'VIP навсегда - бонус не нужен';
        console.log(`ℹ️ WEBHOOK: Реферер ${referrer.id} - VIP навсегда, бонус не начисляется`);
      } else {
        // VIP до определённой даты — добавляем +1 календарный месяц
        // Если VIP ещё не истёк → добавляем к дате истечения (накопление)
        // Если VIP уже истёк → добавляем от текущей даты (реактивация)
        const now = new Date();
        const vipExpiresDate = new Date(referrer.vip_expires_at);
        const baseDate = vipExpiresDate > now ? vipExpiresDate : now;
        const newVipExpires = addCalendarMonthClamped(baseDate);
        updateData.vip_expires_at = newVipExpires.toISOString();
        bonusMessage = `VIP продлён до ${newVipExpires.toLocaleDateString()}`;
        console.log(`✅ WEBHOOK: +1 месяц к VIP для реферера ${referrer.id}`);
        console.log(`   База: ${baseDate.toISOString()} (${vipExpiresDate > now ? 'ещё активен' : 'уже истёк'})`);
        console.log(`   Новая дата VIP: ${newVipExpires.toISOString()}`);
      }
    } else {
      // Обычный пользователь — добавляем bonus_months
      const newBonusMonths = (referrer.bonus_months || 0) + 1;
      updateData.bonus_months = newBonusMonths;
      bonusMessage = `+1 bonus month (всего: ${newBonusMonths})`;
      console.log(`✅ WEBHOOK: +1 bonus month начислен рефереру ${referrer.id}`);
      console.log(`   Новый баланс: ${newBonusMonths} bonus months`);
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', referrer.id);

    if (updateError) {
      console.error('❌ WEBHOOK: Ошибка начисления бонуса:', updateError);
      throw updateError;
    }

    // 📧 Отправляем email рефереру о получении бонуса
    // Для VIP навсегда — не отправляем (нет бонуса)
    // Для VIP до даты или обычного пользователя — отправляем
    if (referrer.email && !(isVip && referrer.vip_expires_at === null)) {
      const { data: { user: newUser } } = await supabase.auth.admin.getUserById(newUserId);
      const newUserName = newUser?.user_metadata?.name || newUserEmail.split('@')[0];

      // Для email используем общий счётчик бонусов (или 1 для VIP с датой)
      const bonusCount = isVip ? 1 : (updateData.bonus_months || 1);

      await sendReferralPurchaseEmail(
        referrer.email,
        newUserName,
        bonusCount,
        referrer.preferred_language || 'el'
      );

      console.log(`✅ WEBHOOK: Email о bonus month отправлен рефереру ${referrer.email}`);
    }

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
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice, eventId: string) {
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

    // Получаем email пользователя
    const { data: { user } } = await supabase.auth.admin.getUserById(userId);
    const userEmail = user?.email;

    // Отправляем чек/инвойс на email (только если были списаны деньги)
    if (bonusMonths === 0) {
      const userLocale = subscription.metadata?.locale || 'el';

      if (userEmail && invoice.amount_paid > 0) {
        const totalAmount = (invoice.amount_paid || 0) / 100;
        const taxAmount = totalAmount * 0.24 / 1.24;
        const baseAmount = totalAmount - taxAmount;

        // Отправить подтверждение оплаты пользователю
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

        console.log('✅ WEBHOOK: Подтверждение оплаты за подписку отправлено');

        // 📧 Уведомление администратору для выдачи Τιμολόγιο
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail) {
          await sendAdminPaymentNotificationEmail(adminEmail, {
            legalName: profile.company_name || profile.name || '',
            afm: profile.afm || '',
            address: profile.address || '',
            clientEmail: userEmail,
            amount: baseAmount,
            tax: taxAmount,
            total: totalAmount,
            paymentType: 'subscription',
            plan: plan || '',
            accountNumber: profile.account_number,
            stripePaymentId: (invoice as any).payment_intent || invoice.id,
          });

          console.log('✅ WEBHOOK: Уведомление администратору отправлено (подписка)');
        }
      }
    }

    // 📋 Записываем платёж в журнал (для админки) + 📱 Telegram если новый
    const paymentAmount = (invoice.amount_paid || 0) / 100;
    if (paymentAmount > 0) {
      // Use status_transitions.paid_at (actual payment time) if available,
      // otherwise fallback to invoice.created (invoice creation time).
      // paid_at is more accurate as it reflects when money was actually received.
      const paidTimestamp = (invoice as any).status_transitions?.paid_at || invoice.created || (Date.now() / 1000);
      const isNewPayment = await recordPayment({
        userId,
        stripeEventId: eventId,
        stripeCustomerId: invoice.customer as string,
        stripeSubscriptionId: subscriptionId,
        paidAt: new Date(paidTimestamp * 1000),
        amount: paymentAmount,
        type: 'subscription_payment',
        plan: plan || undefined,
      });

      if (isNewPayment) {
        try {
          await sendTelegramMessage(formatPaymentMessage({
            type: 'subscription',
            userId,
            email: userEmail,
            amount: paymentAmount,
            plan: plan || undefined,
            paidAt: new Date(paidTimestamp * 1000).toISOString(),
          }));
          console.log('✅ WEBHOOK: Telegram уведомление отправлено (подписка)');
        } catch (e) {
          console.error('⚠️ WEBHOOK: Telegram error (non-fatal):', e);
        }
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

    // Get user profile for email and locale
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, account_number, preferred_language')
      .eq('id', userId)
      .single();

    if (profile?.email) {
      // Send payment failed email
      const { sendPaymentFailedEmail } = await import('@/lib/email/notifications');
      const amount = (invoice.amount_due || 0) / 100; // Convert from cents

      await sendPaymentFailedEmail(
        profile.email,
        profile.account_number || 0,
        amount,
        profile.preferred_language || 'el'
      );

      console.log(`✅ WEBHOOK: Email об ошибке оплаты отправлен на ${profile.email}`);
    } else {
      console.log(`⚠️ WEBHOOK: Email не найден для пользователя ${userId}`);
    }

    console.log(`⚠️ WEBHOOK: Платеж не прошел для пользователя ${userId}`);
    console.log('   Пользователю отправлено уведомление');

  } catch (error) {
    console.error('❌ WEBHOOK: Ошибка при обработке failed invoice:', error);
    throw error;
  }
}
