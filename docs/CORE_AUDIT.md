# АУДИТ ПРОЕКТА APALLAKTIS ДЛЯ ПРОЕКТИРОВАНИЯ CORE

**Дата:** 2026-02-11

---

## 1. СТРУКТУРА ПРОЕКТА

```
apallaktis/
├── frontend/                    # Next.js приложение
│   ├── app/
│   │   ├── [locale]/           # 8 языков (el, en, ru, uk, sq, bg, ro, ar)
│   │   │   ├── dashboard/      # Личный кабинет
│   │   │   ├── objects/        # Объекты
│   │   │   ├── analysis/       # Финансовый анализ
│   │   │   ├── subscription/   # Выбор подписки
│   │   │   └── ...
│   │   ├── api/                # API роуты
│   │   │   ├── stripe/webhook/ # Stripe обработка
│   │   │   ├── cron/           # Cron задачи
│   │   │   ├── team/           # Команды
│   │   │   ├── referral/       # Рефералка
│   │   │   └── email/          # Email API
│   │   └── admin/              # Админ-панель
│   ├── lib/                    # Утилиты
│   │   ├── subscription.ts     # Логика подписок (CORE)
│   │   ├── telegram.ts         # Telegram уведомления
│   │   └── supabase/           # Supabase клиенты
│   ├── types/                  # TypeScript типы
│   └── components/             # UI компоненты
├── database/migrations/        # SQL миграции
└── supabase/migrations/        # Supabase миграции
```

---

## 2. SUPABASE ТАБЛИЦЫ И СВЯЗИ

### Основные таблицы

| Таблица | Назначение | Связи |
|---------|------------|-------|
| `profiles` | Профили пользователей | → auth.users (id) |
| `objects` | Проекты/объекты | → auth.users, → teams |
| `object_expenses` | Расходы объектов | → objects |
| `object_payments` | Оплаты объектов | → objects |
| `object_extras` | Дополнительные доходы | → objects |
| `global_expenses` | Общие расходы | → auth.users |
| `expense_categories` | Категории расходов | → auth.users |
| `payment_methods` | Способы оплаты | → auth.users, → teams |
| `teams` | Команды | → auth.users (owner_id) |
| `team_members` | Члены команд | → teams, → auth.users |
| `team_invitations` | Приглашения | → teams |
| `used_emails` | Контроль повторных demo | unique email |
| `admin_actions_log` | Лог админ-действий | → profiles |

### Ключевые поля profiles

```sql
subscription_status: 'demo' | 'active' | 'expired' | 'vip' | 'read-only'
subscription_plan: 'basic' | 'standard' | 'premium' | null
demo_expires_at: timestamptz
subscription_expires_at: timestamptz
vip_expires_at: timestamptz
first_month_free_expires_at: timestamptz
account_purchased: boolean
referral_code: text (unique)
referred_by: text
referrals_count: integer
bonus_months: integer
role: 'user' | 'admin'
```

---

## 3. RLS ПОЛИТИКИ

### Паттерны политик

1. **Owner-based** (user_id = auth.uid()):
   - `expense_categories`, `global_expenses`

2. **Object-через-owner** (object_id IN objects WHERE user_id):
   - `object_expenses`, `object_payments`, `object_extras`

3. **Team-based** (team_id IN teams WHERE owner_id OR user_id):
   - `objects`, `payment_methods`

4. **Admin-only**:
   - `admin_actions_log` - SELECT только для role='admin'

5. **Profiles**:
   - User видит только свой профиль
   - Admin видит всех

### Функции безопасности

```sql
is_admin() → boolean                    -- проверка роли админа
is_team_owner(uuid) → boolean           -- проверка владельца команды
get_user_team_id(uuid) → uuid           -- получить team_id пользователя
get_owned_team_id(uuid) → uuid          -- получить team_id владельца
```

---

## 4. ЛОГИКА ПОДПИСОК (lib/subscription.ts) — CORE

### Тарифы и лимиты

| Tier | Objects | Users | Voice/Photo | Referral | Цена |
|------|---------|-------|-------------|----------|------|
| demo | ∞ | 1 | ✅ | ❌ | Бесплатно (48ч) |
| basic | 10 | 1 | ❌ | ✅ | 24,80€/мес |
| standard | 50 | 2 | ✅ | ✅ | 49,60€/мес |
| premium | ∞ | ∞ | ✅ | ✅ | 93,00€/мес |
| vip | ∞ | ∞ | ✅ | ✅ | Бесплатно |
| expired | 0 | 0 | ❌ | ❌ | - |
| read-only | 0 | 0 | только просмотр | ❌ | - |

