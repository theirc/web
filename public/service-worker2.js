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
      '/fonts/KFOlCnqEu92Fr1MmSU5fBBc4AMP6lQ.woff2',
      '/fonts/fontawesome-webfont.woff2',
      '/css/fac4bfa814.css',
      '/css/fontawesome.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/react/16.7.0/umd/react.production.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.7.0/umd/react-dom.production.min.js',
      'http://images.ctfassets.net/e17qk44d7f2w/5lL1DFX7jymqYwkaMIEKSK/a8aae35aca1aef19f56e268ee674fe7b/cn-hero.jpg?fm=jpg&fl=progressive'
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
  let online = navigator.onLine;
  if(!online){   
    event.respondWith(
      caches.match(event.request).then(function(response) {       
          if(response){
            return response;
          }     
          requestBackend(event);
      })
    );
  }
  
});

function requestBackend(event){
  var url = event.request.clone();
  return fetch(url).then(function(res){
      //if not a valid response send the error
      if(!res || res.status !== 200 || res.type !== 'basic'){
          return res;
      }

      var response = res.clone();

      caches.open(CACHE_NAME).then(function(cache){
          cache.put(event.request, response);
      });

      return res;
  })
}