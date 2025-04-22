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
	// console.log("[Service Worker] Installing Service Worker...");
	self.skipWaiting();
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				console.log(
					"[Service Worker] Pre-caching static assets individually..."
				);
				const promises = STATIC_ASSETS.map(async (url) => {
					try {
						// Use fetch directly, cache.add handles Request creation
						await cache.add(url);
						// console.log(`[SW] Cached static asset: ${url}`);
						return { status: "fulfilled", url: url };
					} catch (error) {
						console.error(
							`[Service Worker] Failed to cache static asset: ${url}`,
							error
						);
						// Re-throw the error if you want the install to fail completely if any static asset fails
						// throw error;
						// Or return a rejected status to allow install to continue for other assets
						return { status: "rejected", url: url, reason: error };
					}
				});
				// Wait for all fetches/caches to settle
				return Promise.allSettled(promises).then((results) => {
					const failed = results.filter((r) => r.status === "rejected");
					if (failed.length > 0) {
						console.warn(
							`[Service Worker] ${failed.length} static assets failed to cache.`
						);
						// Optional: Throw an error here if *any* static asset failure should prevent SW installation
						// throw new Error("Failed to cache all critical static assets.");
					} else {
						console.log(
							"[Service Worker] All static assets checked/cached successfully."
						);
					}
					// Proceed to caching external assets regardless
				});
			})
			.then(() => {
				return caches.open(CACHE_NAME + "-externals").then((cache) => {
					// console.log("[Service Worker] Attempting to cache external assets");
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
									// Keep this log for debugging invalid responses
									console.log(
										`[Service Worker] Skipping cache for external asset (invalid response): ${url}`
									);
									return Promise.resolve(); // Resolve promise even if not cached
								})
								.catch((err) =>
									// Keep this log for fetch/cache errors
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
		return; // Ignore non-GET requests and browser extension requests
	}

	const requestUrl = new URL(event.request.url);

	// Strategy for external assets (CDNs, etc.) - Network first, fallback to cache, fallback to no-cors fetch for offline
	if (EXTERNAL_ASSETS.includes(requestUrl.href)) {
		event.respondWith(
			caches.open(CACHE_NAME + "-externals").then(async (cache) => {
				try {
					// 1. Try network with CORS first
					const networkResponse = await fetch(event.request);
					// console.log(`[SW] Fetched (CORS) ${requestUrl.href}, Status: ${networkResponse.status}, Type: ${networkResponse.type}`);

					// 1a. If valid CORS response, cache it and return
					if (
						networkResponse &&
						networkResponse.ok &&
						networkResponse.type === "basic"
					) {
						// console.log(`[SW] Caching valid CORS response for: ${requestUrl.href}`);
						cache.put(event.request, networkResponse.clone());
						return networkResponse;
					}
					// 1b. If opaque response, return it but don't cache (let browser handle it)
					else if (networkResponse && networkResponse.type === "opaque") {
						// console.log(`[SW] Serving opaque response from network (not caching): ${requestUrl.href}`);
						return networkResponse;
					}
					// 1c. If other error (404, 500, etc.), log and proceed to cache/fallback
					else {
						console.log(
							`[SW] Invalid CORS response from network for: ${requestUrl.href}, Status: ${networkResponse?.status}`
						);
						// Don't return yet, check cache first in case of temporary server error
						const cachedResponse = await cache.match(event.request);
						if (cachedResponse) {
							// console.log(`[SW] Serving from cache (Network gave ${networkResponse?.status}): ${requestUrl.href}`);
							return cachedResponse;
						}
						// If no cache and network error, return the error response itself
						return networkResponse;
					}
				} catch (corsError) {
					// 2. CORS fetch failed (network error)
					console.log(
						`[SW] CORS fetch failed for: ${requestUrl.href}`,
						corsError
					);

					// 3. Check cache (for previously cached valid or opaque responses)
					const cachedResponse = await cache.match(event.request);
					if (cachedResponse) {
						// console.log(`[SW] Serving from cache (CORS fetch failed): ${requestUrl.href}`);
						return cachedResponse;
					}

					// 4. Cache miss, try network with no-cors as a last resort for offline
					// console.log(`[SW] Cache miss, trying no-cors fetch for offline: ${requestUrl.href}`);
					try {
						// Use a new Request object for no-cors
						const noCorsRequest = new Request(event.request.url, {
							mode: "no-cors",
							credentials: "omit", // Important for no-cors
							redirect: "follow", // Handle redirects if any
						});
						const noCorsResponse = await fetch(noCorsRequest);
						// console.log(`[SW] Fetched (no-cors) ${requestUrl.href}, Type: ${noCorsResponse.type}`);
						// Cache the opaque response for offline use
						// Use the original request (event.request) as the key for future cache lookups
						cache.put(event.request, noCorsResponse.clone());
						return noCorsResponse;
					} catch (noCorsError) {
						console.log(
							`[SW] Both CORS and no-cors fetches failed for: ${requestUrl.href}`,
							noCorsError
						);
						// 5. All fetches failed, no cache - return generic error
						return new Response(
							"Network error: Resource unavailable offline.",
							{
								status: 408, // Request Timeout or 503 Service Unavailable
								headers: { "Content-Type": "text/plain" },
							}
						);
					}
				}
			})
		);
	} else {
		// Strategy for static assets (Cache first, fallback to network)
		event.respondWith(
			caches.match(event.request).then((cachedResponse) => {
				if (cachedResponse) {
					// console.log(`[SW] Serving static from cache: ${event.request.url}`);
					return cachedResponse;
				}
				// console.log(`[SW] Fetching static from network: ${event.request.url}`);
				return fetch(event.request)
					.then((networkResponse) => {
						// Optional: Cache newly fetched static assets if they are in the list and response is ok
						if (
							networkResponse.ok &&
							STATIC_ASSETS.includes(requestUrl.pathname)
						) {
							caches.open(CACHE_NAME).then((cache) => {
								// console.log(`[SW] Caching static asset from network: ${event.request.url}`);
								cache.put(event.request, networkResponse.clone());
							});
						}
						return networkResponse;
					})
					.catch(() => {
						console.log(
							`[SW] Network fetch failed for static asset: ${event.request.url}`
						);
						// Fallback for navigation requests
						if (event.request.mode === "navigate") {
							return caches.match("/offline.html");
						}
						// Return a generic error for other asset types
						return new Response("Static resource unavailable offline.", {
							status: 503, // Service Unavailable
							headers: { "Content-Type": "text/plain" },
						});
					});
			})
		);
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
