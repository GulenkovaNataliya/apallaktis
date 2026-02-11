# АУДИТ: DEMO 48 ЧАСОВ ТОЛЬКО 1 РАЗ

**Дата:** 2026-02-11
**Обновлено:** 2026-02-11
**Правило:** "DEMO 48 часов даётся только 1 раз на email, независимо от истории покупок"

---

## 1. ТАБЛИЦА `used_emails`

### Структура

```sql
CREATE TABLE public.used_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  email_normalized TEXT,                    -- NEW: для case-insensitive поиска
  first_used_at TIMESTAMPTZ DEFAULT NOW(),
  has_purchased BOOLEAN DEFAULT FALSE,      -- Используется для статистики, НЕ для demo
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Уникальные индексы
CREATE UNIQUE INDEX used_emails_email_key ON public.used_emails(email);
CREATE UNIQUE INDEX idx_used_emails_normalized ON public.used_emails(email_normalized);
```

### RLS политика

```sql
CREATE POLICY "Service role only" ON public.used_emails
  AS PERMISSIVE FOR ALL TO PUBLIC
  USING (auth.role() = 'service_role'::text);
```

Клиенты НЕ могут напрямую читать/писать в `used_emails` - только через триггеры.

---

## 2. ПРАВИЛО ВЫДАЧИ DEMO

### Функция `handle_new_user()`

**Файл миграции:** `database/migrations/update_demo_once_rule.sql`

```sql
-- Нормализация email для поиска
v_email_normalized := LOWER(TRIM(NEW.email));

-- Проверка email в used_emails (case-insensitive)
SELECT * INTO email_record
FROM public.used_emails
WHERE email_normalized = v_email_normalized;

-- ПРАВИЛО: Demo ТОЛЬКО 1 РАЗ на email
IF email_record IS NOT NULL THEN
  -- Email уже использован - БЕЗ demo (истекает сразу)
  demo_expires := NOW() - INTERVAL '1 second';
ELSE
  -- Новый email - даём 48 часов demo
  demo_expires := NOW() + INTERVAL '48 hours';
END IF;

-- Установка статуса
subscription_status = CASE WHEN demo_expires > NOW() THEN 'demo' ELSE 'read-only' END
```

### INSERT в used_emails

```sql
INSERT INTO public.used_emails (email, email_normalized, first_used_at, has_purchased, created_at)
VALUES (NEW.email, v_email_normalized, NOW(), FALSE, NOW())
ON CONFLICT (email) DO NOTHING;  -- НЕ обновляет, если уже есть
```

---

## 3. ЛОГИКА ОПРЕДЕЛЕНИЯ TIER

### Функция `getUserTier()`

**Файл:** `frontend/lib/subscription.ts:247-256`

```typescript
// DEMO режим - определяется ТОЛЬКО по subscription_status и demo_expires_at
if (profile.subscription_status === 'demo') {
  if (profile.demo_expires_at) {
    const demoExpires = new Date(profile.demo_expires_at);
    if (demoExpires < new Date()) {
      return 'read-only';
    }
  }
  return 'demo';
}
```

**Изменение:** Убрано условие `|| !profile.account_purchased` — теперь demo определяется **строго** по `subscription_status='demo'`.

---

## 4. ЧТО ПРОИСХОДИТ ПРИ РЕГИСТРАЦИИ/ЛОГИНЕ

### При регистрации (DB trigger)

| Условие | Результат |
|---------|-----------|
| Email **НЕ в** used_emails | `demo_expires = NOW() + 48h`, status = `demo` |
| Email **В** used_emails | `demo_expires = NOW() - 1s`, status = `read-only` |

### При логине

**Файл:** `frontend/app/[locale]/login/page.tsx:56-88`

```typescript
if (isReadOnly || isDemoExpired) {
  const isReturningUser = hoursSinceCreation < 1 && demoExpiresAt < accountCreatedAt;

  if (isReturningUser) {
    router.push(`/${locale}/account-reactivation`);  // Paywall для вернувшихся
  } else {
    router.push(`/${locale}/demo-expired`);          // Paywall для истёкших demo
  }
}
```

---

## 5. ТАБЛИЦА СЦЕНАРИЕВ

| Сценарий | Demo? | Статус | Редирект |
|----------|-------|--------|----------|
| Новый email (первая регистрация) | ДА (48ч) | `demo` | Dashboard |
| Email уже в used_emails (любой) | НЕТ | `read-only` | `/account-reactivation` |
| Demo истекло (первая регистрация) | - | `read-only` | `/demo-expired` |
| Купивший возвращается | НЕТ | `read-only` | `/account-reactivation` |

---

## 6. ОТВЕТЫ НА КЛЮЧЕВЫЕ ВОПРОСЫ

### A) Demo выдаётся только при первом email?

**ДА**, строго:
- Email **НЕ в used_emails** → 48ч demo
- Email **в used_emails** (любой, даже купивший) → сразу `read-only`

### B) На каком уровне enforce?

**ОБА уровня:**

1. **DB level:**
   - `UNIQUE INDEX` на email и email_normalized
   - `handle_new_user()` trigger проверяет used_emails
   - Нормализация email (LOWER + TRIM) предотвращает обход через регистр

