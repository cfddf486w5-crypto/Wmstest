const CACHE = 'dlwms-v1';
const PRECACHE = [
  './', './index.html', './manifest.webmanifest',
  './css/theme.css', './css/layout.css', './css/components.css',
  './js/app.js','./js/router.js','./js/store.js','./js/ui.js','./js/ai.js','./js/export.js',
  './pages/modules.html','./pages/consolidation.html','./pages/inventaire.html','./pages/shipping.html','./pages/remise.html','./pages/settings.html','./pages/history.html',
  './pages/modules.js','./pages/consolidation.js','./pages/inventaire.js','./pages/shipping.js','./pages/remise.js','./pages/settings.js','./pages/history.js',
  './assets/icons/icon-192.svg','./assets/icons/icon-512.svg'
];
self.addEventListener('install', (e)=> e.waitUntil(caches.open(CACHE).then((c)=>c.addAll(PRECACHE))));
self.addEventListener('activate', (e)=> e.waitUntil(caches.keys().then((ks)=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch', (e)=> e.respondWith(caches.match(e.request).then((r)=> r || fetch(e.request).catch(()=>caches.match('./index.html')))));
