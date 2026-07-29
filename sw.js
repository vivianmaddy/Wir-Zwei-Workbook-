/*
  Macht das Journal offline nutzbar.
  Alles, was einmal geladen wurde, wird abgelegt und danach zuerst aus dem
  Speicher bedient. Ohne Netz funktioniert die App dadurch vollständig weiter.
*/
const CACHE = "wir-zwei-v1";

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(["./", "./index.html"]).catch(() => null))
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  /* Seitenaufrufe: erst Netz, sonst die gespeicherte Startseite */
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html").then((r) => r || caches.match("./")))
    );
    return;
  }

  /* Alles andere: erst Speicher, sonst Netz – und dabei ablegen */
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req)
        .then((res) => {
          if (res && (res.status === 200 || res.type === "opaque")) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => null);
          }
          return res;
        })
        .catch(() => hit);
    })
  );
});
