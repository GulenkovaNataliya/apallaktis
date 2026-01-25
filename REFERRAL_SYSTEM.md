# REFERRAL_SYSTEM.md — Реферальная программа

Документация реферальной системы.

---

## Содержание

1. [Как работает реферальная программа](#как-работает-реферальная-программа)
2. [Генерация реферальной ссылки](#генерация-реферальной-ссылки)
3. [Начисление бонусов](#начисление-бонусов)
4. [Защита от фрода](#защита-от-фрода)
5. [Таблицы в Supabase](#таблицы-в-supabase)
6. [Примеры кода](#примеры-кода)

---

## Как работает реферальная программа

### Общая схема

```
Пользователь A (реферер)
        │
        ├── Имеет реферальный код: NAT1001
        │
        └── Делится ссылкой: https://app.com/el/register?ref=NAT1001
                │
                ▼
Пользователь B переходит по ссылке
        │
        ├── Регистрируется с referred_by = "NAT1001"
        │
        └── Покупает аккаунт (€62)
                │
                ▼
Пользователь A получает +1 бонусный месяц
```

### Условия участия

| Действие | Требование |
|----------|------------|
| **Иметь реферальный код** | Автоматически при регистрации |
| **Использовать реферальную программу** | `account_purchased = true` (платный аккаунт) |
| **Получить бонус** | Приглашённый купил аккаунт |

### Доступность по тарифам

| Тариф | Реферальная программа |
|-------|----------------------|
| DEMO | ❌ Недоступна |
| Basic | ✅ Доступна |
| Standard | ✅ Доступна |
| Premium | ✅ Доступна |
| VIP | ✅ Доступна |

---

## Генерация реферальной ссылки

### Формат реферального кода

```
[3 буквы имени] + [account_number]

Примеры:
- Наталья #1001 → NAT1001
- John #1002 → JOH1002
- Αλέξανδρος #1003 → ΑΛΕ1003
```

### Генерация кода (триггер Supabase)

```sql
-- Функция генерации кода
CREATE OR REPLACE FUNCTION generate_referral_code(user_name TEXT, acc_number INTEGER)
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
BEGIN
  -- Первые 3 буквы имени (uppercase)
  prefix := UPPER(LEFT(COALESCE(user_name, 'USR'), 3));
  RETURN prefix || acc_number::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Триггер при создании пользователя
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, referral_code, referred_by, demo_expires_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    generate_referral_code(
      NEW.raw_user_meta_data->>'name',
      (SELECT COALESCE(MAX(account_number), 1000) + 1 FROM profiles)
    ),
    NEW.raw_user_meta_data->>'referred_by',
    NOW() + INTERVAL '48 hours'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### Формат реферальной ссылки

```
https://apallaktis.com/{locale}/register?ref={referral_code}

Примеры:
https://apallaktis.com/el/register?ref=NAT1001
https://apallaktis.com/ru/register?ref=JOH1002
```

---

## Начисление бонусов

### Когда начисляется бонус

1. Приглашённый пользователь регистрируется с реферальным кодом
2. Приглашённый покупает аккаунт (€62)
3. Webhook `checkout.session.completed` получен
4. Проверки анти-фрода пройдены
5. Рефереру начисляется **+1 месяц**

### Значение бонуса

- **+1 бесплатный месяц** за каждого приглашённого, который купил аккаунт
- Бонусы накапливаются в поле `bonus_months`
- Автоматически используются при следующем платеже

### Процесс начисления

```typescript
async function rewardReferrer(newUserId: string, paymentAmount: number) {
  // 1. Получить данные нового пользователя
  const { data: newUser } = await supabase
    .from('profiles')
    .select('email, referred_by')
    .eq('id', newUserId)
    .single();

  if (!newUser?.referred_by) return;

  // 2. Найти реферера
  const { data: referrer } = await supabase
    .from('profiles')
    .select('*')
    .eq('referral_code', newUser.referred_by)
    .single();

  if (!referrer) return;

  // 3. Анти-фрод проверки
  if (!validateReferral(referrer, newUser, paymentAmount)) {
    console.warn('Referral validation failed');
    return;
  }

  // 4. Начислить бонус
  const newBonusMonths = (referrer.bonus_months || 0) + 1;

  await supabase
    .from('profiles')
    .update({
      bonus_months: newBonusMonths,
      referrals_count: (referrer.referrals_count || 0) + 1,
    })
    .eq('id', referrer.id);

  // 5. Записать в историю
  await supabase
    .from('referral_bonuses')
    .insert({
      user_id: referrer.id,
      referred_user_id: newUserId,
      bonus_months: 1,
      granted_at: new Date().toISOString(),
    });

  // 6. Отправить email рефереру
  await sendReferralBonusEmail(referrer);
}
```

---

## Защита от фрода

### Проверки при валидации реферального кода

**Файл:** `frontend/app/api/referral/validate/route.ts`

```typescript
export async function POST(request: Request) {
  const { code, email } = await request.json();

  // 1. Код существует?
  const { data: referrer } = await supabase
    .from('profiles')
    .select('*')
    .eq('referral_code', code)
    .single();

  if (!referrer) {
    return NextResponse.json({
      valid: false,
      error: 'INVALID_CODE'
    });
  }

  // 2. Самореферал?
  if (referrer.email?.toLowerCase() === email.toLowerCase()) {
    return NextResponse.json({
      valid: false,
      error: 'SELF_REFERRAL'
    });
  }

  // 3. Реферер купил аккаунт?
  if (!referrer.account_purchased) {
    return NextResponse.json({
      valid: false,
      error: 'REFERRER_NOT_ACTIVE'
    });
  }

  return NextResponse.json({
    valid: true,
    referrerName: referrer.name
  });
}
```

### Проверки при начислении бонуса (Webhook)

```typescript
function validateReferral(
  referrer: Profile,
  newUser: Profile,
  paymentAmount: number
): boolean {

  // 1. Реальный платёж (не триал, не $0)
  if (paymentAmount <= 0) {
    console.warn('Zero payment amount');
    return false;
  }

  // 2. Самореферал по email
  if (referrer.email?.toLowerCase() === newUser.email?.toLowerCase()) {
    console.warn('Self-referral detected');
    return false;
  }

  // 3. Реферер имеет платный аккаунт
  if (!referrer.account_purchased) {
    console.warn('Referrer has no paid account');
    return false;
  }

  // 4. Проверка частоты (>5 рефералов за 24 часа = подозрительно)
  const recentReferrals = await countRecentReferrals(referrer.id, 24);
  if (recentReferrals > 5) {
    console.warn('Suspicious referral frequency:', recentReferrals);
    // Логируем, но всё равно начисляем (ручная проверка)
  }

  // 5. Проверка домена email (одинаковый домен = подозрительно)
  const referrerDomain = referrer.email?.split('@')[1];
  const newUserDomain = newUser.email?.split('@')[1];
  if (referrerDomain === newUserDomain) {
    console.warn('Same email domain:', referrerDomain);
    // Логируем, но начисляем (может быть корпоративный)
  }

  return true;
}

async function countRecentReferrals(userId: string, hours: number): Promise<number> {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  const { count } = await supabase
    .from('referral_bonuses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('granted_at', since.toISOString());

  return count || 0;
}
```

### Логирование подозрительной активности

```typescript
async function logSuspiciousReferral(data: {
  referrerId: string;
  newUserId: string;
  reason: string;
}) {
  await supabase
    .from('referral_fraud_logs')
    .insert({
      referrer_id: data.referrerId,
      referred_user_id: data.newUserId,
      reason: data.reason,
      created_at: new Date().toISOString(),
    });
}
```

---

## Таблицы в Supabase

### Таблица `profiles` (реферальные поля)

```sql
-- Реферальные поля в profiles
referral_code VARCHAR(20) UNIQUE,    -- Уникальный код пользователя (NAT1001)
referred_by VARCHAR(20),             -- Код того, кто пригласил
bonus_months INTEGER DEFAULT 0,      -- Накопленные бонусные месяцы
referrals_count INTEGER DEFAULT 0,   -- Количество приглашённых (статистика)
account_purchased BOOLEAN,           -- Куплен ли аккаунт (для валидации)
```

### Таблица `referral_bonuses`

```sql
CREATE TABLE referral_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),         -- Реферер
  referred_user_id UUID NOT NULL REFERENCES profiles(id), -- Приглашённый
  bonus_months INTEGER DEFAULT 1,                         -- Количество месяцев
  granted_at TIMESTAMPTZ DEFAULT NOW(),                   -- Когда начислен

  UNIQUE(user_id, referred_user_id)  -- Один бонус за одного приглашённого
);

-- Индексы
CREATE INDEX idx_referral_bonuses_user ON referral_bonuses(user_id);
CREATE INDEX idx_referral_bonuses_granted ON referral_bonuses(granted_at);
```

### Таблица `referral_fraud_logs` (опционально)

```sql
CREATE TABLE referral_fraud_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id),
  referred_user_id UUID REFERENCES profiles(id),
  reason VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Примеры кода

### Страница реферальной программы

**Файл:** `frontend/app/[locale]/dashboard/referral/page.tsx`

```typescript
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { getUserTier, canUseFeature } from "@/lib/subscription";

export default function ReferralPage() {
  const [profile, setProfile] = useState<any>(null);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Загрузить профиль
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user?.id)
      .single();

    setProfile(profileData);

    // Загрузить приглашённых
    const { data: referralsData } = await supabase
      .from('profiles')
      .select('id, name, email, account_purchased, created_at')
      .eq('referred_by', profileData?.referral_code);

    setReferrals(referralsData || []);
  };

  const tier = getUserTier(profile);
  const hasAccess = canUseFeature(tier, 'referralProgram');

  if (!hasAccess) {
    return (
      <div className="restriction-message">
        <h2>Реферальная программа</h2>
        <p>Доступна только после покупки аккаунта</p>
        <a href="/pricing">Купить аккаунт</a>
      </div>
    );
  }

  const referralLink = `https://apallaktis.com/el/register?ref=${profile?.referral_code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViber = () => {
    window.open(`viber://forward?text=${encodeURIComponent(referralLink)}`);
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(referralLink)}`);
  };

  const shareEmail = () => {
    window.open(`mailto:?subject=APALLAKTIS&body=${encodeURIComponent(referralLink)}`);
  };

  // Статистика
  const totalReferrals = referrals.length;
  const purchasedCount = referrals.filter(r => r.account_purchased).length;
  const totalBonusMonths = profile?.bonus_months || 0;

  return (
    <div className="referral-page">
      <h1>Реферальная программа</h1>

      {/* Реферальная ссылка */}
      <div className="referral-link-box">
        <label>Ваша реферальная ссылка:</label>
        <div className="link-input">
          <input type="text" value={referralLink} readOnly />
          <button onClick={copyLink}>
            {copied ? '✓ Скопировано' : 'Копировать'}
          </button>
        </div>
      </div>

      {/* Кнопки шаринга */}
      <div className="share-buttons">
        <button onClick={shareViber} className="viber">
          Viber
        </button>
        <button onClick={shareWhatsApp} className="whatsapp">
          WhatsApp
        </button>
        <button onClick={shareEmail} className="email">
          Email
        </button>
      </div>

      {/* Статистика */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="value">{totalReferrals}</div>
          <div className="label">Всего приглашено</div>
        </div>
        <div className="stat-card">
          <div className="value">{purchasedCount}</div>
          <div className="label">Купили аккаунт</div>
        </div>
        <div className="stat-card">
          <div className="value">{purchasedCount}</div>
          <div className="label">Всего бонусов</div>
        </div>
        <div className="stat-card highlight">
          <div className="value">{totalBonusMonths}</div>
          <div className="label">Доступно месяцев</div>
        </div>
      </div>

      {/* Список приглашённых */}
      <h2>Приглашённые пользователи</h2>
      <table>
        <thead>
          <tr>
            <th>Имя</th>
            <th>Дата регистрации</th>
            <th>Статус</th>
          </tr>
        </thead>
        <tbody>
          {referrals.map(r => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{new Date(r.created_at).toLocaleDateString()}</td>
              <td>
                {r.account_purchased ? (
                  <span className="badge success">Купил</span>
                ) : (
                  <span className="badge pending">Зарегистрирован</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Валидация кода при регистрации

```typescript
// В register/page.tsx

const [referralCode, setReferralCode] = useState('');
const [referralValid, setReferralValid] = useState<boolean | null>(null);
const [referralError, setReferralError] = useState('');

// Получить код из URL
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref');
  if (ref) {
    setReferralCode(ref);
  }
}, []);

// Валидация при изменении email
useEffect(() => {
  if (referralCode && formData.email) {
    validateReferralCode();
  }
}, [referralCode, formData.email]);

const validateReferralCode = async () => {
  const response = await fetch('/api/referral/validate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: referralCode,
      email: formData.email,
    }),
  });

  const data = await response.json();

  if (data.valid) {
    setReferralValid(true);
    setReferralError('');
  } else {
    setReferralValid(false);
    switch (data.error) {
      case 'INVALID_CODE':
        setReferralError('Реферальный код не найден');
        break;
      case 'SELF_REFERRAL':
        setReferralError('Нельзя использовать свой код');
        break;
      case 'REFERRER_NOT_ACTIVE':
        setReferralError('Реферер не имеет активного аккаунта');
        break;
    }
  }
};
```

### Email уведомления

```typescript
// lib/email/notifications.ts

