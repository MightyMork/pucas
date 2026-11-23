// Púcas Cards service worker: pages and scripts fresh when online (saved copy when offline),
// pictures from the saved copy. Only this game's own files under /pucas/; Microsoft, OneDrive and ntfy are never touched.
const CACHE = "pucas-v9";
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "app.webmanifest", "engine.js", "link.js", "icons/rua-icon-192.png", "icons/rua-icon-512.png"].map(u => new Request(u, {cache:"reload"})))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("pucas-") && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url); if (url.origin !== self.location.origin || !url.pathname.startsWith("/pucas/")) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(new Request(req.url, {cache:"no-cache", credentials:"same-origin"})).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put("./", c)); } return res; }).catch(() => caches.match("./")));
    return;
  }
  if (/\.(js|webmanifest)$/.test(url.pathname)) {
    e.respondWith(fetch(req, {cache:"no-cache"}).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; }).catch(() => caches.match(req)));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok) { const c = res.clone(); caches.open(CACHE).then(x => x.put(req, c)); } return res; })));
});
