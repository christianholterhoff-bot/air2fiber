/* Air2Fiber Service Worker, Version 0.31.3, Build a67fe8bf8f */
const C = "air2fiber-0.31.3-a67fe8bf8f";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (new URL(e.request.url).origin !== location.origin) return;
  // Netz zuerst (neue Version erscheint sofort), bei Funkloch oder Zeitüberschreitung aus dem Speicher
  e.respondWith((async () => {
    const c = await caches.open(C);
    try {
      const r = await Promise.race([fetch(e.request, {cache: "no-cache"}), new Promise((_, rej) => setTimeout(rej, 4000))]);
      if (r && r.ok) { c.put(e.request, r.clone()); return r; }
    } catch (_) {}
    const hit = await c.match(e.request, {ignoreSearch: true});
    return hit || (await caches.match("./index.html")) || Response.error();
  })());
});