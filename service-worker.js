const CACHE_NAME = 'ordini-cache-v74';

const urlsToCache = [
    './',
    './index.html',
    './admin.html',
    './styles/reset.css',
    './styles/layout.css',
    './styles/bottomNav.css',
    './js/firebase.js',
    './js/auth.js',
    './js/admin.js',
    './js/app.js',
    './js/ui.js',
    './js/icons.js',
    './js/session.js',
    './js/state.js',
    './js/router.js',
    './js/appNavigator.js',
    './js/pwa-install.js',
    './js/services/db.js',
    './js/services/storage.js',
    './js/services/dataCache.js',
    './js/bottomNav/bottomNavConfig.js',
    './js/bottomNav/bottomNavRenderer.js',
    './js/bottomNav/bottomNav.js',
    './js/order/orderBuilder.js',
    './js/admin/uiComponents.js',
    './js/admin/productModal.js',
    './js/admin/breadcrumbs.js',
    './js/admin/adminActions.js',
    './js/views/homeView.js',
    './js/views/orderView.js',
    './js/views/summaryView.js',
    './js/views/profileView.js',
    './manifest.json',
    './assets/icons/icon-192.png',
    './assets/icons/icon-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return Promise.all(
                urlsToCache.map(url =>
                    fetch(url, { cache: 'reload' })
                        .then(response => {
                            if (!response.ok) throw new Error(`Fallito: ${url}`);
                            return cache.put(url, response);
                        })
                        .catch(err => console.error("SW Install Error:", url, err))
                )
            );
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('message', event => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (
        event.request.url.includes('firebasejs') ||
        event.request.url.includes('firestore.googleapis')
    ) return;

    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            const fetchPromise = fetch(event.request)
                .then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        const resClone = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
                    }
                    return networkResponse;
                })
                .catch(() => cachedResponse);
            return cachedResponse || fetchPromise;
        })
    );
});