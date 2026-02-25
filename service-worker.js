const CACHE_NAME = 'ordini-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles/reset.css',
  './styles/layout.css',
  './js/app.js',
  './js/state.js',
  './js/ui.js',
  './js/orderBuilder.js',
  './data/categorie.js',
  './data/prodotti.js',
  './data/fornitori.js',
  './manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
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

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});