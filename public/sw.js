// public/sw.js — lets the installed apps open quickly and show the last page on a weak network.
// Pages always try the internet first (so customers see current prices); built files and product images are cached.
// Database, login and payment requests (Firebase, Cloudinary) are never touched here.
const CACHE = 'inviname-v1'

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/'])).then(() => self.skipWaiting()))
})
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  )
})
self.addEventListener('fetch', (e) => {
  const req = e.request
  const url = new URL(req.url)
  if (req.method !== 'GET' || url.origin !== location.origin) return
  if (req.mode === 'navigate') {
    // newest page from the internet; if offline, the saved copy
    e.respondWith(
      fetch(req)
        .then((r) => {
          const copy = r.clone()
          caches.open(CACHE).then((c) => c.put(url.pathname.startsWith('/admin') ? '/admin/' : '/', copy))
          return r
        })
        .catch(() => caches.match(url.pathname.startsWith('/admin') ? '/admin/' : '/').then((r) => r || caches.match('/'))),
    )
    return
  }
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/images/') || url.pathname.startsWith('/icons/')) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((r) => {
        if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(req, copy)) }
        return r
      })),
    )
  }
})
