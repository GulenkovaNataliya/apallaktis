# AUDIT_LOG SPECIFICATION v1

**Версия:** 1.0
**Дата:** 2026-02-11
**Статус:** APPROVED

---

## 1. ПОЛИТИКА ХРАНЕНИЯ

| Параметр | Значение |
|----------|----------|
| Срок хранения | **24 месяца** |
| Очистка | Cron job `cleanup_old_audit_logs()` |
| Периодичность очистки | Ежемесячно (1-е число) |
| Что удаляется | Записи старше 24 месяцев |

```sql
-- Функция очистки (для pg_cron)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_log
  WHERE created_at < NOW() - INTERVAL '24 months';

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 2. SCOPE: ЧТО ЛОГИРУЕМ

### Решения по аудиту B1–B4

| ID | Категория | Логируем? | Обоснование |
|----|-----------|-----------|-------------|
| **B1** | Soft delete/restore | **ДА** | Поддержка пользователей + аналитика использования корзины |
| **B2** | Limits denied | **ДА** | Понимание конверсии в апгрейд + выявление "горячих" пользователей |
| **B3** | Auth login success/failed | **НЕТ** | Supabase хранит last_sign_in; failed attempts покроет rate limiting |
| **B4** | Rate limit blocked | **ДА** | Мониторинг атак + защита от брутфорса |

---

## 3. СПИСОК СОБЫТИЙ (EVENT KEYS) v1

### A) Billing / Stripe

| Event Key | Описание | Metadata |
|-----------|----------|----------|
| `subscription.activated` | Подписка активирована | `{plan, amount, stripe_subscription_id}` |
| `subscription.renewed` | Подписка продлена | `{plan, amount, period_end}` |
| `subscription.plan_changed` | План изменён | `{old_plan, new_plan}` |
| `subscription.canceled` | Подписка отменена | `{reason?, canceled_at}` |
| `subscription.expired` | Подписка истекла | `{plan, expired_at}` |
| `subscription.payment_failed` | Платёж не прошёл | `{error_code, amount}` |
| `payment.recorded` | Платёж записан в БД | `{amount, stripe_payment_id}` |
| `payment.deduplicated` | Дубликат платежа отклонён | `{stripe_payment_id}` |
| `stripe.webhook_received` | Webhook получен | `{event_type, event_id}` |
| `stripe.processing_error` | Ошибка обработки webhook | `{event_type, error}` |

### B) Demo

| Event Key | Описание | Metadata |
|-----------|----------|----------|
| `demo.granted` | Demo 48ч выдан | `{email, expires_at}` |
| `demo.denied_already_used` | Demo отказан (email уже был) | `{email, first_used_at}` |
| `demo.expired` | Demo истёк | `{email, expired_at}` |

### C) VIP

| Event Key | Описание | Metadata |
|-----------|----------|----------|
| `vip.granted` | VIP активирован | `{granted_by, reason, expires_at}` |
| `vip.revoked` | VIP отозван | `{revoked_by, reason}` |
| `vip.expired` | VIP истёк | `{expired_at}` |

### D) Teams / Referral

| Event Key | Описание | Metadata |
|-----------|----------|----------|
| `team.created` | Команда создана | `{team_id, name}` |
| `team.invite_sent` | Приглашение отправлено | `{team_id, invited_email}` |
| `team.invite_accepted` | Приглашение принято | `{team_id, member_id}` |
| `team.member_removed` | Участник удалён | `{team_id, member_id, removed_by}` |
| `referral.validated` | Реферальный код проверен | `{referral_code, referrer_id}` |
| `referral.bonus_applied` | Бонус начислен | `{referrer_id, bonus_months}` |
| `referral.bonus_denied` | Бонус отклонён | `{reason}` |

### E) Дополнительные события (из аудита B1–B4)

#### E1. Objects (Soft Delete/Restore) — B1

| Event Key | Описание | Metadata |
|-----------|----------|----------|
| `object.soft_deleted` | Объект перемещён в корзину | `{object_id, object_name}` |
| `object.restored` | Объект восстановлен из корзины | `{object_id, object_name}` |
| `object.permanently_deleted` | Объект удалён навсегда | `{object_id, object_name, deleted_by}` |

#### E2. Limits Denied — B2

| Event Key | Описание | Metadata |
|-----------|----------|----------|
| `limits.objects_denied` | Достигнут лимит объектов | `{current_count, limit, tier}` |
| `limits.team_members_denied` | Достигнут лимит участников | `{current_count, limit, tier}` |
| `limits.voice_denied` | Голосовой ввод недоступен | `{tier}` |
| `limits.photo_denied` | Фото чека недоступно | `{tier}` |
| `limits.referral_denied` | Реферальная программа недоступна | `{tier, reason}` |

#### E3. Rate Limit — B4

| Event Key | Описание | Metadata |
|-----------|----------|----------|
| `rate_limit.blocked` | Запрос заблокирован rate limiter | `{endpoint, ip, requests_count}` |

---

## 4. ANTI-SPAM ПРАВИЛО

Для предотвращения переполнения логов повторяющимися событиями:

### Дедупликация (Cooldown)

| Категория событий | Cooldown | Логика |
|-------------------|----------|--------|
| `limits.*` | **10 минут** | Не логировать повторное событие от того же user_id в течение 10 минут |
| `rate_limit.blocked` | **10 минут** | Не логировать повторное событие от того же IP в течение 10 минут |

### Альтернатива: Агрегирование

Вместо дедупликации можно использовать агрегирование:

```sql
-- Вместо множества записей limits.objects_denied
-- создавать одну запись с count
{
  "event": "limits.objects_denied",
  "metadata": {
    "count": 5,
    "period": "2026-02-11T10:00:00Z/2026-02-11T11:00:00Z"
  }
}
```

### Реализация дедупликации

```typescript
// Псевдокод для логирования с cooldown
async function logWithCooldown(
  userId: string,
  event: string,
  metadata: object,
  cooldownMinutes: number = 10
): Promise<boolean> {
  const cacheKey = `audit:${userId}:${event}`;
  const lastLogged = await redis.get(cacheKey);

  if (lastLogged) {
    return false; // Пропускаем, cooldown активен
  }

  await insertAuditLog(userId, event, metadata);
  await redis.setex(cacheKey, cooldownMinutes * 60, Date.now());
  return true;
}
```

---

## 5. РЕКОМЕНДОВАННОЕ МЕСТО ЛОГИРОВАНИЯ

| Категория | Где логировать | Файлы |
|-----------|---------------|-------|
| **B1** Soft delete/restore | SQL функции (предпочтительно) | `soft_delete_object()`, `restore_object()` в Supabase |
| **B2** Limits denied | Server-side guard/API route | `api/team/invite/route.ts`, `objects/page.tsx` → API |
| **B4** Rate limit blocked | Rate limit middleware | `middleware.ts` или edge function |
| **Stripe events** | Webhook handler | `api/stripe/webhook/route.ts` |
| **Demo/VIP** | DB triggers или API | `handle_new_user()`, `api/admin/*` |
| **Teams/Referral** | API routes | `api/team/*`, `api/referral/*` |

### B1: Логирование в SQL функциях

```sql
-- Обновлённая функция soft_delete_object с логированием
CREATE OR REPLACE FUNCTION soft_delete_object(
  p_object_id UUID,
  p_user_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  deleted_count INTEGER;
  v_object_name TEXT;
BEGIN
  -- Получаем имя объекта для лога
  SELECT name INTO v_object_name FROM objects WHERE id = p_object_id;

  -- Soft delete
  UPDATE public.objects
  SET deleted_at = NOW(), updated_at = NOW()
  WHERE id = p_object_id AND user_id = p_user_id AND deleted_at IS NULL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  IF deleted_count > 0 THEN
    -- Cascade soft delete
    UPDATE public.object_expenses SET deleted_at = NOW() WHERE object_id = p_object_id;
    UPDATE public.object_extras SET deleted_at = NOW() WHERE object_id = p_object_id;
    UPDATE public.object_payments SET deleted_at = NOW() WHERE object_id = p_object_id;

    -- LOG EVENT
    INSERT INTO audit_log (user_id, event, metadata)
    VALUES (p_user_id, 'object.soft_deleted', jsonb_build_object(
      'object_id', p_object_id,
      'object_name', v_object_name
    ));

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### B2: Логирование в API (пример)

```typescript
// api/team/invite/route.ts
if (!canAdd.allowed) {
  // LOG: limits.team_members_denied
  await logAuditEvent(user.id, 'limits.team_members_denied', {
    current_count: memberCount,
    limit: limits.maxUsers,
    tier: tier,
  });

  return NextResponse.json({ error: canAdd.message }, { status: 403 });
}
```

### B4: Логирование в middleware

```typescript
// middleware.ts (с @upstash/ratelimit)
if (!success) {
  // LOG: rate_limit.blocked
  await logAuditEvent(null, 'rate_limit.blocked', {
    endpoint: request.nextUrl.pathname,
    ip: request.ip,
    requests_count: limit,
  });

  return new Response('Too Many Requests', { status: 429 });
}
```

---

## 6. СХЕМА ТАБЛИЦЫ audit_log

```sql
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Индексы
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_event ON audit_log(event);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_event_created ON audit_log(event, created_at DESC);

-- RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Только service_role может писать
CREATE POLICY audit_log_insert_policy ON audit_log
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Админы могут читать
CREATE POLICY audit_log_select_policy ON audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Никто не может обновлять/удалять (immutable audit trail)
CREATE POLICY audit_log_update_policy ON audit_log FOR UPDATE USING (false);
CREATE POLICY audit_log_delete_policy ON audit_log FOR DELETE USING (false);
```

---

## 7. ПРИОРИТЕТ РЕАЛИЗАЦИИ

| Приоритет | Категория | Обоснование |
|-----------|-----------|-------------|
| 1 | **B4** Rate limiting + logging | Критично для безопасности |
| 2 | **Stripe events** | Важно для финансового аудита |
| 3 | **B2** Limits denied | Ценно для бизнес-аналитики |
| 4 | **B1** Soft delete/restore | Полезно для поддержки |
| 5 | Demo/VIP/Teams | Полнота картины |

---

## 8. МИГРАЦИЯ НА audit_log

Если сейчас используется `admin_actions_log`, рекомендуется:

1. Создать новую таблицу `audit_log` с расширенной схемой
2. Мигрировать данные из `admin_actions_log` (если нужно)
3. Переключить логирование на `audit_log`
4. Оставить `admin_actions_log` read-only на переходный период

---

## 9. ЧЕКЛИСТ ГОТОВНОСТИ

- [ ] Создана таблица `audit_log`
- [ ] Настроены индексы и RLS
- [ ] Реализован rate limiting (B4)
- [ ] Добавлено логирование в Stripe webhook
- [ ] Добавлено логирование limits denied (B2)
- [ ] Обновлены SQL функции soft_delete/restore (B1)
- [ ] Настроен pg_cron для cleanup
- [ ] Добавлена админ-панель просмотра логов

---

**Status: APPROVED (2026-02-11)**

---

*Документ создан: 2026-02-11*
*Версия: 1.0*
*Автор: System Architect*
