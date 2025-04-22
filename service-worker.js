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
		return; // Ignore non-GET requests and browser extension requests
	}

	const requestUrl = new URL(event.request.url);

	// Strategy for external assets (CDNs, etc.)
	if (EXTERNAL_ASSETS.includes(requestUrl.href)) {
		event.respondWith(
			caches.open(CACHE_NAME + "-externals").then((cache) => {
				return cache.match(event.request).then((cachedResponse) => {
					// Attempt to fetch from network first (network-first strategy for external assets)
					const fetchPromise = fetch(event.request)
						.then((networkResponse) => {
							// Check if the response is valid before caching
							if (
								networkResponse &&
								networkResponse.status === 200 &&
								networkResponse.type === "basic" // Ensure it's a valid CORS response
							) {
								// Cache the valid response
								cache.put(event.request, networkResponse.clone());
							} else if (networkResponse && networkResponse.type === "opaque") {
								// Don't cache opaque responses, but still return them to the browser
								console.log(
									`[Service Worker] Serving opaque response from network for: ${requestUrl.href}`
								);
							} else {
								console.log(
									`[Service Worker] Network fetch failed or invalid response for: ${requestUrl.href}, Status: ${networkResponse?.status}`
								);
							}
							return networkResponse; // Return the network response (even if opaque or error)
						})
						.catch((error) => {
							console.log(
								`[Service Worker] Network fetch failed for external asset: ${requestUrl.href}`,
								error
							);
							// If network fails, try to return the cached response (if it exists and is not opaque)
							if (cachedResponse && cachedResponse.type !== "opaque") {
								console.log(
									`[Service Worker] Serving from cache (network failed): ${requestUrl.href}`
								);
								return cachedResponse;
							}
							// If network fails and no valid cache, return the error (or a fallback if desired)
							console.log(
								`[Service Worker] No valid cache and network failed for: ${requestUrl.href}`
							);
							// Return the original error response or potentially a custom offline response
							// For simplicity, re-throwing might let the browser handle it, or return a generic error response
							// return new Response("Network error", { status: 500, statusText: "Network error" });
							throw error; // Re-throw the error to indicate failure
						});

					// Return network response preferentially, fallback to cache only if network fails AND cache is valid
					return fetchPromise;
				});
			})
		);
	}
	// Strategy for navigation requests (HTML pages) - Network falling back to cache, then offline page
	else if (event.request.mode === "navigate") {
		event.respondWith(
			fetch(event.request)
				.then((response) => {
					// If fetch is successful, cache the response for static assets if needed (optional)
					// For navigation, usually we don't cache aggressively unless it's part of STATIC_ASSETS
					return response;
				})
				.catch(() => {
					// If network fails, try the cache
					return caches.match(event.request).then((cachedResponse) => {
						// If found in cache, return it
						if (cachedResponse) {
							return cachedResponse;
						}
						// If not in cache, return the offline fallback page
						return caches.match("/offline.html");
					});
				})
		);
	}
	// Strategy for static assets (Cache-first, falling back to network)
	else if (STATIC_ASSETS.includes(requestUrl.pathname)) {
		event.respondWith(
			caches.match(event.request).then((cachedResponse) => {
				// Return cached response if found
				if (cachedResponse) {
					return cachedResponse;
				}
				// Otherwise, fetch from network, cache it, and return response
				return fetch(event.request)
					.then((networkResponse) => {
						// Optional: Cache the newly fetched static asset
						// Be careful caching everything, ensure it's intended
						// if (networkResponse && networkResponse.status === 200) {
						//   caches.open(CACHE_NAME).then(cache => {
						//     cache.put(event.request, networkResponse.clone());
						//   });
						// }
						return networkResponse;
					})
					.catch(() => {
						// If network fails for a static asset after cache miss, maybe return offline or error
						console.log(
							`[Service Worker] Network failed for static asset after cache miss: ${requestUrl.pathname}`
						);
						// Optionally return offline page or generic error
						// return caches.match('/offline.html');
						// Or just let the browser handle the failure
					});
			})
		);
	}
	// Default: Let the browser handle the fetch (for assets not managed by the SW)
	else {
		// console.log(`[Service Worker] Letting browser handle fetch for: ${event.request.url}`);
		return;
	}
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
