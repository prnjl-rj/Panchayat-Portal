const CACHE_NAME = 'panchayat-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((cacheNames) => {
    return Promise.all(cacheNames.map((name) => {
      if (name !== CACHE_NAME) return caches.delete(name);
    }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      });
    })
  );
});