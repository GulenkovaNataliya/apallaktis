# DOMAIN & DEPLOYMENT CHECKLIST

> **Используй после покупки домена и регистрации на Stripe**

---

## 1. ДОМЕН

### После покупки домена:
- [x] Записать название домена: `apallaktis.com`
- [x] Настроить DNS у регистратора:
  ```
  Type    Name    Value
  A       @       76.76.21.21 (Vercel IP)
  CNAME   www     cname.vercel-dns.com
  ```
- [x] Добавить домен в Vercel: Project Settings → Domains
- [ ] Проверить HTTPS (автоматически от Vercel)
- [ ] Настроить редирект www → non-www (или наоборот)

---

## 2. ENVIRONMENT VARIABLES — ПОЛНЫЙ СПИСОК

### Vercel Dashboard → Settings → Environment Variables

| Переменная | Значение | Статус |
|------------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://gnuivvrpdibgwmhbfqxv.supabase.co | [ ] |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... | [ ] |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | pk_test_... или pk_live_... | [ ] |
| `STRIPE_SECRET_KEY` | sk_test_... или sk_live_... | [ ] |
| `STRIPE_WEBHOOK_SECRET` | whsec_... | [ ] |
| `STRIPE_ACCOUNT_PRICE_ID` | price_... | [ ] |
| `STRIPE_PRICE_BASIC_MONTHLY` | price_... | [ ] |
| `STRIPE_PRICE_STANDARD_MONTHLY` | price_... | [ ] |
| `STRIPE_PRICE_PREMIUM_MONTHLY` | price_... | [ ] |
| `NEXT_PUBLIC_APP_URL` | https://apallaktis.com | [x] |
| `RESEND_API_KEY` | re_... | [ ] |
| `CRON_SECRET` | любой секретный ключ | [ ] |
| `ANTHROPIC_API_KEY` | sk-ant-api03-... | [ ] |

### Проверка ключей:
- [ ] Все 13 переменных добавлены в Vercel
- [ ] Выбраны окружения: Production, Preview, Development
- [ ] NEXT_PUBLIC_APP_URL указывает на реальный домен (не localhost)

---

## 3. STRIPE — НАСТРОЙКА

### 3.1 После регистрации на Stripe:

- [ ] Получить API ключи: https://dashboard.stripe.com/apikeys
  - [ ] Publishable key (pk_live_...)
  - [ ] Secret key (sk_live_...)

### 3.2 Создать продукты и цены:

| Продукт | Цена БЕЗ НДС (в Stripe) | Клиент платит (με ΦΠΑ) | Price ID |
|---------|------------------------|------------------------|----------|
| Account Activation | 50€ (разово) | 62€ | price_... |
| Basic Monthly | 20€/мес | 24,80€ | price_... |
| Standard Monthly | 40€/мес | 49,60€ | price_... |
| Premium Monthly | 75€/мес | 93,00€ | price_... |

- [ ] Создать продукт "Account Activation" (one-time)
- [ ] Создать продукт "Basic Subscription" (recurring monthly)
- [ ] Создать продукт "Standard Subscription" (recurring monthly)
- [ ] Создать продукт "Premium Subscription" (recurring monthly)
- [ ] Записать все Price ID и добавить в Vercel

### 3.3 Настроить Webhook:

- [ ] Создать webhook: https://dashboard.stripe.com/webhooks
- [ ] Endpoint URL: `https://ВАШ_ДОМЕН/api/stripe/webhook`
- [ ] События для подписки:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
- [ ] Скопировать Webhook Secret (whsec_...) и добавить в Vercel

### 3.4 Branding:

- [ ] Dashboard → Settings → Branding
- [ ] Загрузить логотип
- [ ] Указать Business URL: https://ВАШ_ДОМЕН

---

## 4. SUPABASE — НАСТРОЙКА

### 4.1 URL Configuration:
- [ ] Dashboard → Authentication → URL Configuration
- [ ] Site URL: `https://ВАШ_ДОМЕН`
- [ ] Redirect URLs добавить:
  - `https://ВАШ_ДОМЕН/**`
  - `https://www.ВАШ_ДОМЕН/**`

### 4.2 Email Templates:
- [ ] Dashboard → Authentication → Email Templates
- [ ] Заменить `localhost:3000` на `https://ВАШ_ДОМЕН` в:
  - [ ] Confirm signup
  - [ ] Reset password
  - [ ] Magic link
  - [ ] Change email

### 4.3 CORS:
- [ ] Dashboard → Settings → API
- [ ] Проверить/добавить домен в CORS origins

---

## 5. RESEND (EMAIL) — ПРОВЕРКА

- [ ] Домен верифицирован в Resend: https://resend.com/domains
- [ ] DNS записи добавлены (SPF, DKIM, DMARC)
- [ ] Тестовое письмо отправляется успешно

---

## 6. VERCEL — ДЕПЛОЙ

### После добавления всех переменных:
- [ ] Нажать "Redeploy" на последнем деплое
- [ ] Дождаться успешного билда (зелёная галочка)
- [ ] Проверить домен в браузере

---

## 7. PWA — MANIFEST

### Файл: `frontend/public/manifest.json`
- [x] Обновить `start_url`: `https://apallaktis.com`
- [x] Обновить `scope`: `https://apallaktis.com/`
- [x] Обновить `id`: `https://apallaktis.com/`

---

## 8. SEO — META TAGS

### Файл: `frontend/app/layout.tsx`
- [x] Обновить `metadataBase`: `new URL('https://apallaktis.com')`
- [x] Проверить og:url, og:image

### Файл: `frontend/public/robots.txt`
- [x] Обновить Sitemap URL: `https://apallaktis.com/sitemap.xml`

---

## 9. LEGAL PAGES

- [ ] Terms of Service — проверить URL сайта
- [ ] Privacy Policy — проверить URL сайта
- [ ] Контактные данные актуальны

---

## 10. ФИНАЛЬНЫЙ ЧЕКЛИСТ

### Перед запуском:
- [ ] `npm run build` без ошибок (локально)
- [ ] Vercel деплой успешен (зелёная галочка)
- [ ] Домен открывается в браузере
- [ ] HTTPS работает (замочек в адресной строке)

### Тестирование функционала:
- [ ] Регистрация нового пользователя работает
- [ ] Email подтверждения приходит
- [ ] Вход в систему работает
- [ ] Сброс пароля работает
- [ ] Stripe checkout открывается
- [ ] Webhook от Stripe обрабатывается
- [ ] PWA устанавливается на телефон

### Тестирование на всех языках:
- [ ] Греческий (el)
- [ ] Русский (ru)
- [ ] Украинский (uk)
- [ ] Албанский (sq)
- [ ] Болгарский (bg)
- [ ] Румынский (ro)
- [ ] Английский (en)
- [ ] Арабский (ar) + RTL

### Админ-панель:
- [ ] /admin доступна только админу
- [ ] VIP активация работает
- [ ] Email уведомление VIP отправляется

---

## БЫСТРЫЕ КОМАНДЫ

### Найти все упоминания localhost:
```bash
grep -r "localhost" frontend/
grep -r "127.0.0.1" frontend/
```

### Проверить билд локально:
```bash
cd frontend && npm run build
```

### Проверить переменные в Vercel:
```bash
vercel env ls
```

---

## КОНТАКТЫ ДЛЯ ПОДДЕРЖКИ

- **Vercel**: https://vercel.com/support
- **Stripe**: https://support.stripe.com
- **Supabase**: https://supabase.com/support
- **Resend**: https://resend.com/support

---

**После выполнения всех пунктов — приложение готово к запуску!**
