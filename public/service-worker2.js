var CACHE_NAME ='rescue-cache-v2';

var urlsToCache = [
    '/',
    '/manifest.json',
    '/images/cn.tb.png',
    'https://fonts.gstatic.com/s/roboto/v19/KFOlCnqEu92Fr1MmSU5fBBc4AMP6lQ.woff2',
    '/index.html',
    '/css',
    '/css/app.css',
    '/css/icomoon-font.css',
    '/css/urdu-font.css',
    '/el-salvador',
    '/static',
    '/images/',
    '/static/js/bundle.js',
    'http://localhost:3000/css/tigrinya.css',
    'https://use.fontawesome.com/fac4bfa814.js',
    'http://localhost:3000/sockjs-node/info?t=1557509894850',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://code.ionicframework.com/ionicons/2.0.1/css/ionicons.min.css',
    'https://admin.cuentanos.org/e/production/v2/services/searchlist/?filter=relatives&geographic_region=el-salvador&page=1&page_size=1000&type_numbers=',
    
  ];
console.log("Service Worker");

self.addEventListener('install', function(event) {
event.waitUntil(
    caches.open(CACHE_NAME)
    .then(function(cache) {
        // Open a cache and cache our files
        return cache.addAll(urlsToCache);
    })
);
});

self.addEventListener('activate', (event) => {
    event.waitUntil(async function() {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.filter((cacheName) => {
          // Return true if you want to remove this cache,
          // but remember that caches are shared across
          // the whole origin
        }).map(cacheName => caches.delete(cacheName))
      );
    }());
  });

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {

            return response || fetch(event.request, {mode: 'no-cors'});
        })
    );
});
