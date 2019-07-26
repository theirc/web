var CACHE_NAME ='rescue-cache-v1';

var urlsToCache = [
      '/',
      '/index.html',
      '/manifest.json',
      '/images/cn.tb.png',
      '/fonts/roboto.woff2',
      '/css',
      '/css/app.css',
      '/css/icomoon-font.css',
      '/css/urdu-font.css',
      '/el-salvador',
      '/services/',
      '/images/',
      '/static/js/bundle.js',
      '/js/fac4bfa814.js',
      '/css/tigrinya.css',
      '/sockjs-node/info?t=1557509894850',
      '/css/material-icons.css',
      '/css/ionicons.min.css',  
      'https://fonts.gstatic.com/s/materialicons/v47/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
      '/fonts/fontawesome-webfont.woff2',
      '/css/fac4bfa814.css',
      '/css/fontawesome.min.css',
      '/images/cn-offline-map.png',
      '/images/cn-offline-map-mobile.png',
      '/images/ri-offline-map.png',
      '/images/ri-offline-map-mobile.png',
      'https://images.ctfassets.net/e17qk44d7f2w/5lL1DFX7jymqYwkaMIEKSK/a8aae35aca1aef19f56e268ee674fe7b/cn-hero.jpg?fm=jpg&fl=progressive',
      // 'https://afeld.github.io/emoji-css/emoji.css',
      // 'https://ta-media.citymaps.io/lib/v1.0.63/citymaps.css',
      // 'https://refugeecdn.blob.core.windows.net/$web/webapp-libs/lodash/4.17.4/lodash.min.js',
      // 'https://refugeecdn.blob.core.windows.net/$web/webapp-libs/moment/2.19.1/moment-with-locales.min.js',
      // 'https://refugeecdn.blob.core.windows.net/$web/webapp-libs/autolinker/1.4.4/Autolinker.min.js',
      // 'https://refugeecdn.blob.core.windows.net/$web/webapp-libs/contentful/5.0.1/contentful.browser.min.js',
      // 'https://refugeecdn.blob.core.windows.net/$web/webapp-libs/remarkable/1.7.1/remarkable.min.js',
      // 'https://refugeecdn.blob.core.windows.net/$web/webapp-libs/immutable/3.8.2/immutable.min.js',
      'https://refugeecdn.blob.core.windows.net/$web/webapp-libs/react/16.7.0/react.production.min.js',
      'https://refugeecdn.blob.core.windows.net/$web/webapp-libs/react-dom/16.7.0/react-dom.production.min.js',
      // 'https://refugeecdn.blob.core.windows.net/$web/webapp-libs/bluebird/3.5.1/bluebird.min.js'
      
      ];

self.addEventListener('install', function(event) {
  event.waitUntil(
      caches.open(CACHE_NAME)
      .then(function(cache) {
          // Open a cache and cache our files
          cache.addAll(urlsToCache).then((r)=> console.log("Add all:",r)).catch((c) => console.log("Error add all:", c));
      })
  );
});  

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
  // event.waitUntil(async function() {
  //   const cacheNames = await caches.keys();
  //   await Promise.all(
  //     cacheNames.filter((cacheName) => {
  //       //return true;
  //     }).map(cacheName => caches.delete(cacheName))
  //   );
  // }());
});



self.addEventListener('fetch', function(event) {
  if (navigator.onLine){
    fetch(event.request).then(function(response) {
      return response
    })
  }else{
    event.respondWith(
      caches.match(event.request).then(function(resp) {
        return resp || fetch(event.request).then(function(response) {
          return caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, response.clone());
            return response;
          });  
        });
      })
    );
  }
  
 
  
});

async function requestBackend(event){
  var url = event.request.clone();
  const res = await fetch(url);
  //if not a valid response send the error
  if (!res || res.status !== 200 || res.type !== 'basic') {
    return res;
  }
  var response = res.clone();
  caches.open(CACHE_NAME).then(function (cache) {
    cache.put(event.request, response);
  });
  return res;
}