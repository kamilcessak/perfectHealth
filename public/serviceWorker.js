const CACHE = "perfecthealth-cache-v18";

const APP_SHELL_PATHS = [
  "./",  // Root URL - ważne dla nawigacji offline
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./src/main.js",
  "./src/constants.js",
  "./src/core/router.js",
  "./src/core/database.js",
  "./src/core/store.js",
  "./src/utils/error.js",
  "./src/utils/debounce.js",
  "./src/utils/file.js",
  "./src/utils/image.js",
  "./src/utils/rateLimit.js",
  "./src/utils/uuid.js",
  "./src/utils/validation.js",
  "./src/features/dashboard/routes.js",
  "./src/features/dashboard/view.js",
  "./src/features/dashboard/controller.js",
  "./src/features/measurements/routes.js",
  "./src/features/measurements/view.js",
  "./src/features/measurements/controller.js",
  "./src/features/measurements/model.js",
  "./src/features/measurements/repo.js",
  "./src/features/meals/routes.js",
  "./src/features/meals/view.js",
  "./src/features/meals/controller.js",
  "./src/features/meals/model.js",
  "./src/features/meals/repo.js",
];

const getBaseUrl = () => new URL("./", self.location.href).href;

/** Zwraca URL z zamienionym hostem (localhost ↔ 127.0.0.1) – cache może być pod innym hostem. */
function alternateHostUrl(urlString) {
  try {
    const u = new URL(urlString);
    if (u.hostname === "localhost") u.hostname = "127.0.0.1";
    else if (u.hostname === "127.0.0.1") u.hostname = "localhost";
    else return null;
    return u.href;
  } catch {
    return null;
  }
}

/** Szuka w cache: najpierw req, potem wersja z drugim hostem (localhost/127.0.0.1). */
async function matchCacheAnyHost(request, opts = {}) {
  const cached = await caches.match(request, opts);
  if (cached) return cached;
  // Obsłuż zarówno Request object jak i string URL
  const urlString = typeof request === "string" ? request : request.url;
  const alt = alternateHostUrl(urlString);
  if (alt) return caches.match(alt, opts);
  return undefined;
}

// Instalacja – cache z pełnymi URL
self.addEventListener("install", (e) => {
  const baseUrl = getBaseUrl();
  
  e.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      await Promise.allSettled(
        APP_SHELL_PATHS.map(async (path) => {
          const url = new URL(path, baseUrl).href;
          try {
            await cache.add(url);
          } catch (err) {
            console.warn("[SW] Failed to cache:", url, err.message);
          }
        })
      );
      return self.skipWaiting();
    })
  );
});

// Aktywacja – usuwa stare cache, claim() aby od razu obsługiwać stronę
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Obsługa żądań sieciowych
self.addEventListener("fetch", (e) => {
  try {
    const req = e.request;
    const url = new URL(req.url);

  // Zewnętrzne API - nie cache'ujemy, ale obsługujemy błędy offline
  if (url.origin !== location.origin) {
    if (url.hostname.includes("nominatim.openstreetmap.org")) {
      // Dla nominatim nie cache'ujemy, ale zwracamy pusty response offline zamiast błędu
      e.respondWith(
        fetch(req).catch(() => new Response(JSON.stringify({ error: "offline" }), {
          status: 503,
          headers: { "Content-Type": "application/json" }
        }))
      );
      return;
    }
    // Inne zewnętrzne zasoby - Network First z fallbackiem
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
          return res;
        })
        .catch(() => matchCacheAnyHost(req))
    );
    return;
  }

  if (req.mode === "navigate" || req.destination === "document") {
    const baseUrl = new URL("./", self.location.href).href;
    const indexUrl = new URL("index.html", baseUrl).href;
    const rootUrl = baseUrl; // np. "http://localhost:8001/"
    
    e.respondWith(
      (async () => {
        try {
          const res = await fetch(req);
          if (res.ok && res.type === "basic") {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(req, clone));
          }
          return res;
        } catch (err) {
          // Offline: szukaj w cache - najpierw dokładny URL, potem index.html, potem root
          const cached =
            (await matchCacheAnyHost(req, { ignoreSearch: true })) ||
            (await matchCacheAnyHost(indexUrl)) ||
            (await matchCacheAnyHost(rootUrl));
          if (cached) return cached;
          
          // Ostateczny fallback - statyczny HTML offline
          return new Response(
            "<!DOCTYPE html><html lang=\"pl\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Offline</title></head><body><p>Brak połączenia. Otwórz aplikację ponownie, gdy będziesz online.</p></body></html>",
            { headers: { "Content-Type": "text/html; charset=utf-8" } }
          );
        }
      })()
    );
    return;
  }

  // WSZYSTKIE pozostałe zasoby z tego samego origin – Cache First
  e.respondWith(
    (async () => {
      const cached = await matchCacheAnyHost(req);
      if (cached) return cached;
      
      try {
        const res = await fetch(req);
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((c) => c.put(req, clone));
        }
        return res;
      } catch {
        // Fallback dla różnych typów zasobów
        const fallback = await matchCacheAnyHost(req);
        if (fallback) return fallback;
        
        if (req.url.endsWith(".js")) {
          return new Response("// Offline", { status: 504, headers: { "Content-Type": "application/javascript" } });
        }
        if (req.url.endsWith(".css")) {
          return new Response("/* Offline */", { status: 504, headers: { "Content-Type": "text/css" } });
        }
        return new Response("Offline", { status: 504 });
      }
    })()
  );
  } catch (err) {
    console.error("[SW] Fetch error:", err);
  }
});
