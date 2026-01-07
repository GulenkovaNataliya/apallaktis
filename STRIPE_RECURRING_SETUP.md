# Настройка recurring подписок в Stripe

## Шаг 1: Открыть Stripe Dashboard

1. Перейди на https://dashboard.stripe.com/
2. Убедись, что находишься в **TEST MODE** (переключатель в правом верхнем углу)
3. В левом меню выбери **Products** (Продукты)

## Шаг 2: Создать продукт Basic

1. Нажми **+ Add product** (Добавить продукт)
2. Заполни поля:
   - **Name** (Название): `APALLAKTIS Basic`
   - **Description** (Описание): `Basic monthly subscription - 10 projects, 1 team member`
   - **Pricing model**: `Standard pricing`
   - **Price**: `20`
   - **Currency**: `EUR` (евро)
   - **Billing period**: `Monthly` (Ежемесячно)
   - **Payment type**: выбери **Recurring** (Повторяющиеся платежи)
3. Нажми **Save product** (Сохранить продукт)
4. **ВАЖНО:** Скопируй **Price ID** - он начинается с `price_...`
   - Найди его в разделе **Pricing** под ценой
   - Он будет выглядеть как `price_1AbCdEfGhIjKlMnO`
5. Вставь этот Price ID в `.env.local`:
   ```
   STRIPE_PRICE_BASIC_MONTHLY=price_YOUR_COPIED_ID_HERE
   ```

## Шаг 3: Создать продукт Standard

1. Нажми **+ Add product** снова
2. Заполни поля:
   - **Name**: `APALLAKTIS Standard`
   - **Description**: `Standard monthly subscription - 50 projects, 1 team member`
   - **Pricing model**: `Standard pricing`
   - **Price**: `45`
   - **Currency**: `EUR`
   - **Billing period**: `Monthly`
   - **Payment type**: **Recurring**
3. Нажми **Save product**
4. Скопируй **Price ID** (начинается с `price_...`)
5. Вставь в `.env.local`:
   ```
   STRIPE_PRICE_STANDARD_MONTHLY=price_YOUR_COPIED_ID_HERE
   ```

## Шаг 4: Создать продукт Premium

1. Нажми **+ Add product** снова
2. Заполни поля:
   - **Name**: `APALLAKTIS Premium`
   - **Description**: `Premium monthly subscription - unlimited projects, 3 team members`
   - **Pricing model**: `Standard pricing`
   - **Price**: `90`
   - **Currency**: `EUR`
   - **Billing period**: `Monthly`
   - **Payment type**: **Recurring**
3. Нажми **Save product**
4. Скопируй **Price ID** (начинается с `price_...`)
5. Вставь в `.env.local`:
   ```
   STRIPE_PRICE_PREMIUM_MONTHLY=price_YOUR_COPIED_ID_HERE
   ```

## Шаг 5: Проверить .env.local

После создания всех 3 продуктов твой файл `.env.local` должен выглядеть так:

```env
# Monthly Recurring Subscriptions
# Basic: €20/month - 10 projects, 1 team member
STRIPE_PRICE_BASIC_MONTHLY=price_1AbCdEfGhIjKlMnO

# Standard: €45/month - 50 projects, 1 team member
STRIPE_PRICE_STANDARD_MONTHLY=price_2XyZaBcDeFgHiJkL

# Premium: €90/month - unlimited projects, 3 team members
STRIPE_PRICE_PREMIUM_MONTHLY=price_3QrStUvWxYzAbCdE
```

## Шаг 6: Перезапустить сервер разработки

После добавления всех Price IDs перезапусти Next.js сервер:

```bash
# Останови сервер (Ctrl+C)
# Запусти снова
npm run dev
```

## Готово!

Теперь подписки настроены и готовы к тестированию. Для тестовых платежей используй:
- **Test card**: `4242 4242 4242 4242`
- **Expiry**: любая будущая дата (например, 12/25)
- **CVC**: любые 3 цифры (например, 123)
- **ZIP**: любой (например, 12345)

---

## VIP тариф

VIP тариф **НЕ** создаётся в Stripe, так как он активируется только админом вручную.
Цена VIP не фиксирована - пользователь связывается через Viber/WhatsApp для обсуждения условий.
