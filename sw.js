// Service worker : met toute l'app en cache pour un fonctionnement 100 % hors-ligne.
// Passe CACHE à 'tabata-v4', 'v5'… à chaque mise à jour pour forcer le renouvellement.
const CACHE = 'tabata-v3';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './bell.wav',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // Page principale : réseau d'abord (nouvelle version dès qu'il y a du réseau),
  // sinon cache (hors-ligne). Délai de 3 s pour ne pas rester bloqué sur un mauvais wifi.
  if (req.mode === 'navigate') {
    e.respondWith(
      Promise.race([
        fetch(req).then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then(c => c.put('./index.html', copy));
          }
          return res;
        }),
        new Promise((_, rej) => setTimeout(rej, 3000))
      ]).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Le reste : cache d'abord, mise à jour en arrière-plan.
  e.respondWith(
    caches.match(req).then(hit => {
      const fresh = fetch(req).then(res => {
        if (res && res.ok && new URL(req.url).origin === location.origin) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || fresh;
    })
  );
});
