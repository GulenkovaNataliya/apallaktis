# Настройка Stripe Subscriptions (Подписки)

## 1. Создание Products и Prices в Stripe Dashboard

### Шаг 1: Войдите в Stripe Dashboard
- Перейдите на https://dashboard.stripe.com/
- Выберите ваш аккаунт

### Шаг 2: Создайте Products для каждого тарифа

Перейдите в **Products** → **Add Product**

#### Product 1: DEMO (НЕ СОЗДАВАТЬ - бесплатный период)
DEMO не требует Stripe Product, так как это бесплатный 48-часовой период.

#### Product 2: Базовая (Basic)
- **Name**: `Apallaktis Basic`
- **Description**: `До 10 проектов, OCR, голосовой ввод, базовая аналитика`
- **Pricing Model**: Recurring
- **Price**: `20 EUR` (без НДС)
- **Billing Period**: Monthly
- **Tax Behavior**: Exclusive (НДС добавляется сверху)
- После создания скопируйте **Price ID** (начинается с `price_...`)

#### Product 3: Стандартная (Standard)
- **Name**: `ΑΠΑΛΛΑΚΤΗΣ - Стандартная`
- **Description**: `До 50 проектов, приоритетная поддержка, расширенная аналитика`
- **Pricing Model**: Recurring
- **Price**: `45 EUR` (без НДС)
- **Billing Period**: Monthly
- **Tax Behavior**: Exclusive
- После создания скопируйте **Price ID**

#### Product 4: Премиум (Premium)
- **Name**: `ΑΠΑΛΛΑΚΤΗΣ - Премиум`
- **Description**: `Неограниченные проекты, команда до 3 человек, VIP поддержка 24/7`
- **Pricing Model**: Recurring
- **Price**: `90 EUR` (без НДС)
- **Billing Period**: Monthly
- **Tax Behavior**: Exclusive
- После создания скопируйте **Price ID**

#### Product 5: VIP (НЕ СОЗДАВАТЬ - активируется админом)
VIP не требует Stripe Product, так как активируется администратором вручную.

---

## 2. Настройка Tax Rates (НДС 24%)

### Шаг 1: Создайте Tax Rate
Перейдите в **Settings** → **Tax rates** → **Add tax rate**

- **Display name**: `ΦΠΑ 24%`
- **Percentage**: `24.00`
- **Region**: `Greece`
- **Tax type**: `VAT`
- **Inclusive/Exclusive**: `Exclusive` (НДС добавляется сверху)

После создания скопируйте **Tax Rate ID** (начинается с `txr_...`)

---

## 3. Добавьте Price IDs в .env.local

Откройте файл `frontend/.env.local` и добавьте:

```env
# Stripe Subscription Price IDs
NEXT_PUBLIC_STRIPE_PRICE_BASIC=price_XXXXXXXXX
NEXT_PUBLIC_STRIPE_PRICE_STANDARD=price_XXXXXXXXX
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM=price_XXXXXXXXX

# Stripe Tax Rate ID
NEXT_PUBLIC_STRIPE_TAX_RATE_GR=txr_XXXXXXXXX
```

Замените `price_XXXXXXXXX` на реальные Price IDs из Stripe Dashboard.

---

## 4. Настройка Webhook для Subscriptions

### Шаг 1: Добавьте события подписок в webhook
Перейдите в **Developers** → **Webhooks** → выберите ваш webhook

Добавьте следующие события:
- `customer.subscription.created` - создана новая подписка
- `customer.subscription.updated` - подписка обновлена
- `customer.subscription.deleted` - подписка отменена
- `invoice.paid` - счёт оплачен (ежемесячный платёж)
- `invoice.payment_failed` - платёж не прошёл
- `checkout.session.completed` - checkout завершён (уже должен быть)

### Шаг 2: Проверьте webhook secret
Убедитесь, что `STRIPE_WEBHOOK_SECRET` в `.env.local` актуален.

---

## 5. Логика работы подписок

### Этап 1: DEMO период (48 часов)
- Пользователь регистрируется
- Автоматически активируется DEMO на 48 часов
- Максимум 3 проекта
- Полный функционал

### Этап 2: Покупка аккаунта (97€ + ΦΠΑ)
- Единоразовый платёж через `/api/stripe/checkout`
- После оплаты: 30 дней бесплатного использования
- Дата покупки = дата ежемесячной оплаты подписки

### Этап 3: Выбор подписки (за 2 дня до окончания)
- За 2 дня до окончания бесплатного месяца
- Показывается модальное окно с выбором тарифа
- Умная рекомендация на основе активности
- После выбора: оплата через `/api/stripe/subscription-checkout`

### Этап 4: Ежемесячная оплата
- Stripe автоматически списывает деньги каждый месяц
- Webhook получает событие `invoice.paid`
- Продлевается `subscription_expires_at` на +1 месяц
- Email уведомление клиенту

### Этап 5: Режим "только чтение"
- Если подписка не оплачена
- Пользователь может только просматривать данные
- Нельзя редактировать, создавать, экспортировать

---

## 6. Тестирование

### Тестовые карты Stripe:
- **Успешный платёж**: `4242 4242 4242 4242`
- **Отклонён**: `4000 0000 0000 0002`
- **Требует 3D Secure**: `4000 0025 0000 3155`

**CVV**: любые 3 цифры
**Expiry**: любая будущая дата
**ZIP**: любой

### Проверка webhook локально:
```bash
# Установите Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook

# В другом терминале запустите тест
stripe trigger customer.subscription.created
stripe trigger invoice.paid
```

---

## 7. Продакшн

Перед запуском в продакшн:
1. Переключите Stripe ключи с Test на Live (в `.env.local`)
2. Создайте те же Products/Prices в Live mode
3. Обновите Price IDs в `.env.local`
4. Настройте webhook в Live mode
5. Обновите `STRIPE_WEBHOOK_SECRET` на Live webhook secret
6. Включите автоматические Email уведомления в Stripe

---

## Документация
- [Stripe Subscriptions Docs](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Webhook Events](https://stripe.com/docs/api/events/types)
- [Stripe Testing](https://stripe.com/docs/testing)
