// Cron Job: Check Expiring Subscriptions
// ========================================
// Проверяет истекающие DEMO и подписки, отправляет email уведомления
//
// SETUP:
// 1. Для локальной разработки: вызывать вручную GET http://localhost:3000/api/cron/check-expiring-subscriptions
// 2. Для production: настроить Vercel Cron или внешний сервис (EasyCron, cron-job.org)
//    Запускать каждый день в 10:00 UTC

import { createClient } from '@/lib/supabase/server';
import {
  sendDemoExpiringEmail,
  sendDemoExpiredEmail,
  sendSubscriptionExpiringEmail,
  sendSubscriptionExpiredEmail,
} from '@/lib/email/notifications';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Security: проверить секретный токен (опционально)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Текущее время
    const now = new Date();
    const oneDayFromNow = new Date();
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);

    const twoDaysFromNow = new Date();
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);

    console.log('🔍 Проверка истекающих подписок...');
    console.log('Текущее время:', now.toISOString());
    console.log('Через 24 часа:', oneDayFromNow.toISOString());
    console.log('Через 2 дня:', twoDaysFromNow.toISOString());

    // ========================================
    // 1. DEMO истекает через 24 часа
    // ========================================
    const { data: expiringDemos, error: expiringDemosError } = await supabase
      .from('profiles')
      .select('id, email, account_number, demo_expires_at, preferred_language')
      .eq('subscription_status', 'demo')
      .gte('demo_expires_at', now.toISOString())
      .lte('demo_expires_at', oneDayFromNow.toISOString())
      .is('demo_expiring_email_sent', false); // Ещё не отправляли

    if (expiringDemosError) {
      console.error('❌ Ошибка получения истекающих DEMO:', expiringDemosError);
    } else if (expiringDemos && expiringDemos.length > 0) {
      console.log(`📧 Найдено ${expiringDemos.length} DEMO, истекающих через 24 часа`);

      for (const profile of expiringDemos) {
        const emailSuccess = await sendDemoExpiringEmail(
          profile.email,
          profile.account_number,
          new Date(profile.demo_expires_at!),
          profile.preferred_language || 'el'
        );

        if (emailSuccess) {
          // Пометить что email отправлен
          await supabase
            .from('profiles')
            .update({ demo_expiring_email_sent: true })
            .eq('id', profile.id);

          console.log(`✅ Email отправлен: ${profile.email} (#${profile.account_number})`);
        }
      }
    }

    // ========================================
    // 2. DEMO истекло (за последние 24 часа)
    // ========================================
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: expiredDemos, error: expiredDemosError } = await supabase
      .from('profiles')
      .select('id, email, account_number, demo_expires_at, preferred_language')
      .eq('subscription_status', 'read-only')
      .gte('demo_expires_at', yesterday.toISOString())
      .lte('demo_expires_at', now.toISOString())
      .is('demo_expired_email_sent', false);

    if (expiredDemosError) {
      console.error('❌ Ошибка получения истёкших DEMO:', expiredDemosError);
    } else if (expiredDemos && expiredDemos.length > 0) {
      console.log(`📧 Найдено ${expiredDemos.length} истёкших DEMO`);

      for (const profile of expiredDemos) {
        const emailSuccess = await sendDemoExpiredEmail(
          profile.email,
          profile.account_number,
          profile.preferred_language || 'el'
        );

        if (emailSuccess) {
          await supabase
            .from('profiles')
            .update({ demo_expired_email_sent: true })
            .eq('id', profile.id);

          console.log(`✅ Email отправлен: ${profile.email} (#${profile.account_number})`);
        }
      }
    }

    // ========================================
    // 3. Подписка истекает через 2 дня
    // ========================================
    const { data: expiringSubscriptions, error: expiringSubsError } = await supabase
      .from('profiles')
      .select('id, email, account_number, subscription_plan, subscription_expires_at, preferred_language')
      .in('subscription_status', ['active', 'vip'])
      .not('subscription_expires_at', 'is', null)
      .gte('subscription_expires_at', now.toISOString())
      .lte('subscription_expires_at', twoDaysFromNow.toISOString())
      .is('subscription_expiring_email_sent', false);

    if (expiringSubsError) {
      console.error('❌ Ошибка получения истекающих подписок:', expiringSubsError);
    } else if (expiringSubscriptions && expiringSubscriptions.length > 0) {
      console.log(`📧 Найдено ${expiringSubscriptions.length} подписок, истекающих через 2 дня`);

      for (const profile of expiringSubscriptions) {
        const emailSuccess = await sendSubscriptionExpiringEmail(
          profile.email,
          profile.account_number,
          profile.subscription_plan || 'Basic',
          new Date(profile.subscription_expires_at!),
          profile.preferred_language || 'el'
        );

        if (emailSuccess) {
          await supabase
            .from('profiles')
            .update({ subscription_expiring_email_sent: true })
            .eq('id', profile.id);

          console.log(`✅ Email отправлен: ${profile.email} (#${profile.account_number})`);
        }
      }
    }

    // ========================================
    // 4. Подписка истекла (за последние 24 часа)
    // ========================================
    const { data: expiredSubscriptions, error: expiredSubsError } = await supabase
      .from('profiles')
      .select('id, email, account_number, subscription_expires_at, preferred_language')
      .eq('subscription_status', 'expired')
      .gte('subscription_expires_at', yesterday.toISOString())
      .lte('subscription_expires_at', now.toISOString())
      .is('subscription_expired_email_sent', false);

    if (expiredSubsError) {
      console.error('❌ Ошибка получения истёкших подписок:', expiredSubsError);
    } else if (expiredSubscriptions && expiredSubscriptions.length > 0) {
      console.log(`📧 Найдено ${expiredSubscriptions.length} истёкших подписок`);

      for (const profile of expiredSubscriptions) {
        const emailSuccess = await sendSubscriptionExpiredEmail(
          profile.email,
          profile.account_number,
          profile.preferred_language || 'el'
        );

        if (emailSuccess) {
          await supabase
            .from('profiles')
            .update({ subscription_expired_email_sent: true })
            .eq('id', profile.id);

          console.log(`✅ Email отправлен: ${profile.email} (#${profile.account_number})`);
        }
      }
    }

    // ========================================
    // 5. Бесплатный месяц истекает через 2 дня
    // ========================================
    const { data: expiringFreeMonth, error: expiringFreeMonthError } = await supabase
      .from('profiles')
      .select('id, email, account_number, first_month_free_expires_at, preferred_language')
      .eq('account_purchased', true)
      .is('subscription_plan', null) // Ещё не выбрал план
      .not('first_month_free_expires_at', 'is', null)
      .gte('first_month_free_expires_at', now.toISOString())
      .lte('first_month_free_expires_at', twoDaysFromNow.toISOString())
      .is('free_month_expiring_email_sent', false);

    if (expiringFreeMonthError) {
      console.error('❌ Ошибка получения истекающих бесплатных месяцев:', expiringFreeMonthError);
    } else if (expiringFreeMonth && expiringFreeMonth.length > 0) {
      console.log(`📧 Найдено ${expiringFreeMonth.length} бесплатных месяцев, истекающих через 2 дня`);

      for (const profile of expiringFreeMonth) {
        // Используем ту же функцию для истекающей подписки
        const emailSuccess = await sendSubscriptionExpiringEmail(
          profile.email,
          profile.account_number,
          'Free Month', // Название периода
          new Date(profile.first_month_free_expires_at!),
          profile.preferred_language || 'el'
        );

        if (emailSuccess) {
          await supabase
            .from('profiles')
            .update({ free_month_expiring_email_sent: true })
            .eq('id', profile.id);

          console.log(`✅ Email отправлен: ${profile.email} (#${profile.account_number})`);
        }
      }
    }

    // ========================================
    // 6. Бесплатный месяц истёк - нужно выбрать подписку
    // ========================================
    const { data: expiredFreeMonth, error: expiredFreeMonthError } = await supabase
      .from('profiles')
      .select('id, email, account_number, first_month_free_expires_at, preferred_language')
      .eq('account_purchased', true)
      .is('subscription_plan', null)
      .not('first_month_free_expires_at', 'is', null)
      .lte('first_month_free_expires_at', now.toISOString())
      .is('free_month_expired_email_sent', false);

    if (expiredFreeMonthError) {
      console.error('❌ Ошибка получения истёкших бесплатных месяцев:', expiredFreeMonthError);
    } else if (expiredFreeMonth && expiredFreeMonth.length > 0) {
      console.log(`📧 Найдено ${expiredFreeMonth.length} истёкших бесплатных месяцев`);

      for (const profile of expiredFreeMonth) {
        const emailSuccess = await sendSubscriptionExpiredEmail(
          profile.email,
          profile.account_number,
          profile.preferred_language || 'el'
        );

        if (emailSuccess) {
          await supabase
            .from('profiles')
            .update({ free_month_expired_email_sent: true })
            .eq('id', profile.id);

          console.log(`✅ Email отправлен: ${profile.email} (#${profile.account_number})`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      checked_at: now.toISOString(),
      stats: {
        expiring_demos: expiringDemos?.length || 0,
        expired_demos: expiredDemos?.length || 0,
        expiring_subscriptions: expiringSubscriptions?.length || 0,
        expired_subscriptions: expiredSubscriptions?.length || 0,
        expiring_free_months: expiringFreeMonth?.length || 0,
        expired_free_months: expiredFreeMonth?.length || 0,
      },
    });
  } catch (error) {
    console.error('❌ Ошибка в cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
