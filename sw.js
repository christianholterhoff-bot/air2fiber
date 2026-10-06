/* Air2Fiber Service Worker, Version 0.29.1, Build 637b58c697 */
const C = "air2fiber-0.29.1-637b58c697";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request, {ignoreSearch: true}).then(hit => {
      if (hit) {
        // im Hintergrund nach einer neueren Fassung sehen
        fetch(e.request).then(r => { if (r && r.ok) caches.open(C).then(c => c.put(e.request, r.clone())); }).catch(() => {});
        return hit;
      }
      return fetch(e.request).then(r => {
        if (r && r.ok && new URL(e.request.url).origin === location.origin) {
          const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp));
        }
        return r;
      }).catch(() => caches.match("./index.html"));
    })
  );
});