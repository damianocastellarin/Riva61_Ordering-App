const CACHE_NAME = 'ordini-cache-v89';
const urlsToCache = [
  './',
  './index.html',
  './styles/reset.css',
  './styles/layout.css',
  './js/app.js',
  './js/state.js',
  './js/ui.js',
  './js/pwa-install.js',
  './js/orderBuilder.js',
  './js/auth.js',
  './js/constants.js',
  './manifest.json',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        urlsToCache.map(url => {
          return fetch(url, { cache: 'reload' })
            .then(response => {
              if (!response.ok) throw new Error(`Fallito download: ${url}`);
              return cache.put(url, response);
            })
            .catch(err => console.error("Errore installazione risorsa:", url, err));
        })
      );
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  if (event.request.url.includes('firebasejs') || event.request.url.includes('firestore.googleapis')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
        }
        return networkResponse;
      }).catch(() => {
        return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});