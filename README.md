# ΑΠΑΛΛΑΚΤΗΣ
**Τέλος στη ρουτίνα!** — Мобильное приложение личного финансового контроля для проектных работ.


---

## О проекте

**ΑΠΑΛΛΑΚΤΗΣ** (Apallaktis) — мобильное PWA-приложение для подрядчиков, фрилансеров и мастеров в Греции. Позволяет вести учёт проектов (Έργα), клиентов, контрактов, платежей и расходов.

**Это НЕ бухгалтерская программа** — это персональный инструмент финансового контроля.

**Домен:** [apallaktis.com](https://apallaktis.com)

---

## Для кого

- Подрядчики и строители
- Электрики, сантехники, мастера
- Фрилансеры и самозанятые
- Все, кто работает по проектам (Έργα) в Греции

---

## Основные функции

### Έργα (Проекты)
- Создание проектов с клиентами
- Цена контракта, дополнительные работы
- Статусы: открытый / закрытый
- Финансовый анализ по каждому проекту

### Финансы
- **Доходы:** платежи от клиентов
- **Расходы:** материалы, инструменты, транспорт
- Баланс по проекту (сколько должны / сколько заплатили)
- Общие расходы (не привязанные к проекту)

### Ввод данных
- Ручной ввод
- **Голосовой ввод** (AI распознавание на греческом)
- **Фото чеков** (AI извлечение суммы и описания)

### Документы
- **ΑΠΟΔΕΙΞΗ** — для физических лиц
- **ΤΙΜΟΛΟΓΙΟ** — для юридических лиц (ΑΦΜ, ΔΟΥ)

### Отчёты
- Финансовый анализ по проектам
- Экспорт в Excel / PDF
- Email отчёты

---

## Технологии

| Категория | Технология |
|-----------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **База данных** | Supabase (PostgreSQL) |
| **Аутентификация** | Supabase Auth |
| **Платежи** | Stripe |
| **Email** | Resend |
| **Деплой** | Vercel |
| **PWA** | Service Worker, Web App Manifest |

---

## Языки (8)

| Код | Язык |
|-----|------|
| `el` | Ελληνικά (по умолчанию) |
| `ru` | Русский |
| `en` | English |
| `uk` | Українська |
| `sq` | Shqip |
| `bg` | Български |
| `ro` | Română |
| `ar` | العربية (RTL) |

---

## Тарифы

| План | Цена | Проекты |
|------|------|---------|
| **DEMO** | Бесплатно (48ч) | ∞ |
| **Basic** | €24,80/мес | 10 |
| **Standard** | €49,60/мес | 50 |
| **Premium** | €93/мес | ∞ |
| **VIP** | Бесплатно | ∞ |

---

## Быстрый старт

```bash
cd frontend
npm install
npm run dev
```

### Переменные окружения (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
```

---

## Структура

```
apallaktis/
├── frontend/           # Next.js приложение
│   ├── app/[locale]/   # Страницы с i18n
│   ├── components/     # React компоненты
│   ├── lib/            # Утилиты, переводы
│   └── public/         # Статика, PWA
├── docs/               # Документация
└── *.md                # Документация систем
```

---

## Документация

| Файл | Описание |
|------|----------|
| [AUTH_SYSTEM.md](./AUTH_SYSTEM.md) | Аутентификация |
| [SUBSCRIPTION_SYSTEM.md](./SUBSCRIPTION_SYSTEM.md) | Подписки Stripe |
| [REFERRAL_SYSTEM.md](./REFERRAL_SYSTEM.md) | Реферальная программа |
| [PWA_SETUP.md](./PWA_SETUP.md) | PWA настройка |
| [I18N_SETUP.md](./I18N_SETUP.md) | Мультиязычность |
| [docs/admin.md](./docs/admin.md) | Админ-панель |
| [design.md](./design.md) | Дизайн-система |

---

## Архитектурное обновление (Team-Based SaaS модель)

В проекте реализована фундаментальная модернизация архитектуры — переход от user-based к team-based модели владения данными.

### Причины перехода

| Проблема user-based | Решение team-based |
|---------------------|---------------------|
| Один пользователь = одна учётная запись | Команда может включать несколько участников |
| Нет разделения ролей | Роли: `owner`, `admin`, `member` |
| Сложности при передаче данных | Данные принадлежат команде, не пользователю |
| Нет возможности совместной работы | Участники команды видят общие данные |

### Изменения в базе данных

#### Новые таблицы

```sql
-- Команды
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Участники команд
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Защита от повторного Demo
CREATE TABLE public.used_emails (
  email TEXT PRIMARY KEY,
  used_at TIMESTAMPTZ DEFAULT now()
);
```

#### Модификация бизнес-таблиц

Все бизнес-таблицы теперь содержат обязательный `team_id`:

```sql
ALTER TABLE public.objects ADD COLUMN team_id UUID REFERENCES public.teams(id);
ALTER TABLE public.projects ADD COLUMN team_id UUID REFERENCES public.teams(id);
ALTER TABLE public.payments ADD COLUMN team_id UUID REFERENCES public.teams(id);
ALTER TABLE public.expenses ADD COLUMN team_id UUID REFERENCES public.teams(id);
-- и т.д.
```

### Row Level Security (RLS)

#### Принцип работы

Все бизнес-таблицы защищены RLS-политиками, которые проверяют принадлежность к команде:

```sql
CREATE POLICY "team_access" ON public.projects
FOR ALL USING (
  team_id IN (
    SELECT team_id FROM public.team_members
    WHERE user_id = auth.uid()
  )
);
```

Важно: Frontend больше не фильтрует данные по `user_id`. Авторизация полностью делегирована RLS на уровне базы данных.

### Авторизация администратора (RPC is_admin)

#### Проблема рекурсивной RLS

При проверке `role = 'admin'` в таблице `team_members` возникает рекурсивная проверка RLS, что вызывает ошибку.

#### Решение: SECURITY DEFINER функция

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
$$;
```

`SECURITY DEFINER` выполняет функцию от имени владельца (postgres), обходя RLS.

#### Использование в RPC

```sql
-- Пример: RPC для админ-панели
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS SETOF public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  RETURN QUERY SELECT * FROM public.profiles;
END;
$$;
```

### Логика защиты Demo

Demo-период выдаётся только один раз на email:

```sql
-- Триггер handle_new_user()
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_team_id UUID;
  email_used BOOLEAN;
BEGIN
  -- Проверка: использовался ли email для Demo
  SELECT EXISTS (
    SELECT 1 FROM public.used_emails WHERE email = NEW.email
  ) INTO email_used;

  -- Создание команды
  INSERT INTO public.teams (name) VALUES (NEW.email)
  RETURNING id INTO new_team_id;

  -- Назначение владельца
  INSERT INTO public.team_members (team_id, user_id, role)
  VALUES (new_team_id, NEW.id, 'owner');

  -- Создание профиля с подпиской
  INSERT INTO public.profiles (id, email, team_id, subscription_tier, subscription_expires_at)
  VALUES (
    NEW.id,
    NEW.email,
    new_team_id,
    CASE WHEN email_used THEN 'expired' ELSE 'demo' END,
    CASE WHEN email_used THEN now() ELSE now() + interval '48 hours' END
  );

  -- Отметка email как использованного
  IF NOT email_used THEN
    INSERT INTO public.used_emails (email) VALUES (NEW.email);
  END IF;

  RETURN NEW;
END;
$$;
```

### Stripe Runtime-паттерн

#### Проблема

Инициализация Stripe на уровне модуля вызывает ошибки при сборке (переменные окружения недоступны):

```typescript
// ❌ Плохо: module-scope инициализация
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

#### Решение: Runtime-инициализация

```typescript
// ✅ Хорошо: runtime-инициализация
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');
  return new Stripe(key, { apiVersion: '2024-12-18.acacia' });
}

