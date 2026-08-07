const CACHE_PREFIX = "ar-photo-static-";
const CACHE_NAME = `${CACHE_PREFIX}v4`;
const BASE_URL = "/ar.photo/";
const APP_SHELL = [BASE_URL, `${BASE_URL}manifest.webmanifest`, `${BASE_URL}icon.svg`];
const STATIC_DESTINATIONS = new Set(["script", "style", "font", "image"]);

function isSafeStaticRequest(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.search) return false;
  if (!url.pathname.startsWith(`${BASE_URL}assets/`)) return false;
  return STATIC_DESTINATIONS.has(request.destination);
}

function canStore(response) {
  const cacheControl = response.headers.get("cache-control") ?? "";
  return response.ok && response.type === "basic" && !/private|no-store/i.test(cacheControl);
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL.map((url) => new Request(url, { cache: "reload" })))),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "CLEAR_STATIC_CACHES") {
    event.waitUntil(
      caches
        .keys()
        .then((keys) =>
          Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX)).map((key) => caches.delete(key))),
        ),
    );
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(new Request(event.request, { cache: "no-store" })).catch(() => caches.match(BASE_URL)));
    return;
  }
  if (!isSafeStaticRequest(event.request)) return;
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (canStore(response)) await cache.put(event.request, response.clone());
      return response;
    }),
  );
});
