/* Keep it Local Columbia County — service worker (Pass 41, Item 11).
   SCOPE SAFETY: this script lives inside the keep-it-local folder, so its
   registration scope is that folder and nothing outside it — it can never
   control the other previews this repo hosts. The fetch handler also
   double-checks every request against the registration scope.
   STRATEGY: pages and code (HTML/CSS/JS) are NETWORK-FIRST — this demo is
   revised constantly, and serving a stale cached build is the one failure
   we refuse. The cache is an offline fallback only. Images and icons are
   cache-first. The cache name carries the pass number; old caches are
   deleted on activate. */
var CACHE = 'kil-cache-v44';
var CORE = [
  './index.html',
  './directory.html',
  './events.html',
  './bundles.html',
  './listing.html',
  './news.html',
  './holidays.html',
  './style.css',
  './manifest.webmanifest',
  './img/icons/icon-192.png',
  './img/logo.webp'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.map(function (n) {
        if (n !== CACHE) return caches.delete(n);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;      // fonts, map tiles: untouched
  if (url.href.indexOf(self.registration.scope) !== 0) return;  // never outside this folder
  var path = url.pathname;
  var networkFirst = req.mode === 'navigate'
    || path.slice(-5) === '.html'
    || path.slice(-4) === '.css'
    || path.slice(-3) === '.js'
    || path.slice(-11) === '.webmanifest';
  if (networkFirst) {
    e.respondWith(fetch(req).then(function (res) {
      if (res && res.status === 200) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (hit) {
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match(self.registration.scope + 'index.html');
      });
    }));
  } else {
    e.respondWith(caches.match(req, { ignoreSearch: true }).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    }));
  }
});
