# TEAM SYSTEM / Система Команд

## Обзор

Система команд позволяет владельцам аккаунтов приглашать других пользователей для совместного доступа к объектам и финансовым данным. Каждый пользователь автоматически становится владельцем своей команды при регистрации.

---

## Ограничения по тарифам

| План | Максимум участников | Описание |
|------|---------------------|----------|
| **DEMO** | 1 | Только владелец |
| **Basic** | 1 | Только владелец |
| **Standard** | 2 | Владелец + 1 участник |
| **Premium** | ∞ | Безлимит |
| **VIP** | ∞ | Безлимит |

---

## База данных

### Таблицы

#### `teams`
Основная таблица команд. Каждый пользователь = одна команда.

```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES auth.users(id),
  subscription_plan VARCHAR(20) DEFAULT 'basic',
  max_members INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(owner_id)
);
```

#### `team_members`
Члены команды. Включает владельца (role='owner') и приглашённых (role='member').

```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  user_id UUID REFERENCES auth.users(id),
  role VARCHAR(20) DEFAULT 'member', -- 'owner' или 'member'
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  invited_by UUID REFERENCES auth.users(id),
  UNIQUE(team_id, user_id)
);
```

#### `team_invitations`
Приглашения в команду. Истекают через 7 дней.

```sql
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY,
  team_id UUID REFERENCES teams(id),
  email VARCHAR(255) NOT NULL,
  invited_by UUID REFERENCES auth.users(id),
  token VARCHAR(64) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending/accepted/expired/cancelled
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ
);
```

### Триггеры

1. **on_auth_user_created_team** - Автоматически создаёт команду для нового пользователя
2. **on_subscription_change** - Обновляет max_members при смене тарифа

---

## API Endpoints

### GET `/api/team`
Получить данные команды текущего пользователя.

**Response:**
```json
{
  "team": {
    "id": "uuid",
    "name": "Team Name",
    "subscription_plan": "standard",
    "max_members": 2,
    "owner_id": "uuid"
  },
  "members": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "role": "owner",
      "name": "John Doe",
      "email": "john@example.com",
      "joined_at": "2025-01-01"
    }
  ],
  "invitations": [...],
  "isOwner": true,
  "currentUserRole": "owner"
}
```

### POST `/api/team/invite`
Отправить приглашение в команду (только для владельца).

**Request:**
```json
{
  "email": "user@example.com",
  "locale": "el"
}
```

**Response:**
```json
{
  "success": true,
  "invitation": {
    "id": "uuid",
    "email": "user@example.com",
    "expires_at": "2025-02-01"
  }
}
```

### DELETE `/api/team/invite?id=xxx`
Отменить приглашение (только для владельца).

### GET `/api/team/accept?token=xxx`
Получить детали приглашения по токену.

### POST `/api/team/accept`
Принять приглашение.

**Request:**
```json
{
  "token": "invitation_token"
}
```

### DELETE `/api/team/members?id=xxx`
Удалить участника (владелец) или покинуть команду (участник).

---

## UI Страницы

### `/dashboard/team`
Страница управления командой:
- Список участников с ролями
- Кнопка приглашения нового участника
- Список ожидающих приглашений
- Возможность удалить участника (для владельца)
- Возможность покинуть команду (для участника)

### `/team-invite?token=xxx`
Страница принятия приглашения:
- Детали приглашения (кто пригласил, название команды)
- Кнопки "Принять" / "Отклонить"
- Если не авторизован — предложение войти/зарегистрироваться

---

## Email Уведомления

### Team Invitation Email
Отправляется при создании приглашения.

**Содержит:**
- Имя приглашающего
- Название команды
- Ссылка для принятия приглашения
- Дата истечения приглашения

**Локализация:** el, ru, en, uk, sq, bg, ro, ar

---

## Frontend Интеграция

### subscription.ts

```typescript
// Проверка лимита участников
export function canAddTeamMember(
  tier: SubscriptionTier,
  currentMemberCount: number
): { allowed: boolean; message?: string; upgradeToTier?: SubscriptionTier }

// Лимиты по тарифам
SUBSCRIPTION_LIMITS[tier].maxUsers // -1 = безлимит
```

### Использование

```typescript
import { canAddTeamMember, SUBSCRIPTION_LIMITS } from '@/lib/subscription';

const tier = getUserTier(profile);
const limits = SUBSCRIPTION_LIMITS[tier];
const canInvite = canAddTeamMember(tier, currentMemberCount);

if (!canInvite.allowed) {
  // Показать сообщение о необходимости апгрейда
  // canInvite.upgradeToTier содержит рекомендуемый тариф
}
```

---

## Поток работы

### Создание команды
1. Пользователь регистрируется
2. Триггер `on_auth_user_created_team` создаёт команду
3. Пользователь добавляется как owner

### Приглашение участника
1. Владелец вводит email на странице `/dashboard/team`
2. Проверка лимита по тарифу
3. Создание записи в `team_invitations` с токеном
4. Отправка email с ссылкой `/{locale}/team-invite?token=xxx`
5. Ссылка действительна 7 дней

### Принятие приглашения
1. Пользователь переходит по ссылке
2. Если не авторизован — логин/регистрация
3. Проверка email (должен совпадать с приглашением)
4. Если участник другой команды — выход из неё
5. Если владелец другой команды — ошибка
6. Добавление в новую команду как member
7. Обновление статуса приглашения на 'accepted'

### Удаление участника
1. Владелец нажимает "Удалить" рядом с участником
2. Подтверждение действия
3. Удаление записи из `team_members`

### Выход из команды
1. Участник нажимает "Покинуть команду"
2. Подтверждение действия
3. Удаление записи из `team_members`
4. Создание новой команды для пользователя

---

## RLS Policies

### teams
- Owner can view/update own team
- Members can view team

### team_members
- Members can view team members
- Owner can add/remove members (except self)
- Member can leave (delete self, except if owner)

### team_invitations
- Owner can view/create/cancel invitations
- Invitee can view own invitation by email

---

## Миграция

Файл: `database/migrations/create_team_tables.sql`

Запуск:
```bash
psql $DATABASE_URL < database/migrations/create_team_tables.sql
```

Или через Supabase Dashboard → SQL Editor.

---

## Связанные файлы

| Файл | Описание |
|------|----------|
| `database/migrations/create_team_tables.sql` | SQL миграция |
| `frontend/lib/subscription.ts` | Лимиты и проверки |
| `frontend/app/api/team/route.ts` | GET team data |
| `frontend/app/api/team/invite/route.ts` | POST/DELETE invitations |
| `frontend/app/api/team/accept/route.ts` | GET/POST accept invitation |
| `frontend/app/api/team/members/route.ts` | DELETE members |
| `frontend/app/[locale]/dashboard/team/page.tsx` | UI управления |
| `frontend/app/[locale]/team-invite/page.tsx` | UI принятия приглашения |
| `frontend/lib/email/notifications.ts` | Email templates |
