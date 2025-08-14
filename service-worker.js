// Minimal offline cache
const CACHE = 'dice-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const { request } = e;
  // Network-first for html; cache-first otherwise
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(request, copy));
        return r;
      }).catch(() => caches.match('./'))
    );
  } else {
    e.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(request, copy));
        return r;
      }))
    );
  }
});
