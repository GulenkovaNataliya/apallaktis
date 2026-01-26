// Service Worker для ΑΠΑΛΛΑΚΤΗΣ
// ================================

const CACHE_NAME = 'apallaktis-v9';
const OFFLINE_URL = '/offline.html';

// Только статические файлы - НЕ кешируем HTML страницы
const urlsToCache = [
  '/offline.html',
  '/icon-192.png',
  '/icon-512.png',
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] Installed successfully');
        // Активировать новый SW немедленно
        return self.skipWaiting();
      })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Удалить старые кэши
            return cacheName !== CACHE_NAME;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
    .then(() => {
      console.log('[SW] Activated successfully');
      // Взять контроль над всеми страницами немедленно
      return self.clients.claim();
    })
  );
});

// Обработка запросов (Fetch)
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Пропускаем не-GET запросы
  if (request.method !== 'GET') {
    return;
  }

  // Пропускаем запросы к API
  if (request.url.includes('/api/')) {
    return;
  }

  // Пропускаем админ-панель - не кэшируем вообще
  if (request.url.includes('/admin')) {
    return;
  }

  // Пропускаем chrome-extension и другие схемы
  if (!request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    // Стратегия: Network First, НЕ кешируем HTML
    fetch(request)
      .then((response) => {
        // Кешируем только статические ресурсы (изображения, шрифты), НЕ HTML
        const url = new URL(request.url);
        const isStaticAsset = /\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/i.test(url.pathname);

        if (response && response.status === 200 && response.type === 'basic' && isStaticAsset) {
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }

        return response;
      })
      .catch(() => {
        // Если сеть недоступна, пытаемся найти в кэше
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Если ресурса нет в кэше, показываем offline страницу для навигации
          if (request.mode === 'navigate') {
            return caches.match(OFFLINE_URL);
          }

          // Для остальных ресурсов возвращаем пустой ответ
          return new Response('Network error', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain',
            }),
          });
        });
      })
  );
});

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// Push уведомления (для будущего использования)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received:', event);

  const options = {
    body: event.data ? event.data.text() : 'Новое уведомление',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    tag: 'apallaktis-notification',
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification('ΑΠΑΛΛΑΚΤΗΣ', options)
  );
});

// Клик по уведомлению
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event);

  event.notification.close();

  event.waitUntil(
    self.clients.openWindow('/')
  );
});
