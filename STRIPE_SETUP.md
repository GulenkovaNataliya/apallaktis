# Настройка Stripe для APALLAKTIS

## 1. Установка пакетов

```bash
cd frontend
npm install stripe @stripe/stripe-js
```

## 2. Получение API ключей

### Регистрация в Stripe
1. Зайди на https://stripe.com
2. Создай аккаунт (бесплатно)
3. Перейди в Dashboard → Developers → API keys

### Тестовые ключи (для разработки)
- **Publishable key**: начинается с `pk_test_...`
- **Secret key**: начинается с `sk_test_...`

### Продакшн ключи (после 7.1.2026)
- **Publishable key**: начинается с `pk_live_...`
- **Secret key**: начинается с `sk_live_...`

## 3. Настройка переменных окружения

Создай файл `frontend/.env.local`:

```env
# Stripe Test Keys (для разработки)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE

# Stripe Live Keys (после 7.1.2026 - раскомментируй)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
# STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE

# Webhook Secret (получишь после настройки webhook)
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# URL приложения
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. Настройка Webhook (важно!)

### Для разработки (локально):
1. Установи Stripe CLI: https://stripe.com/docs/stripe-cli
2. Запусти: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Скопируй webhook secret (начинается с `whsec_...`)

### Для продакшн (после деплоя):
1. В Stripe Dashboard → Developers → Webhooks
2. Добавь endpoint: `https://ваш-домен.com/api/stripe/webhook`
3. Выбери события:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Скопируй webhook secret

## 5. Цены в Stripe

Создай продукт в Stripe Dashboard:
1. Products → Add product
2. Название: "Apallaktis Account Purchase"
3. Цена: 97€ (+ ΦΠΑ)
4. Скопируй **Price ID** (начинается с `price_...`)
5. Добавь в `.env.local`:

```env
STRIPE_ACCOUNT_PRICE_ID=price_YOUR_PRICE_ID_HERE
```

## 6. Проверка

После настройки:
- ✅ Установлены пакеты
- ✅ API ключи в `.env.local`
- ✅ Webhook настроен
- ✅ Price ID создан

Теперь страница покупки будет работать!

## Тестовые карты

Для тестирования используй карты Stripe:
- **Успешная оплата**: `4242 4242 4242 4242`
- **Требует 3D Secure**: `4000 0025 0000 3155`
- **Отклонена**: `4000 0000 0000 0002`

Срок: любой будущий (напр. 12/34)
CVC: любой 3-значный (напр. 123)
ZIP: любой (напр. 12345)

---

**Примечание**: Все тестовые платежи бесплатны. Комиссия Stripe взимается только с реальных платежей в live mode.
