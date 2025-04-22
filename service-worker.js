/** @format */

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
	self.skipWaiting();
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				// console.log("[Service Worker] Pre-caching static assets...");
				// Cache static assets
				const staticPromises = STATIC_ASSETS.map((url) => {
					return cache.add(url).catch((err) => {
						console.error(`[SW] Failed to cache static asset: ${url}`, err);
						return Promise.resolve(); // Don't fail install for one asset
					});
				});
				return Promise.all(staticPromises);
			})
			.then(() => {
				// Open a separate cache for potentially opaque external assets
				return caches.open(CACHE_NAME + "-externals").then((cache) => {
					// console.log("[Service Worker] Attempting to cache external assets");
					const externalPromises = EXTERNAL_ASSETS.map((url) => {
						// Fetch with default mode (CORS)
						return fetch(url)
							.then((response) => {
								// Cache valid basic responses OR opaque responses
								if (response && (response.ok || response.type === "opaque")) {
									// console.log(`[SW] Caching external asset (Install): ${url}, Type: ${response.type}`);
									return cache.put(url, response);
								} else {
									console.warn(
										`[SW] Skipping cache for external asset (Install - Invalid Response ${response?.status}): ${url}`
									);
								}
								return Promise.resolve();
							})
							.catch((err) => {
								console.error(
									`[SW] Failed to fetch/cache external asset (Install): ${url}`,
									err
								);
								return Promise.resolve(); // Don't fail install for one external asset
							});
					});
					return Promise.all(externalPromises);
				});
			})
	);
});

self.addEventListener("activate", (event) => {
	// console.log("[Service Worker] Activating Service Worker...");
	clients.claim();
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					if (
						cacheName !== CACHE_NAME &&
						cacheName !== CACHE_NAME + "-externals"
					) {
						// console.log("[Service Worker] Deleting old cache:", cacheName);
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

	const requestUrl = new URL(event.request.url);
	const isExternal = EXTERNAL_ASSETS.includes(requestUrl.href);
	const cacheToUse = isExternal ? CACHE_NAME + "-externals" : CACHE_NAME;

	// Network first, falling back to cache for all GET requests
	event.respondWith(
		caches.open(cacheToUse).then(async (cache) => {
			try {
				// 1. Try network first
				const networkResponse = await fetch(event.request);
				// console.log(`[SW] Fetched from Network: ${requestUrl.href}, Status: ${networkResponse.status}, Type: ${networkResponse.type}`);

				// 2. If successful (basic or opaque), cache it and return
				if (
					networkResponse &&
					(networkResponse.ok || networkResponse.type === "opaque")
				) {
					// console.log(`[SW] Caching network response: ${requestUrl.href}, Type: ${networkResponse.type}`);
					// Use event.request as key, networkResponse.clone() as value
					cache.put(event.request, networkResponse.clone());
					return networkResponse;
				}
				// 3. If network failed but gave a specific error response (e.g., 404, 500)
				// Check cache first before returning the error response
				else if (networkResponse && !networkResponse.ok) {
					console.warn(
						`[SW] Network request failed with status ${networkResponse.status} for: ${requestUrl.href}`
					);
					const cachedResponse = await cache.match(event.request);
					if (cachedResponse) {
						// console.log(`[SW] Serving from cache (Network Error ${networkResponse.status}): ${requestUrl.href}`);
						return cachedResponse;
					}
					// If not in cache, return the network error response
					return networkResponse;
				}

				// This part should ideally not be reached if fetch succeeded or failed with a response
				// But as a fallback, check cache if networkResponse was somehow undefined
				const cachedResponse = await cache.match(event.request);
				if (cachedResponse) {
					// console.log(`[SW] Serving from cache (Network response undefined?): ${requestUrl.href}`);
					return cachedResponse;
				}

				// Should not happen with the logic above, but safety net
				return networkResponse; // Return whatever networkResponse was
			} catch (error) {
				// 4. Network fetch failed completely (e.g., offline)
				console.log(`[SW] Network fetch failed for: ${requestUrl.href}`, error);
				const cachedResponse = await cache.match(event.request);
				if (cachedResponse) {
					// console.log(`[SW] Serving from cache (Network fetch failed): ${requestUrl.href}`);
					return cachedResponse;
				}

				// 5. Cache miss and network failure - Fallback for HTML pages
				if (
					event.request.mode === "navigate" &&
					event.request.headers.get("accept").includes("text/html")
				) {
					console.log("[SW] Serving offline fallback page.");
					// Use the main cache for the offline page
					return caches
						.open(CACHE_NAME)
						.then((mainCache) => mainCache.match("/offline.html"));
				}

				// 6. For non-HTML assets, return a generic error response if not cached and network failed
				return new Response("Network error: Resource not available offline.", {
					status: 408, // Request Timeout
					headers: { "Content-Type": "text/plain" },
				});
			}
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