### Основные функции

```typescript
getUserTier(profile) → SubscriptionTier
// Определение текущего тарифа по данным профиля

canCreateObject(tier, count) → { allowed, message?, upgradeToTier? }
// Проверка лимита объектов

canUseFeature(tier, feature) → { allowed, message?, upgradeToTier? }
// Проверка доступа к функции

canAddTeamMember(tier, count) → { allowed, message?, upgradeToTier? }
// Проверка лимита команды
```

### Приоритет определения тарифа

1. VIP (vip_expires_at не истёк или null)
2. Active subscription (subscription_status='active' + plan)
3. Free month после покупки (first_month_free_expires_at не истёк)
4. Demo (demo_expires_at не истёк)
5. Read-only / Expired

---

## 5. STRIPE WEBHOOK (api/stripe/webhook/route.ts) — CORE

### Обрабатываемые события

| Событие | Действие |
|---------|----------|
| `checkout.session.completed` | Активация подписки, реферальный бонус |
| `customer.subscription.created` | Логирование |
| `customer.subscription.updated` | Обновление статуса |
| `customer.subscription.deleted` | Деактивация |
| `invoice.payment_succeeded` | Продление подписки |
| `invoice.payment_failed` | Уведомление о проблеме |

### Логика checkout.session.completed

```
1. Проверить webhook signature
2. Распарсить metadata (plan, user_id, account_number)
3. Обновить profiles:
   - subscription_status = 'active'
   - subscription_plan = plan
   - subscription_tier = plan
   - subscription_expires_at = +1 месяц
   - account_purchased = true
4. Записать в payments таблицу
5. Обработать реферальный бонус (+1 месяц рефереру)
6. Отправить Telegram уведомление
7. Отправить welcome email
```

---

## 6. GUARDS / MIDDLEWARE

### Middleware (frontend/middleware.ts)

```typescript
// Минимальный - только пропуск публичных роутов
// Нет проверки auth на уровне middleware
export function middleware(request: NextRequest) {
  // Allow public routes
  if (pathname.startsWith("/api/") || pathname.startsWith("/_next/")) {
    return NextResponse.next();
  }
  return NextResponse.next();
}
```

### Защита реализована через

1. **На страницах**: `supabase.auth.getUser()` в Server Components
2. **В API routes**: проверка `getUser()` в начале каждого handler
3. **Admin панель**:
   - Проверка email на клиенте (ADMIN_EMAIL)
   - RPC `is_admin()` для проверки роли в БД
   - sessionStorage флаг `adminLoggedIn`

---

## 7. МОДЕЛЬ КОМАНД (Teams)

### Структура

```
teams (1) ←→ (N) team_members
teams (1) ←→ (N) team_invitations
teams (1) ←→ (N) objects (через team_id)
teams (1) ←→ (N) payment_methods (через team_id)
```

### Лимиты по плану

| План | Пользователей |
|------|---------------|
| Basic | 1 |
| Standard | 2 |
| Premium | ∞ |
| VIP | ∞ |

### Триггеры

```sql
create_team_for_new_user()
-- При регистрации пользователя автоматически создаётся команда

update_team_max_members()
-- При смене плана обновляется max_members команды
```

### API endpoints

- `POST /api/team/invite` - отправить приглашение
- `DELETE /api/team/invite?id=` - отменить приглашение
- `POST /api/team/accept` - принять приглашение
- `GET /api/team` - получить информацию о команде

---

## 8. РЕФЕРАЛЬНАЯ ЛОГИКА

### Поток

```
1. Регистрация с referred_by кодом
2. При оплате аккаунта → POST /api/referral/validate
3. Проверки анти-фрода:
   - Не self-referral
   - Реферер имеет active/vip статус
   - Первая покупка нового пользователя
4. Начисление бонуса рефереру:
   - +1 месяц к subscription_expires_at
   - ИЛИ +1 месяц к vip_expires_at (если VIP с датой)
   - referrals_count++
```

### API endpoints

- `POST /api/referral/validate` - валидация кода
- `POST /api/referral/apply` - применение бонуса

---

## 9. FEATURE FLAGS

**Отсутствуют** - в проекте нет системы feature flags.

Все функции включены/выключены на основе тарифа через `canUseFeature()`.

---

## 10. КОМПОНЕНТЫ ДЛЯ CORE

