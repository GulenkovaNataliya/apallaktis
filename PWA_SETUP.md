# PWA_SETUP.md — Progressive Web App

Документация настройки PWA.

---

## Содержание

1. [manifest.json](#manifestjson)
2. [Иконки](#иконки)
3. [Service Worker](#service-worker)
4. [Meta tags в layout.tsx](#meta-tags-в-layouttsx)
5. [Как установить на телефон](#как-установить-на-телефон)
6. [Примеры кода](#примеры-кода)

---

## manifest.json

**Файл:** `frontend/public/manifest.json`

```json
{
  "name": "ΑΠΑΛΛΑΚΤΗΣ - Τέλος στη ρουτίνα!",
  "short_name": "ΑΠΑΛΛΑΚΤΗΣ",
  "description": "Όχι λογιστικό πρόγραμμα — εργαλείο προσωπικού οικονομικού ελέγχου για έργα",
  "start_url": "https://apallaktis.com/el",
  "scope": "https://apallaktis.com/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#01312d",
  "background_color": "#01312d",
  "lang": "el",
  "categories": ["finance", "business", "productivity"],
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-maskable-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Νέο Έξοδο",
      "short_name": "Έξοδο",
      "description": "Προσθήκη νέου εξόδου",
      "url": "/el/objects",
      "icons": [
        {
          "src": "/icon-192.png",
          "sizes": "192x192"
        }
      ]
    },
    {
      "name": "Εξαγωγή",
      "short_name": "Export",
      "description": "Εξαγωγή δεδομένων",
      "url": "/el/dashboard/export",
      "icons": [
        {
          "src": "/icon-192.png",
          "sizes": "192x192"
        }
      ]
    }
  ]
}
```

### Ключевые параметры

| Параметр | Значение | Описание |
|----------|----------|----------|
| `name` | ΑΠΑΛΛΑΚΤΗΣ - Τέλος στη ρουτίνα! | Полное название |
| `short_name` | ΑΠΑΛΛΑΚΤΗΣ | Короткое название (для иконки) |
| `display` | standalone | Полноэкранный режим без браузера |
| `orientation` | portrait-primary | Только портретная ориентация |
| `theme_color` | #01312d | Цвет статус-бара |
| `background_color` | #01312d | Цвет фона при загрузке |
| `start_url` | /el | Начальная страница |

---

## Иконки

### Список иконок

**Расположение:** `frontend/public/`

| Файл | Размер | Назначение |
|------|--------|------------|
| `icon-192.png` | 192×192 | Стандартная иконка |
| `icon-512.png` | 512×512 | Большая иконка |
| `icon-maskable-192.png` | 192×192 | Адаптивная иконка (Android) |
| `icon-maskable-512.png` | 512×512 | Адаптивная иконка (Android) |
| `apple-touch-icon.png` | 180×180 | iOS home screen |
| `favicon.ico` | 48×48 | Иконка вкладки |
| `favicon.png` | 32×32 | Иконка вкладки (PNG) |
| `icon.svg` | SVG | Векторная иконка |

### Maskable иконки

Maskable иконки имеют "безопасную зону" для адаптивных форм Android:

```
┌─────────────────────┐
│                     │
│   ┌───────────┐     │
│   │           │     │  ← Safe zone (80%)
│   │   LOGO    │     │
│   │           │     │
│   └───────────┘     │
│                     │
└─────────────────────┘
```

### Генерация иконок

Рекомендуемые инструменты:
- [PWA Asset Generator](https://github.com/nicholashm/pwa-asset-generator)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [Maskable.app](https://maskable.app/)

```bash
# Пример генерации с pwa-asset-generator
npx pwa-asset-generator logo.png ./public --icon-only --favicon
```

---

## Service Worker

**Файл:** `frontend/public/sw.js`

```javascript
const CACHE_NAME = 'apallaktis-v1';
const OFFLINE_URL = '/offline.html';

// Файлы для кэширования при установке
const INITIAL_CACHED_URLS = [
  '/',
  '/el',
  '/offline.html',
  '/icon-192.png',
  '/icon-512.png',
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Installing and caching app shell');
      return cache.addAll(INITIAL_CACHED_URLS);
    })
  );
  self.skipWaiting();
});

// Активация — очистка старых кэшей
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Стратегия: Network First, Cache Fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Пропускаем API запросы
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Только GET запросы
  if (request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Кэшируем успешные ответы
        if (response.ok && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(async () => {
        // При ошибке сети — ищем в кэше
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Для навигации — показываем offline страницу
        if (request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }

        return new Response('Offline', { status: 503 });
      })
  );
});

// Обработка сообщений
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME);
  }
});

// Push уведомления
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};

  const options = {
    body: data.body || 'Новое уведомление',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'ΑΠΑΛΛΑΚΤΗΣ', options)
  );
});

// Клик по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      // Если окно уже открыто — фокусируемся
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Иначе — открываем новое
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
```

### Offline страница

**Файл:** `frontend/public/offline.html`

```html
<!DOCTYPE html>
<html lang="el">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - ΑΠΑΛΛΑΚΤΗΣ</title>
  <style>
    body {
      font-family: 'Noto Sans', sans-serif;
      background: #01312d;
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      text-align: center;
      padding: 20px;
    }
    h1 { font-size: 24px; margin-bottom: 10px; }
    p { font-size: 16px; opacity: 0.8; }
    button {
      margin-top: 20px;
      padding: 12px 24px;
      background: #FF6B35;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <h1>📱 Χωρίς σύνδεση</h1>
  <p>Δεν υπάρχει σύνδεση στο διαδίκτυο</p>
  <button onclick="location.reload()">Δοκιμάστε ξανά</button>
</body>
</html>
```

---

## Meta tags в layout.tsx

**Файл:** `frontend/app/layout.tsx`

```typescript
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "ΑΠΑΛΛΑΚΤΗΣ",
  description: "Όχι λογιστικό πρόγραμμα — εργαλείο προσωπικού οικονομικού ελέγχου",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ΑΠΑΛΛΑΚΤΗΣ",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#01312d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="el">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="ΑΠΑΛΛΑΚΤΗΣ" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ΑΠΑΛΛΑΚΤΗΣ" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#01312d" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered:', registration.scope);
                    })
                    .catch(function(error) {
                      console.log('SW registration failed:', error);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Дополнительные meta tags (HTML)

```html
<!-- В <head> -->
<meta name="application-name" content="ΑΠΑΛΛΑΚΤΗΣ" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="ΑΠΑΛΛΑΚΤΗΣ" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="theme-color" content="#01312d" />
<meta name="msapplication-TileColor" content="#01312d" />
<meta name="msapplication-tap-highlight" content="no" />

<link rel="manifest" href="/manifest.json" />
<link rel="icon" href="/favicon.ico" sizes="48x48" />
<link rel="icon" href="/icon-192.png" sizes="192x192" type="image/png" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

---

## Как установить на телефон

### Android (Chrome)

1. Открыть сайт в Chrome
2. Нажать меню (⋮) в правом верхнем углу
3. Выбрать **"Установить приложение"** или **"Добавить на главный экран"**
4. Подтвердить установку

### iOS (Safari)

1. Открыть сайт в Safari
2. Нажать кнопку **"Поделиться"** (квадрат со стрелкой)
3. Прокрутить вниз и выбрать **"На экран «Домой»"**
4. Нажать **"Добавить"**

### Desktop (Chrome)

1. Открыть сайт в Chrome
2. Нажать иконку установки в адресной строке (⊕)
3. Или: меню → **"Установить ΑΠΑΛΛΑΚΤΗΣ"**

---

## Примеры кода

### Проверка установки PWA

```typescript
// Проверка, запущено ли как PWA
const isPWA = () => {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};
```

### Prompt для установки

```typescript
"use client";

import { useState, useEffect } from 'react';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted install');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="install-banner">
      <p>Εγκαταστήστε την εφαρμογή για καλύτερη εμπειρία!</p>
      <button onClick={handleInstall}>Εγκατάσταση</button>
      <button onClick={() => setShowPrompt(false)}>Όχι τώρα</button>
    </div>
  );
}
```

### Обновление Service Worker

```typescript
// Проверка и обновление SW
async function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;

      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Новая версия доступна
          if (confirm('Доступно обновление. Обновить?')) {
            newWorker.postMessage('SKIP_WAITING');
            window.location.reload();
          }
        }
      });
    });
  }
}
```

### Отправка Push уведомлений

```typescript
// Запрос разрешения
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

// Подписка на Push
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  // Отправить subscription на сервер
  await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription),
  });
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

---

## Структура файлов

```
frontend/public/
├── manifest.json           # Web App Manifest
├── sw.js                   # Service Worker
├── offline.html            # Offline fallback страница
├── favicon.ico             # Favicon (48x48)
├── favicon.png             # Favicon PNG
├── icon.svg                # Vector icon
├── icon-192.png            # App icon 192x192
├── icon-512.png            # App icon 512x512
├── icon-maskable-192.png   # Maskable icon 192x192
├── icon-maskable-512.png   # Maskable icon 512x512
├── apple-touch-icon.png    # iOS icon
└── logo.png                # Logo

frontend/app/
└── layout.tsx              # PWA meta tags
```

---

## Чеклист PWA

- [ ] `manifest.json` в public/
- [ ] Service Worker зарегистрирован
- [ ] Иконки всех размеров (192, 512, maskable)
- [ ] `apple-touch-icon.png` для iOS
- [ ] Meta tags в layout.tsx
- [ ] `theme-color` соответствует дизайну
- [ ] Offline страница работает
- [ ] HTTPS включён (обязательно для SW)
- [ ] Lighthouse PWA score > 90

---

*Документация создана: 2025-01-25*