// Использование
export async function POST(request: Request) {
  const stripe = getStripe();
  // ...
}
```

### Замечания для разработчиков

#### Миграция существующих данных

При добавлении `team_id` к существующим записям:

```sql
-- Назначить team_id из профиля пользователя
UPDATE public.projects p
SET team_id = (SELECT team_id FROM public.profiles WHERE id = p.user_id);
```

#### Создание новых таблиц

Любая новая бизнес-таблица должна:
1. Содержать `team_id UUID REFERENCES public.teams(id)`
2. Иметь RLS-политику с проверкой через `team_members`
3. НЕ фильтроваться по `user_id` во frontend

#### Проверка ролей

```typescript
// Хелпер для проверки роли в команде
const { data } = await supabase
  .from('team_members')
  .select('role')
  .eq('user_id', userId)
  .eq('team_id', teamId)
  .single();

const isOwnerOrAdmin = data?.role === 'owner' || data?.role === 'admin';
```

#### Безопасность SECURITY DEFINER

Все функции с `SECURITY DEFINER` должны:
- Проверять `is_admin()` перед выполнением
- Использовать `SET search_path = public`
- Быть минимально необходимыми по функционалу

---

## Архитектурные изменения и текущая реализация (январь 2026)

> ⚠️ **Важно:** Часть изменений была сделана вручную в Supabase Dashboard и пока не вынесена в миграции репозитория. В будущем необходимо создать SQL-миграции для всех изменений.

### 1. Team-based модель

#### Таблица `public.teams`

```sql
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_plan VARCHAR(20) DEFAULT 'demo',
  max_members INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id)  -- Один пользователь = один владелец команды
);
```

#### Таблица `public.team_members`

```sql
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL DEFAULT 'member',  -- 'owner' или 'member'
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  UNIQUE(team_id, user_id)
);
```

#### Таблица `public.team_invitations`

```sql
CREATE TABLE public.team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  token VARCHAR(64) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending',  -- pending, accepted, expired, cancelled
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);
```

### 2. Триггеры и функции

#### Триггер `handle_new_user()` (на auth.users INSERT)

Создаёт профиль пользователя при регистрации:
- Генерирует account_number
- Генерирует referral_code
- Сохраняет referred_by из метаданных
- Устанавливает subscription_status = 'demo'

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### Триггер `create_team_for_new_user()` (на auth.users INSERT)

Создаёт команду для нового пользователя:
- Создаёт запись в `teams` с owner_id = NEW.id
- Добавляет владельца в `team_members` с role = 'owner'

```sql
CREATE TRIGGER on_auth_user_created_team
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_team_for_new_user();
```

#### Функция `public.is_admin()`

```sql
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;
```

**Использование во frontend:**
```typescript
const { data: isAdmin } = await supabase.rpc("is_admin");
if (isAdmin !== true) {
  router.push("/admin/login");
}
```

### 3. Row Level Security (RLS)

#### Включён RLS для таблиц:
- `public.profiles`
- `public.teams`
- `public.team_members`
- `public.team_invitations`

#### Политики для `teams`

```sql
-- Владелец видит свою команду
CREATE POLICY "Owner can view own team" ON teams
  FOR SELECT USING (owner_id = auth.uid());

