# 🚀 Apallaktis - n8n Customer Registration System

Автоматизация регистрации клиентов через n8n без backend API.

---

## 📦 Что включено?

- ✅ **n8n workflow** - автоматическая обработка регистраций
- ✅ **PostgreSQL** - хранение данных клиентов
- ✅ **Email notifications** - приветственные письма
- ✅ **Telegram alerts** - уведомления о новых регистрациях
- ✅ **Docker Compose** - запуск одной командой

---

## 🛠️ Установка

### 1. Скопируйте .env файл

```bash
cd n8n
cp .env.example .env
```

Отредактируйте `.env` и укажите свои данные:
- Email SMTP настройки
- Telegram Bot Token (опционально)
- Пароли для БД и n8n

### 2. Запустите Docker Compose

```bash
docker-compose up -d
```

Это запустит:
- **n8n** на http://localhost:5678
- **PostgreSQL** на порту 5432
- **pgAdmin** на http://localhost:5050 (опционально)

### 3. Импортируйте workflow в n8n

1. Откройте http://localhost:5678
2. Войдите (логин/пароль из `.env`)
3. Нажмите **Import from File**
4. Выберите файл `customer-registration-workflow.json`

### 4. Настройте credentials в n8n

#### PostgreSQL:
- Host: `postgres` (если внутри Docker) или `localhost`
- Port: `5432`
- Database: `apallaktis`
- User/Password: из `.env`

#### SMTP (Email):
- Host: ваш SMTP сервер (например, `smtp.gmail.com`)
- Port: `587`
- User/Password: ваши данные
- From Email: `noreply@apallaktis.gr`

#### Telegram (опционально):
1. Создайте бота через @BotFather
2. Получите Bot Token
3. Узнайте ваш Chat ID (можно через @userinfobot)
4. Добавьте в n8n credentials

### 5. Активируйте workflow

1. Откройте workflow в n8n
2. Нажмите **Activate** (переключатель справа сверху)
3. Скопируйте Webhook URL (будет вида: `http://localhost:5678/webhook/register`)

---

## 🔗 Интеграция с Frontend

Обновите `frontend/app/[locale]/register/page.tsx`:

```typescript
// В начале файла добавьте
const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/register';

// В handleSubmit:
const response = await fetch(N8N_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    invoiceType,
    name: formData.name,
    email: formData.email,
    phone: formData.countryCode + formData.phone,
    companyName: formData.companyName,
    afm: formData.afm,
    timestamp: new Date().toISOString()
  })
});
```

Добавьте в `frontend/.env.local`:
```bash
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/register
```

---

## 📊 Как это работает?

```
┌─────────────┐
│  Frontend   │ → POST данные
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ n8n Webhook │ → Получает данные
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Валидация  │ → Проверка AFM, email, телефона
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ PostgreSQL  │ → Сохранение в БД
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐
│  Email   │   │ Telegram │   │ Response │
│  клиенту │   │ уведомл. │   │ в frontend│
└──────────┘   └──────────┘   └──────────┘
```

---

## 🗃️ Структура БД

**Таблица `customers`:**
| Поле | Тип | Описание |
|------|-----|----------|
| id | SERIAL | Primary Key |
| name | VARCHAR(255) | Имя клиента |
| email | VARCHAR(255) | Email (уникальный) |
| phone | VARCHAR(50) | Телефон |
| invoice_type | VARCHAR(20) | 'invoice' или 'receipt' |
| company_name | VARCHAR(255) | Название компании (nullable) |
| afm | VARCHAR(9) | ΑΦΜ (nullable) |
| registered_at | TIMESTAMP | Дата регистрации |
| source | VARCHAR(50) | Источник (default: 'website') |

---

## 🔍 Проверка работы

### 1. Проверьте статус контейнеров:
```bash
docker-compose ps
```

Все должны быть **Up**.

### 2. Проверьте логи n8n:
```bash
docker-compose logs -f n8n
```

### 3. Проверьте БД:
```bash
docker-compose exec postgres psql -U apallaktis_user -d apallaktis -c "SELECT * FROM customers;"
```

### 4. Отправьте тестовую регистрацию:
```bash
curl -X POST http://localhost:5678/webhook/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Тест Тестов",
    "email": "test@example.com",
    "phone": "+306912345678",
    "invoiceType": "receipt"
  }'
```

---

## 🌐 Деплой на продакшн

### Для деплоя на реальный сервер:

1. **Замените localhost на ваш домен** в `.env`:
```bash
WEBHOOK_URL=https://your-domain.com/webhook
FRONTEND_URL=https://your-frontend.com
```

2. **Используйте HTTPS** (настройте nginx + Let's Encrypt):
```nginx
server {
    listen 443 ssl;
    server_name n8n.your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

3. **Обновите CORS** в n8n webhook response nodes:
```javascript
"Access-Control-Allow-Origin": "https://your-frontend.com"
```

---

## 📧 Настройка Email

### Gmail SMTP:
1. Включите 2FA в Google Account
2. Создайте App Password: https://myaccount.google.com/apppasswords
3. Используйте этот пароль в `.env`:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your_app_password
```

### SendGrid:
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
```

---

## 🤖 Настройка Telegram Bot

1. Откройте Telegram и найдите @BotFather
2. Отправьте `/newbot` и следуйте инструкциям
3. Скопируйте Bot Token
4. Узнайте свой Chat ID через @userinfobot
5. Добавьте в `.env`:
```bash
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_CHAT_ID=123456789
```

---

## 🛡️ Безопасность

✅ **Рекомендации:**
- Включите Basic Auth для n8n в продакшне
- Используйте strong passwords
- Настройте firewall (только 443 порт снаружи)
- Регулярно обновляйте Docker images
- Делайте backup PostgreSQL:
```bash
docker-compose exec postgres pg_dump -U apallaktis_user apallaktis > backup.sql
```

---

## 📊 Мониторинг

### View статистики клиентов:
```sql
SELECT * FROM customer_statistics;
```

### Последние 10 регистраций:
```sql
SELECT * FROM customers ORDER BY registered_at DESC LIMIT 10;
```

### Количество по типам:
```sql
SELECT invoice_type, COUNT(*) FROM customers GROUP BY invoice_type;
```

---

## 🐛 Troubleshooting

### n8n не запускается:
```bash
docker-compose logs n8n
```

### PostgreSQL connection failed:
1. Проверьте, что контейнер запущен: `docker-compose ps`
2. Проверьте credentials в n8n
3. Попробуйте подключиться вручную:
```bash
docker-compose exec postgres psql -U apallaktis_user -d apallaktis
```

### Email не отправляется:
1. Проверьте SMTP credentials
2. Проверьте, что порт 587 не заблокирован
3. Для Gmail - используйте App Password

### Webhook не работает:
1. Убедитесь, что workflow активирован
2. Проверьте CORS настройки
3. Проверьте URL в frontend

---

## 📞 Поддержка

Если возникли вопросы:
1. Проверьте логи: `docker-compose logs -f`
2. Проверьте execution logs в n8n UI
3. Убедитесь, что все credentials настроены

---

## 🎉 Готово!

Теперь ваша система регистрации полностью автоматизирована через n8n!

**Next steps:**
- [ ] Настроить email шаблоны
- [ ] Добавить интеграцию с CRM
- [ ] Настроить аналитику регистраций
- [ ] Добавить автоматические follow-up emails
