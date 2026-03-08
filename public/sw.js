const CACHE_NAME = 'smartneighbor-v4';
const STATIC_CACHE = 'smartneighbor-static-v4';
const DYNAMIC_CACHE = 'smartneighbor-dynamic-v4';
const API_CACHE = 'smartneighbor-api-v4';

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

// Maximum cache size
const MAX_CACHE_SIZE = 50;

// Helper to limit cache size
const limitCacheSize = (cacheName, maxSize) => {
  caches.open(cacheName).then(cache => {
    cache.keys().then(keys => {
      if (keys.length > maxSize) {
        cache.delete(keys[0]).then(() => limitCacheSize(cacheName, maxSize));
      }
    });
  });
};

// Install event
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('[SW] Precaching App Shell');
      return cache.addAll(urlsToCache).catch(err => {
        console.warn('[SW] Some URLs failed to cache:', err);
        return Promise.resolve();
      });
    }).then(() => {
      console.log('[SW] Service Worker installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...');
  const cacheWhitelist = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Service Worker activated successfully');
      return self.clients.claim();
    })
  );
});

// Fetch event - Advanced caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Strategy 1: API calls - Network First with Cache Fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(request, clonedResponse);
              limitCacheSize(API_CACHE, MAX_CACHE_SIZE);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || new Response(
              JSON.stringify({ error: 'Offline - No cached data available' }),
              { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            );
          });
        })
    );
    return;
  }

  // Strategy 2: Static assets (CSS, JS, fonts, images) - Cache First
  if (
    url.pathname.includes('/_next/') || 
    url.pathname.match(/\.(css|js|woff|woff2|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then(response => {
          if (response && response.status === 200) {
            const clonedResponse = response.clone();
            caches.open(STATIC_CACHE).then(cache => {
              cache.put(request, clonedResponse);
              limitCacheSize(STATIC_CACHE, MAX_CACHE_SIZE);
            });
          }
          return response;
        }).catch(() => {
          return new Response('Asset offline', { 
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
    );
    return;
  }

  // Strategy 3: Pages - Network First with Cache Fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.status === 200) {
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, clonedResponse);
            limitCacheSize(DYNAMIC_CACHE, MAX_CACHE_SIZE);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Fallback to dashboard or homepage
          return caches.match('/dashboard').then(dashboardResponse => {
            return dashboardResponse || caches.match('/');
          });
        });
      })
  );
});
