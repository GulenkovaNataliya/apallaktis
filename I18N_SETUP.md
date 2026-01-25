# I18N_SETUP.md — Мультиязычность

Документация системы интернационализации (i18n).

---

## Содержание

1. [Структура мультиязычности](#структура-мультиязычности)
2. [Поддерживаемые языки](#поддерживаемые-языки)
3. [Файлы переводов](#файлы-переводов)
4. [Как добавить новый язык](#как-добавить-новый-язык)
5. [Как использовать переводы в компонентах](#как-использовать-переводы-в-компонентах)
6. [Примеры кода](#примеры-кода)

---

## Структура мультиязычности

### Обзор

- **Библиотека:** next-intl
- **Роутинг:** Dynamic segment `[locale]`
- **Переводы:** Один файл `messages.ts` со всеми языками
- **RTL поддержка:** Арабский (ar)

### Структура URL

```
/language-select          → Выбор языка
/el/login                 → Греческий
/ru/dashboard             → Русский
/en/pricing               → Английский
/ar/help                  → Арабский (RTL)
```

### Файловая структура

```
frontend/
├── i18n.ts                    # Конфигурация next-intl
├── lib/
│   └── messages.ts            # Все переводы (~3000 строк)
├── app/
│   ├── language-select/       # Страница выбора языка
│   │   └── page.tsx
│   └── [locale]/              # Динамический сегмент
│       ├── layout.tsx         # Locale layout
│       ├── page.tsx           # Landing
│       ├── login/page.tsx
│       ├── register/page.tsx
│       └── ...
└── components/
    └── LanguageSelector.tsx   # Компонент выбора языка
```

---

## Поддерживаемые языки

### 8 языков

| Код | Язык | Название (native) | Направление |
|-----|------|-------------------|-------------|
| `el` | Греческий | Ελληνικά | LTR |
| `ru` | Русский | Русский | LTR |
| `uk` | Украинский | Українська | LTR |
| `sq` | Албанский | Shqip | LTR |
| `bg` | Болгарский | Български | LTR |
| `ro` | Румынский | Română | LTR |
| `en` | Английский | English | LTR |
| `ar` | Арабский | العربية | **RTL** |

### Конфигурация

**Файл:** `frontend/i18n.ts`

```typescript
import { notFound } from "navigation";
import { getRequestConfig } from "next-intl/server";
import { messages } from "./lib/messages";

// Фиксированный порядок языков
export const locales = ["el", "ru", "uk", "sq", "bg", "ro", "en", "ar"] as const;
export type Locale = (typeof locales)[number];

// Язык по умолчанию
export const defaultLocale: Locale = "el";

// RTL языки
export const rtlLocales: Locale[] = ["ar"];

// Названия языков (native)
export const languageNames: Record<Locale, string> = {
  el: "Ελληνικά",
  ru: "Русский",
  uk: "Українська",
  sq: "Shqip",
  bg: "Български",
  ro: "Română",
  en: "English",
  ar: "العربية",
};

// Проверка RTL
export function isRTL(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export default getRequestConfig(async ({ locale }) => {
  if (!locale || !locales.includes(locale as Locale)) notFound();
  return {
    locale: locale as string,
    messages: messages[locale as Locale],
  };
});
```

---

## Файлы переводов

### Основной файл

**Файл:** `frontend/lib/messages.ts`

```typescript
export const messages = {
  el: {
    landing: {
      slogan: "Τέλος στη ρουτίνα!",
      login: "Είσοδος",
      register: "Δημιουργία λογαριασμού",
      terms: "Όροι χρήσης",
      privacy: "Πολιτική Απορρήτου",
      backToLanguageSelection: "← Επιλογή γλώσσας",
      viewPricing: "Τιμοκατάλογος",
      howToUse: "Οδηγίες",
    },
    pricing: {
      title: "Τιμές",
      back: "← Πίσω",
      // ...
    },
    login: {
      title: "Είσοδος",
      email: "Email",
      password: "Κωδικός",
      forgotPassword: "Ξεχάσατε τον κωδικό;",
      submit: "Είσοδος",
      noAccount: "Δεν έχετε λογαριασμό;",
      register: "Εγγραφή",
      invalidCredentials: "Λάθος email ή κωδικός",
      emailNotConfirmed: "Το email δεν έχει επιβεβαιωθεί",
    },
    // ... другие секции
  },
  ru: {
    landing: {
      slogan: "Конец рутине!",
      login: "Вход",
      register: "Создать аккаунт",
      // ...
    },
    // ...
  },
  // ... остальные языки
};

export type Messages = typeof messages.el;
export type Locale = keyof typeof messages;
```

### Секции переводов

| Секция | Описание |
|--------|----------|
| `landing` | Главная страница |
| `login` | Страница входа |
| `register` | Страница регистрации |
| `resetPassword` | Сброс пароля |
| `pricing` | Тарифы |
| `help` | Инструкция |
| `privacy` | Политика конфиденциальности |
| `terms` | Условия использования |
| `dashboard` | Панель управления |
| `objects` | Объекты |
| `finance` | Финансы |
| `subscription` | Подписка |
| `referral` | Реферальная программа |
| `globalExpenses` | Общие расходы |
| `analysis` | Финансовый анализ |
| `pagePay` | Меню оплаты |
| `paymentMethods` | Методы оплаты |
| `thankYou` | Спасибо за покупку |
| `demoExpired` | DEMO истёк |
| `emailConfirmed` | Email подтверждён |
| `emailNotConfirmed` | Email не подтверждён |

---

## Как добавить новый язык

### Шаг 1: Добавить код в i18n.ts

```typescript
// i18n.ts
export const locales = ["el", "ru", "uk", "sq", "bg", "ro", "en", "ar", "de"] as const;
//                                                                        ^^^ новый

export const languageNames: Record<Locale, string> = {
  // ... существующие
  de: "Deutsch",  // новый
};

// Если RTL язык:
export const rtlLocales: Locale[] = ["ar", "he"]; // добавить код
```

### Шаг 2: Добавить переводы в messages.ts

```typescript
// lib/messages.ts
export const messages = {
  // ... существующие языки

  de: {
    landing: {
      slogan: "Schluss mit der Routine!",
      login: "Anmelden",
      register: "Konto erstellen",
      terms: "Nutzungsbedingungen",
      privacy: "Datenschutz",
      backToLanguageSelection: "← Sprachauswahl",
      viewPricing: "Preise",
      howToUse: "Anleitung",
    },
    login: {
      title: "Anmelden",
      email: "E-Mail",
      password: "Passwort",
      forgotPassword: "Passwort vergessen?",
      submit: "Anmelden",
      noAccount: "Kein Konto?",
      register: "Registrieren",
      invalidCredentials: "Falsche E-Mail oder Passwort",
      emailNotConfirmed: "E-Mail nicht bestätigt",
    },
    // ... все остальные секции
  },
};
```

### Шаг 3: Добавить шрифт (если нужен)

```typescript
// app/[locale]/layout.tsx
import { Noto_Sans, Noto_Sans_Arabic, Noto_Sans_Hebrew } from "next/font/google";

const notoSansHebrew = Noto_Sans_Hebrew({
  subsets: ["hebrew"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-hebrew",
  display: "swap",
});
```

### Шаг 4: Добавить код страны (для телефона)

```typescript
// В register/page.tsx
const countryCodes = [
  // ... существующие
  { code: "+49", country: "DE" },  // Германия
];
```

---

## Как использовать переводы в компонентах

### Паттерн 1: Client Component (основной)

```typescript
"use client";

import { useParams } from "next/navigation";
import { messages, type Locale } from "@/lib/messages";

export default function MyComponent() {
  const params = useParams();
  const locale = (params.locale as Locale) || "el";

  // Получаем переводы с fallback на греческий
  const t = messages[locale]?.landing || messages.el.landing;

  return (
    <div>
      <h1>{t.slogan}</h1>
      <button>{t.login}</button>
    </div>
  );
}
```

### Паттерн 2: Несколько секций

```typescript
"use client";

import { useParams } from "next/navigation";
import { messages, type Locale } from "@/lib/messages";

export default function LoginPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "el";

  const t = messages[locale]?.login || messages.el.login;
  const tCommon = messages[locale]?.landing || messages.el.landing;

  return (
    <div>
      <h1>{t.title}</h1>
      <input placeholder={t.email} />
      <input placeholder={t.password} />
      <button>{t.submit}</button>
      <a href={`/${locale}`}>{tCommon.backToLanguageSelection}</a>
    </div>
  );
}
```

### Паттерн 3: Layout с RTL

```typescript
// app/[locale]/layout.tsx
import { isRTL, type Locale } from "@/i18n";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dir = isRTL(locale as Locale) ? "rtl" : "ltr";

  return (
    <div lang={locale} dir={dir}>
      {children}
    </div>
  );
}
```

### Паттерн 4: Компонент выбора языка

```typescript
// components/LanguageSelector.tsx
"use client";

import { useRouter } from "next/navigation";
import { locales, languageNames, type Locale } from "@/i18n";

export default function LanguageSelector() {
  const router = useRouter();

  const handleLanguageSelect = (locale: Locale) => {
    localStorage.setItem("selectedLanguage", locale);
    router.push(`/${locale}`);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleLanguageSelect(locale)}
          className="rounded-xl p-4 text-lg font-medium"
        >
          {languageNames[locale]}
        </button>
      ))}
    </div>
  );
}
```

---

## Примеры кода

### Полная страница с переводами

```typescript
// app/[locale]/pricing/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { messages, type Locale } from "@/lib/messages";

export default function PricingPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";

  const t = messages[locale]?.pricing || messages.el.pricing;

  return (
    <div className="min-h-screen bg-[#01312d] text-white p-6">
      {/* Header */}
      <header className="flex items-center mb-8">
        <button
          onClick={() => router.push(`/${locale}`)}
          className="text-white"
        >
          {t.back}
        </button>
        <h1 className="flex-1 text-center text-xl font-bold">
          {t.title}
        </h1>
      </header>

      {/* Pricing cards */}
      <div className="space-y-4">
        <div className="bg-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold">Basic</h2>
          <p className="text-2xl font-bold">€24,80</p>
          <p className="text-sm opacity-70">{t.perMonth}</p>
        </div>

        <div className="bg-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold">Standard</h2>
          <p className="text-2xl font-bold">€49,60</p>
          <p className="text-sm opacity-70">{t.perMonth}</p>
        </div>

        <div className="bg-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-bold">Premium</h2>
          <p className="text-2xl font-bold">€93,00</p>
          <p className="text-sm opacity-70">{t.perMonth}</p>
        </div>
      </div>
    </div>
  );
}
```

### Переключатель языка в настройках

```typescript
// app/[locale]/dashboard/settings/page.tsx
"use client";

import { useParams, useRouter } from "next/navigation";
import { locales, languageNames, type Locale } from "@/i18n";
import { messages } from "@/lib/messages";

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const locale = (params.locale as Locale) || "el";

  const t = messages[locale]?.settings || messages.el.settings;

  const handleLanguageChange = (newLocale: Locale) => {
    localStorage.setItem("selectedLanguage", newLocale);
    // Заменяем locale в текущем URL
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-6">{t.title}</h1>

      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t.language}</h2>
        <div className="grid grid-cols-2 gap-2">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLanguageChange(loc)}
              className={`p-3 rounded-lg border ${
                loc === locale
                  ? "border-orange-500 bg-orange-500/10"
                  : "border-gray-300"
              }`}
            >
              {languageNames[loc]}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
```

### Шрифты для всех языков

```typescript
// app/[locale]/layout.tsx
import { Noto_Sans, Noto_Sans_Arabic } from "next/font/google";
import { isRTL, type Locale } from "@/i18n";

// Шрифт для Latin, Cyrillic, Greek
const notoSans = Noto_Sans({
  subsets: ["latin", "cyrillic", "greek"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

// Шрифт для Arabic
const notoSansArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-arabic",
  display: "swap",
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRtl = isRTL(locale as Locale);

  return (
    <div
      lang={locale}
      dir={isRtl ? "rtl" : "ltr"}
      className={`${notoSans.variable} ${notoSansArabic.variable} font-sans`}
    >
      {children}
    </div>
  );
}
```

### CSS для RTL

```css
/* globals.css */

/* Автоматическое зеркалирование для RTL */
[dir="rtl"] .flex-row {
  flex-direction: row-reverse;
}

[dir="rtl"] .ml-auto {
  margin-left: 0;
  margin-right: auto;
}

[dir="rtl"] .mr-auto {
  margin-right: 0;
  margin-left: auto;
}

[dir="rtl"] .text-left {
  text-align: right;
}

[dir="rtl"] .text-right {
  text-align: left;
}

/* Иконки стрелок */
[dir="rtl"] .icon-arrow-left {
  transform: scaleX(-1);
}

[dir="rtl"] .icon-arrow-right {
  transform: scaleX(-1);
}
```

---

## Типизация

### Типы переводов

```typescript
// lib/messages.ts

// Тип одного языка (на основе греческого)
export type Messages = typeof messages.el;

// Тип локали
export type Locale = keyof typeof messages;

// Тип секции
export type LandingMessages = Messages['landing'];
export type LoginMessages = Messages['login'];
// ...

// Использование
const t: LandingMessages = messages[locale].landing;
```

### Проверка типов

```typescript
// Проверка что все языки имеют одинаковую структуру
type EnsureAllLocales = {
  [K in Locale]: Messages;
};

// TypeScript выдаст ошибку если какой-то язык
// не имеет всех ключей
const _check: EnsureAllLocales = messages;
```

---

## Middleware (опционально)

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Проверяем есть ли locale в URL
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Редирект на default locale
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

---

## Чеклист мультиязычности

- [ ] Все тексты вынесены в `messages.ts`
- [ ] 8 языков переведены полностью
- [ ] RTL стили для арабского работают
- [ ] Шрифты загружаются для всех скриптов
- [ ] `lang` атрибут установлен
- [ ] `dir` атрибут для RTL
- [ ] localStorage сохраняет выбор языка
- [ ] Переключение языка работает
- [ ] SEO meta tags переведены

---

*Документация создана: 2025-01-25*
