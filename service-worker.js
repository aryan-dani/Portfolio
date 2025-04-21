

const CACHE_NAME = "portfolio-cache-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/about.html",
  "/experience.html",
  "/projects.html",
  "/skills.html",
  "/copyright.html",
  "/offline.html",
  // Correct manifest path
  "/manifest.json",
  "/Js/main.js",
  "/Js/performance.js",
  "/SCSS/main.css",
  "/Images/Header.jpg",
  "/Images/Header_Phone.jpg",
];
const EXTERNAL_ASSETS = [
  "https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js",
  "https://kit.fontawesome.com/1267cf2b7d.js",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
];
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing Service Worker...");
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Pre-caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return caches.open(CACHE_NAME + "-externals").then((cache) => {
          console.log("[Service Worker] Attempting to cache external assets");
          return Promise.allSettled(
            EXTERNAL_ASSETS.map((url) =>
              // Remove mode: 'no-cors'
              fetch(url) // Fetch normally
                .then((response) => {
                  // Only cache valid responses
                  if (
                    response &&
                    response.status === 200 &&
                    response.type === "basic"
                  ) {
                    return cache.put(url, response);
                  }
                  console.log(
                    `[Service Worker] Skipping cache for external asset (invalid response): ${url}`
                  );
                  return Promise.resolve(); // Resolve promise even if not cached
                })
                .catch((err) =>
                  console.log(
                    "[Service Worker] Failed to fetch/cache external asset:",
                    url,
                    err
                  )
                )
            )
          );
        });
      })
  );
});
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating Service Worker...");
  clients.claim();
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== CACHE_NAME + "-externals"
          ) {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
self.addEventListener("fetch", (event) => {
  if (
    event.request.method !== "GET" ||
    event.request.url.startsWith("chrome-extension://")
  ) {
    return;
  }
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          return caches.match("/offline.html");
        })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.destination === "document") {
            return caches.match("/offline.html");
          }
        });
      return cachedResponse || fetchPromise;
    })
  );
});
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-assets") {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return Promise.all(
          STATIC_ASSETS.map((url) =>
            fetch(url)
              .then((response) => cache.put(url, response))
              .catch((err) => console.log("[Service Worker] Sync error:", err))
          )
        );
      })
    );
  }
});
console.log("[Service Worker] Service worker loaded successfully");