### Готовы к переиспользованию

| Компонент | Файл | Описание |
|-----------|------|----------|
| Subscription Logic | `lib/subscription.ts` | Тарифы, лимиты, проверки |
| User Types | `types/user.ts` | Типы User, SubscriptionStatus |
| Subscription Types | `types/subscription.ts` | SmartRecommendation, UsageCriteria |
| Stripe Webhook | `api/stripe/webhook/route.ts` | Обработка платежей |
| Teams API | `api/team/*` | Приглашения, управление |
| Referral API | `api/referral/*` | Валидация, применение |
| Cron Job | `api/cron/check-expiring-subscriptions` | Уведомления об истечении |
| Admin Panel | `app/admin/*` | VIP управление, логи |
| Email Notifications | `lib/email/notifications.ts` | Шаблоны email |
| Telegram | `lib/telegram.ts` | Уведомления в Telegram |

### DB Functions (SQL)

```sql
handle_new_user()              -- создание профиля при регистрации
create_team_for_new_user()     -- создание команды
update_team_max_members()      -- синхронизация плана с командой
is_admin()                     -- проверка роли админа
soft_delete_object()           -- мягкое удаление объекта
restore_object()               -- восстановление объекта
soft_delete_item()             -- универсальное мягкое удаление
restore_item()                 -- универсальное восстановление
mark_email_as_purchased()      -- пометить email как купивший
```

### Миграции для CORE

| Файл | Описание |
|------|----------|
| `create_team_tables.sql` | Полная модель команд с RLS |
| `add_registration_verification.sql` | Верификация телефона |
| `create_payments_table.sql` | История платежей |
| `create_admin_actions_log.sql` | Аудит админа |
| `fix_function_search_path.sql` | Безопасность функций |
| `add_free_month_email_tracking.sql` | Трекинг email для free month |

---

## РЕКОМЕНДАЦИИ ДЛЯ CORE

### 1. Вынести в отдельные пакеты

```
@core/subscription    # Логика тарифов, лимиты, проверки
@core/teams          # Модель команд, приглашения
@core/payments       # Stripe интеграция, webhook
@core/auth           # Guards, проверки, middleware
@core/notifications  # Email, Telegram, push
```

### 2. Добавить

- [ ] Feature flags система (LaunchDarkly / собственная)
- [ ] Централизованный middleware для auth
- [ ] Универсальные RLS политики (генератор)
- [ ] Rate limiting для API
- [ ] Audit log для всех действий (не только админа)

### 3. Улучшить

- [ ] Вынести ADMIN_EMAIL в env переменную
- [ ] Добавить multi-admin support через таблицу
- [ ] Добавить webhook retry logic
- [ ] Добавить graceful degradation при ошибках Stripe
- [ ] Унифицировать error responses

### 4. Безопасность

- [x] Webhook signature verification (реализовано)
- [x] RLS на всех таблицах (реализовано)
- [x] search_path = public для всех функций (реализовано)
- [ ] CORS настройка
- [ ] CSP headers
- [ ] Input validation (zod schemas)

---

## СХЕМА ЖИЗНЕННОГО ЦИКЛА ПОЛЬЗОВАТЕЛЯ

```
                    ┌─────────────┐
                    │ Регистрация │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │    DEMO     │ (48 часов)
                    │  Безлимит   │
                    └──────┬──────┘
                           │
            ┌──────────────┼──────────────┐
            │              │              │
            ▼              ▼              ▼
     ┌──────────┐   ┌──────────┐   ┌──────────┐
     │  Покупка │   │  Истекло │   │   VIP    │
     │ аккаунта │   │ READ-ONLY│   │ (админ)  │
     └────┬─────┘   └──────────┘   └──────────┘
          │
   ┌──────▼──────┐
   │ Free Month  │ (30 дней Premium)
   └──────┬──────┘
          │
   ┌──────▼──────┐
   │   Выбор     │
   │   плана     │
   └──────┬──────┘
          │
    ┌─────┼─────┬─────────┐
    ▼     ▼     ▼         ▼
 BASIC STANDARD PREMIUM   │
   │      │       │       │
   └──────┴───────┴───────┘
          │
   ┌──────▼──────┐
   │  Истекло    │
   │  EXPIRED    │
   └──────┬──────┘
          │
   ┌──────▼──────┐
   │  Продление  │
   │  или апгрейд│
   └─────────────┘
```

---

*Документ создан: 2026-02-11*
*Версия: 1.0*
