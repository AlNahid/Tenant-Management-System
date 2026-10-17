// Network-first; falls back to cache so the app opens offline.
const CACHE = 'landlord-v2';
const FILES = ['./', "css/app.css","icon.svg","index.html","js/config.js","js/controllers/billController.js","js/controllers/buildingController.js","js/controllers/helpers.js","js/controllers/index.js","js/controllers/paymentController.js","js/controllers/sessionController.js","js/controllers/unitController.js","js/main.js","js/models/api.js","js/models/cache.js","js/models/calc.js","js/models/store.js","js/views/billImage.js","js/views/buildings.js","js/views/dashboard.js","js/views/generate.js","js/views/index.js","js/views/layout.js","js/views/parts.js","js/views/payments.js","js/views/settings.js","js/views/tenants.js","js/views/ui.js","manifest.json"];

self.oninstall = (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
self.onactivate = (e) => e.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
self.onfetch = (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.pathname.startsWith('/api/')) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('index.html'))));
};
