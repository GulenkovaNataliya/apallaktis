# SUBSCRIPTION_SYSTEM.md — Система подписок

Документация системы подписок на базе Stripe.

---

## Содержание

1. [Stripe интеграция](#stripe-интеграция)
2. [Тарифы](#тарифы)
3. [Webhooks](#webhooks)
4. [Проверка подписки в коде](#проверка-подписки-в-коде)
5. [Ограничения по плану](#ограничения-по-плану)
6. [Примеры кода](#примеры-кода)

---

## Stripe интеграция

### Переменные окружения

```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Файлы интеграции

```
frontend/app/api/stripe/
├── checkout/route.ts            # Покупка аккаунта (62€)
├── subscription-checkout/route.ts # Подписка (recurring)
└── webhook/route.ts             # Обработка событий Stripe
```

### Stripe Price IDs

```typescript
// Примеры (замените на реальные)
const STRIPE_PRICES = {
  account_purchase: 'price_account_62eur',
  basic_monthly: 'price_basic_monthly',
  standard_monthly: 'price_standard_monthly',
  premium_monthly: 'price_premium_monthly',
};
```

---

## Тарифы

### Таблица тарифов

| Тариф | Цена/месяц | Цена/год | Описание |
|-------|------------|----------|----------|
| **DEMO** | Бесплатно | — | 48 часов пробного периода |
| **Basic** | €24,80 | €297,60 | Базовый функционал |
| **Standard** | €49,60 | €595,20 | Расширенный функционал |
| **Premium** | €93,00 | €1116,00 | Полный функционал |
| **VIP** | Бесплатно | — | Выдаётся админом |

> Все цены включают ΦΠΑ 24% (греческий НДС)

### Покупка аккаунта

- **Цена:** €62 (разовый платёж)
- **Бонус:** +1 месяц бесплатно
- **Поле:** `first_month_free_expires_at`

### Жизненный цикл подписки

```
Регистрация → DEMO (48 часов)
                ↓
        Покупка аккаунта (€62)
                ↓
        account_purchased = true
        first_month_free_expires_at = +30 дней
                ↓
        Выбор плана (Basic/Standard/Premium)
                ↓
        Stripe Subscription создана
        subscription_status = 'active'
        subscription_expires_at = дата
                ↓
        Ежемесячное списание
        invoice.payment_succeeded
                ↓
        subscription_expires_at обновляется
```

---

## Webhooks

### Настройка Webhook

**URL:** `https://yourdomain.com/api/stripe/webhook`

**События для подписки:**
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### Обработчики событий

#### `checkout.session.completed`

```typescript
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.user_id;
  const plan = session.metadata?.plan;

  // Активация аккаунта
  await supabase
    .from('profiles')
    .update({
      account_purchased: true,
      account_purchased_at: new Date().toISOString(),
      subscription_status: 'active',
      subscription_plan: plan,
      stripe_customer_id: session.customer,
    })
    .eq('id', userId);

  // Реферальный бонус
  await rewardReferrer(userId);

  // Отправка чека
  await sendReceiptEmail(userId, session);
}
```

#### `customer.subscription.created`

```typescript
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer;

  // Найти пользователя по stripe_customer_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();

  // Установить дату истечения
  const expiresAt = new Date(subscription.current_period_end * 1000);

  await supabase
    .from('profiles')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_expires_at: expiresAt.toISOString(),
      subscription_status: 'active',
    })
    .eq('id', profile.id);
}
```

#### `customer.subscription.updated`

```typescript
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const status = subscription.status === 'active' ? 'active' : 'expired';

  await supabase
    .from('profiles')
    .update({
      subscription_status: status,
      subscription_expires_at: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}
```

#### `customer.subscription.deleted`

```typescript
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await supabase
    .from('profiles')
    .update({
      subscription_status: 'expired',
      stripe_subscription_id: null,
    })
    .eq('stripe_subscription_id', subscription.id);
}
```

#### `invoice.payment_succeeded`

```typescript
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription;

  // Использовать бонусные месяцы если есть
  const { data: profile } = await supabase
    .from('profiles')
    .select('bonus_months')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  if (profile?.bonus_months > 0) {
    // Добавить бонусный месяц к expiration
    const currentExpires = new Date(profile.subscription_expires_at);
    currentExpires.setMonth(currentExpires.getMonth() + 1);

    await supabase
      .from('profiles')
      .update({
        bonus_months: profile.bonus_months - 1,
        subscription_expires_at: currentExpires.toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);
  }

  // Отправить чек
  await sendReceiptEmail(profile.id, invoice);
}
```

#### `invoice.payment_failed`

```typescript
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  // Логирование
  console.error('Payment failed:', invoice.id);

  // Отправить уведомление пользователю
  await sendPaymentFailedEmail(invoice);
}
```

### Верификация подписи

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  // Обработка события
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
    // ... другие события
  }

  return new Response('OK', { status: 200 });
}
```

---

## Проверка подписки в коде

### Основная функция: `getUserTier()`

**Файл:** `frontend/lib/subscription.ts`

```typescript
export type SubscriptionTier =
  | 'demo'
  | 'basic'
  | 'standard'
  | 'premium'
  | 'vip'
  | 'expired'
  | 'read-only';

export function getUserTier(profile: {
  subscription_status?: string;
  subscription_tier?: string;
  account_purchased?: boolean;
  demo_expires_at?: string;
  subscription_expires_at?: string;
  vip_expires_at?: string;
}): SubscriptionTier {

  // 1. Проверка VIP
  if (profile.subscription_status === 'vip') {
    if (profile.vip_expires_at) {
      const vipExpires = new Date(profile.vip_expires_at);
      if (vipExpires > new Date()) {
        return 'vip';
      }
    } else {
      return 'vip'; // Бессрочный VIP
    }
  }

  // 2. Проверка активной подписки
  if (profile.subscription_status === 'active' && profile.subscription_tier) {
    if (profile.subscription_expires_at) {
      const expires = new Date(profile.subscription_expires_at);
      if (expires < new Date()) {
        return 'expired';
      }
    }
    return profile.subscription_tier as SubscriptionTier;
  }

  // 3. Проверка DEMO
  if (profile.subscription_status === 'demo' || !profile.account_purchased) {
    if (profile.demo_expires_at) {
      const demoExpires = new Date(profile.demo_expires_at);
      if (demoExpires < new Date()) {
        return 'read-only';
      }
    }
    return 'demo';
  }

  // 4. Fallback
  return 'demo';
}
```

### Проверка доступа к функции

```typescript
export function canUseFeature(
  tier: SubscriptionTier,
  feature: keyof SubscriptionLimits
): boolean {
  const limits = getSubscriptionLimits(tier);
  return limits[feature] === true || limits[feature] === Infinity;
}
```

### Проверка лимита объектов

```typescript
export function canCreateObject(
  tier: SubscriptionTier,
  currentObjectCount: number
): boolean {
  const limits = getSubscriptionLimits(tier);
  return currentObjectCount < limits.maxObjects;
}
```

---

## Ограничения по плану

### Таблица лимитов

| Функция | Demo | Basic | Standard | Premium | VIP |
|---------|------|-------|----------|---------|-----|
| **Макс. объектов** | ∞ | 10 | 50 | ∞ | ∞ |
| **Голосовой ввод** | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Фото чеков** | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Фин. анализ** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Экспорт Excel/PDF** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Email отчёты** | ✅ | ❌ | ✅ | ✅ | ✅ |
| **Реферальная программа** | ❌ | ✅ | ✅ | ✅ | ✅ |

### Конфигурация лимитов

```typescript
export interface SubscriptionLimits {
  maxObjects: number;
  voiceInput: boolean;
  photoReceipt: boolean;
  financialAnalysis: boolean;
  exportExcelPdf: boolean;
  emailReports: boolean;
  referralProgram: boolean;
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionTier, SubscriptionLimits> = {
  demo: {
    maxObjects: Infinity,
    voiceInput: true,
    photoReceipt: true,
    financialAnalysis: true,
    exportExcelPdf: true,
    emailReports: true,
    referralProgram: false,
  },
  basic: {
    maxObjects: 10,
    voiceInput: false,
    photoReceipt: false,
    financialAnalysis: true,
    exportExcelPdf: true,
    emailReports: false,
    referralProgram: true,
  },
  standard: {
    maxObjects: 50,
    voiceInput: true,
    photoReceipt: true,
    financialAnalysis: true,
    exportExcelPdf: true,
    emailReports: true,
    referralProgram: true,
  },
  premium: {
    maxObjects: Infinity,
    voiceInput: true,
    photoReceipt: true,
    financialAnalysis: true,
    exportExcelPdf: true,
    emailReports: true,
    referralProgram: true,
  },
  vip: {
    maxObjects: Infinity,
    voiceInput: true,
    photoReceipt: true,
    financialAnalysis: true,
    exportExcelPdf: true,
    emailReports: true,
    referralProgram: true,
  },
  expired: {
    maxObjects: 0,
    voiceInput: false,
    photoReceipt: false,
    financialAnalysis: false,
    exportExcelPdf: false,
    emailReports: false,
    referralProgram: false,
  },
  'read-only': {
    maxObjects: 0,
    voiceInput: false,
    photoReceipt: false,
    financialAnalysis: true, // Только просмотр
    exportExcelPdf: false,
    emailReports: false,
    referralProgram: false,
  },
};

export function getSubscriptionLimits(tier: SubscriptionTier): SubscriptionLimits {
  return SUBSCRIPTION_LIMITS[tier];
}
```

---

## Примеры кода

### Создание Checkout Session (покупка аккаунта)

**Файл:** `frontend/app/api/stripe/checkout/route.ts`

```typescript
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const { userId, userEmail, locale } = await request.json();

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: userEmail,
    line_items: [
      {
        price: process.env.STRIPE_ACCOUNT_PRICE_ID,
        quantity: 1,
      },
    ],
    metadata: {
      user_id: userId,
      type: 'account_purchase',
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/payment-success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/pricing`,
  });

  return NextResponse.json({ url: session.url });
}
```

### Создание Subscription Checkout

**Файл:** `frontend/app/api/stripe/subscription-checkout/route.ts`

```typescript
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_IDS = {
  basic: process.env.STRIPE_BASIC_PRICE_ID!,
  standard: process.env.STRIPE_STANDARD_PRICE_ID!,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID!,
};

export async function POST(request: Request) {
  const { userId, userEmail, plan, locale } = await request.json();

  // Найти или создать Stripe Customer
  let customer = await findOrCreateCustomer(userEmail, userId);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer: customer.id,
    line_items: [
      {
        price: PRICE_IDS[plan as keyof typeof PRICE_IDS],
        quantity: 1,
      },
    ],
    metadata: {
      user_id: userId,
      plan: plan,
    },
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/subscription/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/subscription`,
  });

  return NextResponse.json({ url: session.url });
}

async function findOrCreateCustomer(email: string, userId: string) {
  // Проверить существующего customer
  const customers = await stripe.customers.list({ email });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  // Создать нового
  return await stripe.customers.create({
    email,
    metadata: { user_id: userId },
  });
}
```

### Использование в компоненте

```typescript
"use client";

import { useAuth } from "@/lib/auth-context";
import { getUserTier, canUseFeature, canCreateObject } from "@/lib/subscription";

export default function ObjectsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [objects, setObjects] = useState([]);

  useEffect(() => {
    // Загрузить профиль из Supabase
    loadProfile();
  }, []);

  const tier = getUserTier(profile);

  // Проверка возможности создания объекта
  const canCreate = canCreateObject(tier, objects.length);

  // Проверка доступа к голосовому вводу
  const hasVoiceInput = canUseFeature(tier, 'voiceInput');

  return (
    <div>
      <h1>Мои объекты ({objects.length})</h1>

      {canCreate ? (
        <button onClick={handleCreateObject}>
          + Добавить объект
        </button>
      ) : (
        <div className="warning">
          Достигнут лимит объектов ({getSubscriptionLimits(tier).maxObjects}).
          <a href="/subscription">Улучшить план</a>
        </div>
      )}

      {hasVoiceInput && (
        <button onClick={handleVoiceInput}>
          🎤 Голосовой ввод
        </button>
      )}
    </div>
  );
}
```

### Cron job: Проверка истекающих подписок

**Файл:** `frontend/app/api/cron/check-expiring-subscriptions/route.ts`

```typescript
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const now = new Date();

  // Подписки истекающие через 24 часа
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const { data: expiringProfiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('subscription_status', 'active')
    .lte('subscription_expires_at', in24Hours.toISOString())
    .gt('subscription_expires_at', now.toISOString())
    .is('expiring_email_sent', null);

  for (const profile of expiringProfiles || []) {
    // Отправить email уведомление
    await sendExpirationWarningEmail(profile);

    // Отметить что email отправлен
    await supabase
      .from('profiles')
      .update({ expiring_email_sent: now.toISOString() })
      .eq('id', profile.id);
  }

  return NextResponse.json({
    processed: expiringProfiles?.length || 0
  });
}
```

---

## База данных (поля подписки)

```sql
-- Поля в таблице profiles
subscription_status VARCHAR(20) DEFAULT 'demo',  -- demo, active, expired, vip, read-only
subscription_plan VARCHAR(20),                   -- basic, standard, premium
subscription_tier VARCHAR(20),                   -- Альтернативное название для plan
subscription_expires_at TIMESTAMPTZ,             -- Дата истечения подписки
account_purchased BOOLEAN DEFAULT FALSE,         -- Куплен ли аккаунт
account_purchased_at TIMESTAMPTZ,                -- Когда куплен
demo_expires_at TIMESTAMPTZ,                     -- Дата истечения DEMO (48 часов)
first_month_free_expires_at TIMESTAMPTZ,         -- Бесплатный месяц после покупки
vip_expires_at TIMESTAMPTZ,                      -- Дата истечения VIP
stripe_customer_id VARCHAR(255),                 -- Stripe Customer ID
stripe_subscription_id VARCHAR(255),             -- Stripe Subscription ID
bonus_months INTEGER DEFAULT 0,                  -- Бонусные месяцы от рефералов
expiring_email_sent TIMESTAMPTZ,                 -- Когда отправлено уведомление
```

---

*Документация создана: 2025-01-25*