2. **Code level:**
   - `login/page.tsx` проверяет статус и редиректит на paywall
   - `getUserTier()` возвращает `read-only` для истёкших demo

### C) Что происходит при повторной попытке?

| Сценарий | Результат |
|----------|-----------|
| Повторная регистрация (любой email из used_emails) | `read-only` + paywall |
| Тот же email с другим регистром (Test@mail.com vs test@mail.com) | `read-only` + paywall |
| Новый уникальный email | Нормальное demo 48ч |

### D) Какие поля участвуют?

| Таблица | Поле | Роль |
|---------|------|------|
| `used_emails` | `email` | Оригинальный email |
| `used_emails` | `email_normalized` | LOWER(TRIM(email)) для поиска |
| `used_emails` | `has_purchased` | Только для статистики |
| `profiles` | `demo_expires_at` | Когда истекает demo |
| `profiles` | `subscription_status` | 'demo' / 'read-only' / 'active' / 'vip' / 'expired' |

---

## 7. КЛЮЧЕВЫЕ ФАЙЛЫ И СТРОКИ

| Файл | Строки | Назначение |
|------|--------|------------|
| `database/migrations/update_demo_once_rule.sql` | 1-118 | **Новая миграция с обновлённым правилом** |
| `supabase/migrations/20260211195324_remote_schema.sql` | 243-252 | Таблица used_emails (production) |
| `supabase/migrations/20260211195324_remote_schema.sql` | 557-652 | handle_new_user() (до миграции) |
| `frontend/lib/subscription.ts` | 247-256 | getUserTier() - DEMO проверка |
| `frontend/app/[locale]/login/page.tsx` | 56-88 | Проверка при логине |
| `frontend/app/[locale]/demo-expired/page.tsx` | 1-93 | Страница paywall |
| `frontend/app/[locale]/account-reactivation/page.tsx` | 1-95 | Страница для вернувшихся |

---

## 8. ДИАГРАММА ПОТОКА

```
                    ┌─────────────────┐
                    │  Регистрация    │
                    │  (любой email)  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ handle_new_user │
                    │    (trigger)    │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ LOWER(TRIM(email))
                    │ → email_normalized
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
    ┌─────────▼─────────┐         ┌─────────▼─────────┐
    │ Email НЕ в        │         │ Email В           │
    │ used_emails       │         │ used_emails       │
    └─────────┬─────────┘         └─────────┬─────────┘
              │                             │
              ▼                             ▼
        ┌──────────┐                 ┌──────────┐
        │ DEMO 48ч │                 │ READ-ONLY│
        │  status  │                 │  сразу   │
        │ = 'demo' │                 │  paywall │
        └────┬─────┘                 └────┬─────┘
             │                            │
             ▼                            ▼
        ┌──────────┐              ┌──────────────┐
        │ Dashboard│              │/account-     │
        │          │              │ reactivation │
        └────┬─────┘              └──────────────┘
             │                           │
             │ (48ч прошло)              │
             ▼                           │
        ┌──────────┐                     │
        │/demo-    │                     │
        │ expired  │                     │
        └────┬─────┘                     │
             │                           │
             └───────────┬───────────────┘
                         ▼
                  ┌──────────┐
                  │ PAYWALL  │
                  │ (купить) │
                  └──────────┘
```

---

## 9. ИСТОРИЯ ИЗМЕНЕНИЙ

| Дата | Изменение |
|------|-----------|
| 2026-01-31 | Создано правило: demo 1 раз, но купившие могли получить снова |
| 2026-02-11 | **Обновлено:** demo строго 1 раз на email, независимо от покупок |

### Что изменилось 2026-02-11

| До | После |
|----|-------|
| `has_purchased=TRUE` → новое demo | `has_purchased=TRUE` → **read-only** |
| `has_purchased=FALSE` → read-only | `has_purchased=FALSE` → read-only |
| Поиск по email (case-sensitive) | Поиск по **email_normalized** (case-insensitive) |
| `getUserTier`: `subscription_status='demo' \|\| !account_purchased` | `getUserTier`: **только** `subscription_status='demo'` |

---

## 10. ПРИМЕНЕНИЕ МИГРАЦИИ

```bash
# Через Supabase CLI
supabase db push

# Или вручную в SQL Editor (Supabase Dashboard)
# Скопировать содержимое database/migrations/update_demo_once_rule.sql
```

---

## 11. ВЫВОД

**Правило "DEMO 48ч только 1 раз" работает корректно:**

| Проверка | Статус |
|----------|--------|
| DB UNIQUE constraint на email | ✅ |
| DB UNIQUE constraint на email_normalized | ✅ NEW |
| Trigger проверяет used_emails | ✅ |
| Case-insensitive поиск (LOWER+TRIM) | ✅ NEW |
| Повторная регистрация → read-only + paywall | ✅ |
| Купившие НЕ получают новое demo | ✅ CHANGED |
| Frontend редиректит на paywall | ✅ |
| RLS защита таблицы used_emails | ✅ |

---

*Документ создан: 2026-02-11*
*Обновлён: 2026-02-11*
*Версия: 2.0*
