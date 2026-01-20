const CACHE_NAME = 'smartneighbor-v3';
const urlsToCache = [
  '/',
  '/dashboard',
  '/residents',
  '/security-schedule',
  '/feedback',
  '/announcements',
  '/login',
  '/manifest.json',
  '/icon.svg',
];

// Install event
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Cache opened, caching URLs');
      return cache.addAll(urlsToCache).catch(err => {
        console.log('Some URLs failed to cache:', err);
        // Continue even if some URLs fail
        return Promise.resolve();
      });
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', event => {
  // Skip POST requests
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  
  // Cache first for Next.js assets (CSS, JS, fonts)
  if (url.pathname.includes('/_next/') || 
      url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.woff') ||
      url.pathname.endsWith('.woff2')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(fetchResponse => {
          // Cache valid responses
          if (!fetchResponse || fetchResponse.status !== 200) {
            return fetchResponse;
          }
          const responseToCache = fetchResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return fetchResponse;
        }).catch(() => {
          return new Response('Asset offline', { status: 503 });
        });
      })
    );
  } else {
    // Network first for pages
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache valid responses
          if (!response || response.status !== 200) {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Return cached page
          return caches.match(event.request).then(response => {
            if (response) {
              return response;
            }
            // Fallback untuk halaman yang belum di-cache
            // Coba return dashboard atau halaman utama
            return caches.match('/dashboard').then(dashboardResponse => {
              return dashboardResponse || caches.match('/');
            });
          });
        })
    );
  }
});
