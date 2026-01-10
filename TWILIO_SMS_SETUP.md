# Настройка Twilio для SMS уведомлений

## Шаг 1: Создание аккаунта Twilio

1. Зайдите на https://www.twilio.com/try-twilio
2. Зарегистрируйтесь (бесплатный триальный аккаунт дает $15 кредита)
3. Подтвердите email и номер телефона

## Шаг 2: Получение учетных данных

1. В Twilio Console перейдите в **Account → API keys & tokens**
2. Скопируйте:
   - **Account SID** (например: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
   - **Auth Token** (нажмите "Show" и скопируйте)

## Шаг 3: Покупка номера телефона

1. В Twilio Console перейдите в **Phone Numbers → Buy a number**
2. Выберите страну (например, США - самые дешевые номера ~$1/месяц)
3. Выберите номер с поддержкой **SMS** и **Voice** (опционально)
4. Купите номер
5. Скопируйте купленный номер (формат: `+1234567890`)

**Важно:** Для отправки SMS в Грецию, Россию и другие страны:
- Убедитесь, что выбранный номер поддерживает международные SMS
- Проверьте тарифы на отправку SMS в нужные страны: https://www.twilio.com/pricing/messaging

## Шаг 4: Настройка переменных окружения

Добавьте в файл `.env.local` (frontend):

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
```

**Замените:**
- `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` → ваш Account SID
- `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` → ваш Auth Token
- `+1234567890` → ваш купленный номер

## Шаг 5: Верификация номеров (Trial Mode)

⚠️ **В триальном режиме** Twilio позволяет отправлять SMS только на верифицированные номера!

1. Перейдите в **Phone Numbers → Verified Caller IDs**
2. Нажмите **Add a new number**
3. Введите номер телефона получателя (например, ваш личный номер)
4. Twilio позвонит или отправит SMS с кодом верификации
5. Введите код для верификации

**Для production:** Обновите аккаунт Twilio, чтобы отправлять SMS на любые номера.

## Шаг 6: Выполнить миграцию базы данных

Выполните миграцию для добавления полей верификации телефона:

```sql
-- Файл: database/migrations/add_phone_verification.sql
-- Выполнить в Supabase Dashboard → SQL Editor
```

1. Откройте Supabase Dashboard
2. Перейдите в **SQL Editor**
3. Скопируйте содержимое файла `database/migrations/add_phone_verification.sql`
4. Вставьте и выполните

## Шаг 7: Перезапуск сервера

```bash
cd frontend
npm run dev
```

## Тестирование SMS

### 1. Отправка кода верификации

```bash
curl -X POST http://localhost:3000/api/sms/send-verification \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "userId": "user-uuid-here"
  }'
```

### 2. Проверка кода

```bash
curl -X POST http://localhost:3000/api/sms/verify-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "123456",
    "userId": "user-uuid-here",
    "phone": "+1234567890"
  }'
```

## Использование компонента PhoneVerification

Добавьте компонент на страницу регистрации или профиля:

```tsx
import PhoneVerification from '@/components/PhoneVerification';

<PhoneVerification
  userId={user.id}
  initialPhone={user.phone}
  onVerified={(phone) => {
    console.log('Phone verified:', phone);
    // Обновить UI или перенаправить пользователя
  }}
  locale="el" // или "ru", "en"
/>
```

## SMS уведомления (Cron Job)

Cron job автоматически отправляет SMS уведомления:
- **DEMO истекает** (за 24 часа)
- **DEMO истекло**
- **Подписка истекает** (за 2 дня)
- **Подписка истекла**

SMS отправляются только пользователям с **подтвержденным телефоном** (`phone_verified = true`).

## Стоимость SMS

- **США/Канада:** ~$0.0079 за SMS
- **Греция:** ~$0.064 за SMS
- **Россия:** ~$0.012 за SMS
- **Украина:** ~$0.025 за SMS

Детальные тарифы: https://www.twilio.com/pricing/messaging

## Важные замечания

1. **Trial аккаунт:**
   - $15 бесплатного кредита
   - SMS только на верифицированные номера
   - Все SMS содержат префикс "Sent from your Twilio trial account"

2. **Production аккаунт:**
   - Требуется пополнение баланса (минимум $20)
   - Убирается префикс trial
   - SMS на любые номера

3. **Безопасность:**
   - Никогда не коммитьте `.env.local` в git
   - Храните учетные данные в безопасности
   - Для production используйте переменные окружения Vercel/Netlify

## Troubleshooting

### SMS не отправляются
- Проверьте баланс Twilio
- Убедитесь, что номер верифицирован (trial mode)
- Проверьте формат номера телефона (должен начинаться с `+`)

### Ошибка "Unverified number"
- Верифицируйте номер получателя в Twilio Console
- Или обновите аккаунт до production

### SMS не приходят
- Проверьте Twilio Logs: https://www.twilio.com/console/sms/logs
- Убедитесь, что номер правильного формата
- Проверьте, что страна получателя поддерживается

## Альтернативы Twilio

Если Twilio дорого или не подходит:
- **Vonage (Nexmo)** - похожие тарифы
- **Amazon SNS** - дешевле для больших объемов
- **MessageBird** - популярен в Европе
- **Plivo** - альтернатива с похожим API