export async function sendNewReferralEmail(referrer: Profile) {
  await resend.emails.send({
    from: 'APALLAKTIS <noreply@apallaktis.com>',
    to: referrer.email,
    subject: '🎉 Новый реферал!',
    html: `
      <h1>Привет, ${referrer.name}!</h1>
      <p>Кто-то зарегистрировался по вашей реферальной ссылке!</p>
      <p>Когда они купят аккаунт, вы получите +1 бесплатный месяц.</p>
    `,
  });
}

export async function sendReferralBonusEmail(referrer: Profile) {
  await resend.emails.send({
    from: 'APALLAKTIS <noreply@apallaktis.com>',
    to: referrer.email,
    subject: '🎁 Вы получили бонусный месяц!',
    html: `
      <h1>Поздравляем, ${referrer.name}!</h1>
      <p>Ваш приглашённый купил аккаунт!</p>
      <p>Вам начислен <strong>+1 бесплатный месяц</strong>.</p>
      <p>Текущий баланс: <strong>${referrer.bonus_months + 1} месяцев</strong></p>
    `,
  });
}
```

---

## Структура файлов

```
frontend/
├── app/
│   ├── [locale]/
│   │   ├── dashboard/
│   │   │   └── referral/page.tsx    # Страница реферальной программы
│   │   └── register/page.tsx        # Регистрация с реферальным кодом
│   └── api/
│       ├── referral/
│       │   └── validate/route.ts    # Валидация кода
│       └── stripe/
│           └── webhook/route.ts     # Начисление бонусов
├── lib/
│   ├── subscription.ts              # Проверка доступа к программе
│   └── email/
│       └── notifications.ts         # Email уведомления
│
database/
├── schema.sql                       # Таблица referral_bonuses
└── migrations/
    └── ensure_referral_columns.sql  # Реферальные поля в profiles
```

---

*Документация создана: 2025-01-25*
