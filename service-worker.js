/** @format */

const CACHE_NAME = "portfolio-cache-v5"; // Increment cache version
const STATIC_ASSETS = [
	"/",
	"/index.html",
	"/about.html",
	"/experience.html",
	"/projects.html",
	"/skills.html",
	"/certification.html",
	"/copyright.html",
	"/offline.html",
	"/manifest.json",
	"/SCSS/main.css",
	"/Js/main.js",
	"/Js/performance.js",
	"/Js/card-3d-effect.js",
	"/Js/custom-cursor.js",
	"/Js/skills.js",
	"/Js/certification.js",
	"/Images/Header.jpg",
	"/Images/Header_Phone.jpg",
	"/Images/Profile photo.jpg", // Added profile photo
];
const EXTERNAL_ASSETS = [
	"https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js",
	"https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js",
	"https://kit.fontawesome.com/1267cf2b7d.js",
	"https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
	"https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
	"https://fonts.googleapis.com/icon?family=Material+Icons",
];

self.addEventListener("install", (event) => {
	self.skipWaiting(); // Keep this to activate new SW faster
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
	clients.claim(); // Ensure the new SW controls clients immediately
	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					// Delete caches that are not the current static or external cache
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
		return; // Ignore non-GET requests and browser extensions
	}

	const requestUrl = new URL(event.request.url);
	const isExternal = EXTERNAL_ASSETS.includes(requestUrl.href);
	const cacheToUse = isExternal ? CACHE_NAME + "-externals" : CACHE_NAME;

	// Strategy: Network first for HTML, Cache first for others
	if (event.request.mode === "navigate") {
		// Network first for HTML navigation requests
		event.respondWith(
			fetch(event.request)
				.then((networkResponse) => {
					// Check if we got a valid response
					if (networkResponse && networkResponse.ok) {
						// Cache the fetched HTML page
						const responseClone = networkResponse.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(event.request, responseClone);
						});
						return networkResponse;
					}
					// If network fails, try cache
					return caches.match(event.request).then((cachedResponse) => {
						return cachedResponse || caches.match("/offline.html"); // Fallback to offline page
					});
				})
				.catch(() => {
					// Network totally failed (offline), try cache
					return caches.match(event.request).then((cachedResponse) => {
						return cachedResponse || caches.match("/offline.html"); // Fallback to offline page
					});
				})
		);
	} else {
		// Cache first for static assets (CSS, JS, Images, Fonts, etc.)
		event.respondWith(
			caches.open(cacheToUse).then(async (cache) => {
				// 1. Try cache first
				const cachedResponse = await cache.match(event.request);
				if (cachedResponse) {
					// console.log(`[SW] Serving from Cache: ${requestUrl.href}`);
					return cachedResponse;
				}

				// 2. If not in cache, try network
				// console.log(`[SW] Not in cache, fetching from Network: ${requestUrl.href}`);
				try {
					const networkResponse = await fetch(event.request);
					// 3. If fetch is successful, cache it and return
					if (
						networkResponse &&
						(networkResponse.ok || networkResponse.type === "opaque")
					) {
						// console.log(`[SW] Caching network response: ${requestUrl.href}`);
						const responseClone = networkResponse.clone();
						cache.put(event.request, responseClone);
						return networkResponse;
					}
					// Handle network errors (like 404) gracefully for assets - don't cache error responses
					console.warn(
						`[SW] Network request for asset failed with status ${networkResponse?.status}: ${requestUrl.href}`
					);
					// Return the error response directly without caching
					return (
						networkResponse || new Response("Asset not found", { status: 404 })
					);
				} catch (error) {
					// 4. Network fetch failed completely (offline)
					console.error(
						`[SW] Network fetch failed for asset: ${requestUrl.href}`,
						error
					);
					// For assets, we might not need a specific fallback beyond a standard error
					return new Response(
						"Network error: Resource not available offline.",
						{
							status: 408, // Request Timeout
							headers: { "Content-Type": "text/plain" },
						}
					);
				}
			})
		);
	}
});

// Listener to handle the SKIP_WAITING message from the client
self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}
});

console.log("[Service Worker] Service worker loaded successfully (v4)");
