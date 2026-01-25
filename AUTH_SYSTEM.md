# AUTH_SYSTEM.md — Система аутентификации

Документация системы аутентификации на базе Supabase Auth.

---

## Содержание

1. [Supabase Auth настройка](#supabase-auth-настройка)
2. [Регистрация](#регистрация)
3. [Login/Logout](#loginlogout)
4. [Сброс пароля](#сброс-пароля)
5. [Email подтверждение](#email-подтверждение)
6. [Защита роутов](#защита-роутов)
7. [Примеры кода](#примеры-кода)

---

## Supabase Auth настройка

### Переменные окружения

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### Клиент для браузера

**Файл:** `frontend/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Клиент для сервера

**Файл:** `frontend/lib/supabase/server.ts`

```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignored for server components
          }
        },
      },
    }
  )
}
```

### Зависимости

```json
{
  "@supabase/ssr": "^0.5.x",
  "@supabase/supabase-js": "^2.x"
}
```

---

## Регистрация

### Страница регистрации

**Файл:** `frontend/app/[locale]/register/page.tsx`

### Поля формы

| Поле | Тип | Обязательное | Валидация |
|------|-----|--------------|-----------|
| `name` | string | Да | Не пустое |
| `email` | string | Да | Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| `phone` | string | Да | 6-15 цифр: `/^\d{6,15}$/` |
| `countryCode` | string | Да | Выбор из списка |
| `password` | string | Да | Минимум 6 символов |
| `confirmPassword` | string | Да | Совпадение с password |

### Дополнительные поля (для ΤΙΜΟΛΟΓΙΟ)

| Поле | Тип | Описание |
|------|-----|----------|
| `afm` | string | ΑΦΜ (9 цифр, проверка через VIES) |
| `companyName` | string | Автозаполнение из VIES |
| `doy` | string | ΔΟΥ (вручную) |
| `activity` | string | Вид деятельности (вручную) |
| `address` | string | Автозаполнение из VIES |

### Коды стран (телефон)

```typescript
const countryCodes = [
  { code: "+30", country: "GR" },   // Греция
  { code: "+7", country: "RU" },    // Россия
  { code: "+380", country: "UA" },  // Украина
  { code: "+355", country: "AL" },  // Албания
  { code: "+359", country: "BG" },  // Болгария
  { code: "+40", country: "RO" },   // Румыния
  { code: "+1", country: "US" },    // США
  { code: "+966", country: "SA" },  // Саудовская Аравия
];
```

### Типы документов

- `receipt` (ΑΠΟΔΕΙΞΗ) — для физических лиц
- `invoice` (ΤΙΜΟΛΟΓΙΟ) — для юридических лиц (требует AFM)

### Процесс регистрации

```typescript
const { data, error } = await supabase.auth.signUp({
  email: formData.email,
  password: formData.password,
  options: {
    emailRedirectTo: `${window.location.origin}/${locale}/email-confirmed`,
    data: {
      name: formData.name,
      phone: `${formData.countryCode}${formData.phone}`,
      invoice_type: invoiceType,
      company_name: invoiceType === 'invoice' ? formData.companyName : null,
      afm: invoiceType === 'invoice' ? formData.afm : null,
      doy: invoiceType === 'invoice' ? afmResult?.doy : null,
      address: invoiceType === 'invoice' ? afmResult?.address : null,
      preferred_language: locale,
      referred_by: validatedReferralCode || null,
    },
  },
});
```

### VIES Lookup (проверка AFM)

**Endpoint:** `POST /api/afm/lookup`

```typescript
// Запрос
{ afm: "123456789" }

// Ответ (успех)
{
  valid: true,
  legalName: "COMPANY NAME",
  address: "STREET 123, ATHENS"
}

// Ответ (ошибка)
{ error: "ΑΦΜ δεν βρέθηκε στο VIES" }
```

---

## Login/Logout

### Login

**Файл:** `frontend/app/[locale]/login/page.tsx`

```typescript
const { data, error: signInError } = await supabase.auth.signInWithPassword({
  email,
  password,
});

// Проверка подтверждения email
if (signInError?.message.includes('Email not confirmed')) {
  setError(t.emailNotConfirmed);
  return;
}

// Бэкап проверка
if (data.user && !data.user.email_confirmed_at) {
  setError(t.emailNotConfirmed);
  return;
}

// Успешный вход
router.push(`/${locale}/page-pay`);
```

### Logout

**Файл:** `frontend/lib/auth-context.tsx`

```typescript
const logout = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();

  localStorage.removeItem('authToken');
  localStorage.removeItem('user');

  setAuthState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  });
};
```

---

## Сброс пароля

### Шаг 1: Запрос сброса

**Файл:** `frontend/app/[locale]/reset-password/page.tsx`

```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/${locale}/update-password`,
});

if (!error) {
  setSuccess(true);
  // Показать сообщение: "Ελέγξτε τα εισερχόμενά σας"
}
```

### Шаг 2: Установка нового пароля

**Файл:** `frontend/app/[locale]/update-password/page.tsx`

```typescript
// Валидация
if (password.length < 6) {
  setError(t.passwordTooShort);
  return;
}

if (password !== confirmPassword) {
  setError(t.passwordsDontMatch);
  return;
}

// Обновление пароля
const { error } = await supabase.auth.updateUser({
  password: password,
});

if (!error) {
  setSuccess(true);
  // Автоматический редирект через 2 секунды
  setTimeout(() => router.push(`/${locale}/login`), 2000);
}
```

