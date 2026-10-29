/* Service worker. NAO editar sw.js: ele e gerado por tools/build.mjs a partir deste arquivo. */
const VERSAO = "94ac77c46f";
const CACHE = "jp26-" + VERSAO;
const PRECACHE = ["./","index.html","manifest.webmanifest","icons/icon.svg","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"];

/* cache:"reload" ignora o cache HTTP do navegador (o GitHub Pages serve com max-age=600): sem isso, uma versao
   nova instalada dentro de 10 min da anterior guardava o index.html velho sob o nome da versao nova. */
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(PRECACHE.map(u => c.add(new Request(u, {cache: "reload"}))))));
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith("jp26-") && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener("message", e => {
  if (e.data === "pular-espera") self.skipWaiting();
});

/* Mesma origem: cache primeiro (tudo foi pre-carregado), rede so se faltar.
   Outras origens (API de cambio, mapas): nao interceptar, o app trata o erro. */
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(req, {ignoreSearch: true});
    if (hit) return hit;
    try {
      const res = await fetch(req);
      if (res.ok) c.put(req, res.clone());
      return res;
    } catch (err) {
      if (req.mode === "navigate") return (await c.match("index.html")) || Response.error();
      return Response.error();
    }
  })());
});