-- Члены команды видят команду
CREATE POLICY "Members can view team" ON teams
  FOR SELECT USING (
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );
```

#### Политики для `team_members`

```sql
-- Члены команды видят других членов
CREATE POLICY "Members can view team members" ON team_members
  FOR SELECT USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );
```

#### Админ-доступ через RPC

Для админ-панели используется RPC `is_admin()`, чтобы избежать рекурсии RLS при проверке роли администратора.

### 4. Логика Demo (один раз на email)

#### Таблица `public.used_emails`

```sql
CREATE TABLE public.used_emails (
  email TEXT PRIMARY KEY,
  used_at TIMESTAMPTZ DEFAULT now()
);
```

#### Логика в `handle_new_user()`

1. Проверяет, есть ли email в `used_emails`
2. Если email НЕ использовался:
   - subscription_status = 'demo'
   - subscription_expires_at = now() + 48 hours
   - Добавляет email в `used_emails`
3. Если email УЖЕ использовался:
   - subscription_status = 'expired'
   - subscription_expires_at = now()
   - Demo НЕ выдаётся повторно

### 5. Stripe и сборка

#### Переменные окружения

Для сборки и работы Stripe необходимы:
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PRICE_BASIC=price_...
NEXT_PUBLIC_STRIPE_PRICE_STANDARD=price_...
NEXT_PUBLIC_STRIPE_PRICE_PREMIUM=price_...
```

#### Получение переменных из Vercel

```bash
vercel env pull --environment=production
```

#### Инициализация Stripe в API routes

```typescript
// frontend/app/api/stripe/*/route.ts
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});
```

### 6. Хелперы во frontend

#### `getCurrentUserTeamId()`

Файл: `frontend/lib/supabase/getTeamId.ts`

```typescript
export async function getCurrentUserTeamId(supabase: SupabaseClient): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new NoAuthenticatedUserError();

  const { data: membership } = await supabase
    .from('team_members')
    .select('team_id')
    .eq('user_id', user.id)
    .single();

  if (!membership?.team_id) throw new NoTeamMembershipError(user.id);
  return membership.team_id;
}
```

---

### Проверка состояния (для разработчика)

#### Проверить RLS

```sql
-- В Supabase SQL Editor
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- Посмотреть политики
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

#### Проверить триггеры

```sql
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' OR event_object_schema = 'auth';
```

#### Проверить функции

```sql
SELECT routine_name, routine_type, security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION';
```

#### Проверить таблицу used_emails

```sql
SELECT * FROM public.used_emails ORDER BY used_at DESC LIMIT 10;
```

#### Проверить команды пользователя

```sql
SELECT t.*, tm.role, tm.user_id
FROM public.teams t
JOIN public.team_members tm ON t.id = tm.team_id
WHERE tm.user_id = '<user-uuid>';
```

---

*Πάρε τον έλεγχο στα χέρια σου!*
