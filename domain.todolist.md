# DOMAIN TODOLIST — После покупки домена

> **Временный файл** — удалить после выполнения всех задач

## Предположим домен: `apallaktis.gr` (заменить на реальный)

---

## 1. ENVIRONMENT VARIABLES

### Frontend (.env.local / .env.production)
```env
NEXT_PUBLIC_APP_URL=https://apallaktis.gr
NEXT_PUBLIC_API_URL=https://apallaktis.gr/api
```

### Файлы для изменения:
- [ ] `frontend/.env.local`
- [ ] `frontend/.env.production`
- [ ] Vercel Environment Variables (если деплой на Vercel)

---

## 2. SUPABASE

### Dashboard → Authentication → URL Configuration
- [ ] Site URL: `https://apallaktis.gr`
- [ ] Redirect URLs добавить:
  - `https://apallaktis.gr/**`
  - `https://www.apallaktis.gr/**`

### Dashboard → Settings → API
- [ ] Проверить CORS origins

---

## 3. EMAIL TEMPLATES (Supabase)

### Dashboard → Authentication → Email Templates
Заменить `localhost:3000` на `apallaktis.gr` в:
- [ ] Confirm signup
- [ ] Reset password
- [ ] Magic link
- [ ] Change email

---

## 4. PWA MANIFEST

### Файл: `frontend/public/manifest.json`
```json
{
  "start_url": "https://apallaktis.gr",
  "scope": "https://apallaktis.gr/",
  "id": "https://apallaktis.gr/"
}
```

---

## 5. SEO & META

### Файл: `frontend/app/layout.tsx` или `metadata.ts`
```ts
export const metadata = {
  metadataBase: new URL('https://apallaktis.gr'),
  // ...
}
```

### Open Graph
- [ ] og:url
- [ ] og:image (абсолютный URL)

---

## 6. ROBOTS.TXT

### Файл: `frontend/public/robots.txt`
```txt
User-agent: *
Allow: /

Sitemap: https://apallaktis.gr/sitemap.xml
```

---

## 7. SITEMAP

### Создать или обновить: `frontend/app/sitemap.ts`
```ts
export default function sitemap() {
  return [
    { url: 'https://apallaktis.gr', lastModified: new Date() },
    { url: 'https://apallaktis.gr/el', lastModified: new Date() },
    // ... все языки
  ]
}
```

---

## 8. HOSTING / DEPLOYMENT

### Vercel (если используется)
- [ ] Добавить домен в Project Settings → Domains
- [ ] Настроить DNS (A record или CNAME)
- [ ] Включить HTTPS (автоматически)
- [ ] Настроить www → non-www редирект (или наоборот)

### DNS Records (у регистратора)
```
Type    Name    Value
A       @       76.76.21.21 (Vercel IP)
CNAME   www     cname.vercel-dns.com
```

---

## 9. N8N WEBHOOKS (если используются)

### Обновить URL в workflows:
- [ ] Registration webhook
- [ ] Login webhook
- [ ] Payment webhooks

---

## 10. STRIPE (если используется)

### Dashboard → Developers → Webhooks
- [ ] Обновить endpoint URL: `https://apallaktis.gr/api/webhooks/stripe`

### Dashboard → Settings → Branding
- [ ] Обновить Business URL

---

## 11. LEGAL PAGES

### Проверить ссылки в:
- [ ] Terms of Service — контактные данные, URL сайта
- [ ] Privacy Policy — контактные данные, URL сайта

---

## 12. FINAL CHECKLIST

После всех изменений:
- [ ] `npm run build` без ошибок
- [ ] Проверить все страницы на production
- [ ] Проверить email templates (отправить тестовое письмо)
- [ ] Проверить OAuth редиректы
- [ ] Проверить PWA установку
- [ ] Google Search Console — добавить домен
- [ ] Google Analytics — обновить домен (если есть)

---

## БЫСТРЫЙ ПОИСК ПО ПРОЕКТУ

Найти все упоминания localhost:
```bash
grep -r "localhost" frontend/
grep -r "127.0.0.1" frontend/
```

---

**После выполнения всех задач — удалить этот файл.**