---

## Email подтверждение

### Поток подтверждения

```
1. Регистрация
   ↓
2. Supabase отправляет email с magic link
   ↓
3. Пользователь кликает ссылку
   ↓
4. Редирект на /[locale]/email-confirmed
   ↓
5. Показ страницы успеха + кнопка "Войти"
```

### Страница ожидания подтверждения

**Файл:** `frontend/app/[locale]/email-not-confirmed/page.tsx`

```typescript
// Повторная отправка email
const handleResend = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: user.email,
  });

  if (!error) {
    setResendStatus("sent");
  }
};
```

### Страница успешного подтверждения

**Файл:** `frontend/app/[locale]/email-confirmed/page.tsx`

- Зелёная галочка (#25D366)
- Заголовок: "Email Επιβεβαιώθηκε!"
- Кнопка "Είσοδος" → `/[locale]/login`

---

## Защита роутов

### Middleware (текущее состояние)

**Файл:** `frontend/middleware.ts`

```typescript
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Публичные маршруты
  if (pathname === "/" || pathname === "/language-select") {
    return NextResponse.next();
  }

  // API и статика
  if (pathname.startsWith("/api/") ||
      pathname.startsWith("/_next/") ||
      pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif|json|mp4)$/)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}
```

> **ВАЖНО:** Текущий middleware НЕ проверяет аутентификацию. Защита реализована на клиенте.

### Клиентская защита (AuthProvider)

**Файл:** `frontend/lib/auth-context.tsx`

```typescript
// В защищённых компонентах
const { isAuthenticated, isLoading } = useAuth();

if (isLoading) return <LoadingScreen />;
if (!isAuthenticated) {
  router.push(`/${locale}/login`);
  return null;
}
```

### Рекомендуемая серверная защита

```typescript
// middleware.ts (рекомендация)
export async function middleware(request: NextRequest) {
  const supabase = createMiddlewareClient({ req: request });
  const { data: { session } } = await supabase.auth.getSession();

  const protectedPaths = ['/dashboard', '/objects', '/analysis'];
  const isProtected = protectedPaths.some(path =>
    request.nextUrl.pathname.includes(path)
  );

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

---

## Примеры кода

### Auth Context Provider

**Файл:** `frontend/lib/auth-context.tsx`

```typescript
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

interface User {
  id: string;
  email: string;
  name: string;
  subscriptionStatus: 'demo' | 'active' | 'expired' | 'vip' | 'read-only';
  subscriptionPlan?: string;
  referralCode?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const supabase = createClient();

    // Загрузка текущей сессии
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const user = createUserFromSession(session);
        setAuthState({
          user,
          token: session.access_token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    // Слушатель изменений auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const user = createUserFromSession(session);
          setAuthState({
            user,
            token: session.access_token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const updateUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setAuthState(prev => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

function createUserFromSession(session: any): User {
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.user_metadata.name,
    subscriptionStatus: session.user.user_metadata.subscriptionStatus || 'demo',
    subscriptionPlan: session.user.user_metadata.subscriptionPlan,
    referralCode: session.user.user_metadata.referralCode,
  };
}
```

### Использование в компоненте

```typescript
"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";

export default function ProtectedPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  // Защита маршрута
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/${locale}/login`);
    }
  }, [isLoading, isAuthenticated, router, locale]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <h1>Добро пожаловать, {user?.name}!</h1>
      <p>Email: {user?.email}</p>
      <p>Статус: {user?.subscriptionStatus}</p>
      <button onClick={logout}>Выйти</button>
    </div>
  );
}
```

### Проверка роли admin

```typescript
// Для админ-панели
useEffect(() => {
  const checkAdmin = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      router.push(`/${locale}/login`);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      router.push(`/${locale}`);
      return;
    }

    setIsAdmin(true);
  };

  checkAdmin();
}, []);
```

---

## Структура файлов

```
frontend/
├── lib/
│   ├── auth-context.tsx      # React Context для auth
│   └── supabase/
│       ├── client.ts         # Browser client
│       └── server.ts         # Server client
├── app/
│   └── [locale]/
│       ├── login/page.tsx
│       ├── register/page.tsx
│       ├── reset-password/page.tsx
│       ├── update-password/page.tsx
│       ├── email-confirmed/page.tsx
│       └── email-not-confirmed/page.tsx
├── middleware.ts             # Route middleware
└── types/
    └── user.ts               # User interface
```

---

## Таблица profiles (Supabase)

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  account_number SERIAL,
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  role VARCHAR(20) DEFAULT 'user',

  -- Подписка
  subscription_status VARCHAR(20) DEFAULT 'demo',
  subscription_plan VARCHAR(20),
  subscription_expires_at TIMESTAMPTZ,
  demo_expires_at TIMESTAMPTZ,

  -- ΤΙΜΟΛΟΓΙΟ
  doc_type VARCHAR(20) DEFAULT 'ΑΠΟΔΕΙΞΗ',
  afm VARCHAR(9),
  doy VARCHAR(100),
  company_name VARCHAR(255),
  company_activity VARCHAR(255),
  company_address TEXT,

  -- Реферальная программа
  referral_code VARCHAR(20) UNIQUE,
  referred_by VARCHAR(20),
  bonus_months INTEGER DEFAULT 0,

  -- Метаданные
  preferred_language VARCHAR(5) DEFAULT 'el',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

*Документация создана: 2025-01-25*
