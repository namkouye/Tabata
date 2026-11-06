// Service worker : cache hors-ligne + mises à jour automatiques versionnées.
//
// Le numéro de version vient de version.js. Le navigateur surveille sw.js ET version.js :
// dès que le numéro change, une nouvelle version du service worker s'installe en arrière-plan
// dans son propre cache. Elle reste « en attente » jusqu'à ce que la page lui donne le feu vert
// (message SKIP_WAITING) : ainsi une séance en cours n'est jamais interrompue.
importScripts('version.js');

const VERSION = self.APP_VERSION || 'dev';
const PREFIX = 'tabata-';
const CACHE = PREFIX + VERSION;
const ASSETS = [
  './',
  './index.html',
  './version.js',
  './manifest.webmanifest',
  './bell.wav',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  // cache: 'reload' = on ignore le cache HTTP de GitHub Pages (≈10 min) pour récupérer les vrais fichiers.
  // Si un fichier manque (réseau coupé), l'installation échoue et sera retentée plus tard : pas de version bancale.
  e.waitUntil(
    caches.open(CACHE).then(c => Promise.all(ASSETS.map(u => c.add(new Request(u, { cache: 'reload' })))))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith(PREFIX) && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', e => {
  if (!e.data) return;
  if (e.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (e.data.type === 'GET_VERSION' && e.source) e.source.postMessage({ type: 'VERSION', version: VERSION });
});

// Tout vient du cache de CETTE version : la page, la cloche et les scripts restent cohérents entre eux.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const page = await cache.match('./index.html');
      if (page) return page;
    }
    return fetch(req);
  })());
});
