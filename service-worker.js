/**
 * Enhanced Service Worker for Portfolio Website
 * Provides offline capabilities and performance optimizations through caching
 *
 * @format
 */

// Versioned cache names for better cache management
const CACHE_NAME = "portfolio-cache-v2";
const STATIC_ASSETS = [
	"/",
	"/index.html",
	"/about.html",
	"/jobs.html",
	"/projects.html",
	"/skills.html",
	"/certification.html",
	"/offline.html", // Dedicated offline page
	"/Js/main.js",
	"/Js/performance.js",
	"/Js/resource-hints.js", // Added new resource hints file
	"/SCSS/main.css",
	"/Images/Header.jpg",
	"/Images/Header_Phone.jpg",
];

// Font Awesome and other external resources to cache
const EXTERNAL_ASSETS = [
	"https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js",
	"https://cdnjs.cloudflare.com/ajax/libs/vanilla-tilt/1.8.0/vanilla-tilt.min.js",
	"https://kit.fontawesome.com/1267cf2b7d.js",
	"https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
];

// Install event - cache all static assets
self.addEventListener("install", (event) => {
	console.log("[Service Worker] Installing Service Worker...");

	// Skip waiting to ensure the new service worker activates immediately
	self.skipWaiting();

	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				console.log("[Service Worker] Pre-caching static assets");
				return cache.addAll(STATIC_ASSETS);
			})
			.then(() => {
				// Cache external assets separately (might fail, but we don't want to block installation)
				return caches.open(CACHE_NAME + "-externals").then((cache) => {
					console.log("[Service Worker] Attempting to cache external assets");
					// We use Promise.allSettled to continue even if some external resources fail to cache
					return Promise.allSettled(
						EXTERNAL_ASSETS.map((url) =>
							fetch(url, { mode: "no-cors" }) // no-cors for cross-origin resources
								.then((response) => cache.put(url, response))
								.catch((err) =>
									console.log(
										"[Service Worker] Failed to cache external asset:",
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

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
	console.log("[Service Worker] Activating Service Worker...");

	// Take control of uncontrolled clients
	clients.claim();

	event.waitUntil(
		caches.keys().then((cacheNames) => {
			return Promise.all(
				cacheNames.map((cacheName) => {
					// Delete old version caches but keep current version
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

// Fetch event - serve from cache, fall back to network, cache new requests
self.addEventListener("fetch", (event) => {
	// Skip non-GET requests and browser extension requests
	if (
		event.request.method !== "GET" ||
		event.request.url.startsWith("chrome-extension://")
	) {
		return;
	}

	// Skip cross-origin font requests (will be handled separately)
	if (
		event.request.url.includes("fonts.googleapis.com") ||
		event.request.url.includes("fonts.gstatic.com")
	) {
		return;
	}

	// Handle the fetch event with the stale-while-revalidate strategy
	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			// Return cached response immediately if available
			if (cachedResponse) {
				// Background fetch to update cache for next time
				const fetchPromise = fetch(event.request)
					.then((networkResponse) => {
						// Only cache successful responses (not 404s etc.)
						if (networkResponse && networkResponse.status === 200) {
							const cacheName =
								event.request.url.includes("http") &&
								!event.request.url.includes(self.location.origin)
									? CACHE_NAME + "-externals" // External resources
									: CACHE_NAME; // Local resources

							caches
								.open(cacheName)
								.then((cache) =>
									cache.put(event.request, networkResponse.clone())
								)
								.catch((err) =>
									console.log("[Service Worker] Error updating cache:", err)
								);
						}
						return networkResponse;
					})
					.catch((err) => {
						console.log("[Service Worker] Network request failed:", err);
						// Network failed, but we already returned the cached response
					});

				return cachedResponse;
			}

			// Nothing in cache, fetch from network
			return fetch(event.request)
				.then((response) => {
					// Return the response
					if (!response || response.status !== 200) {
						console.log(
							"[Service Worker] Non-200 response for:",
							event.request.url
						);

						// For HTML pages, return the offline page if it's a navigation request
						const url = new URL(event.request.url);
						if (
							event.request.headers.get("Accept").includes("text/html") &&
							url.origin === self.location.origin
						) {
							return caches.match("/offline.html");
						}

						return response;
					}

					// Clone response before using it to cache
					const responseToCache = response.clone();

					// Cache successful responses (in background)
					caches
						.open(CACHE_NAME)
						.then((cache) => {
							cache.put(event.request, responseToCache);
						})
						.catch((err) => {
							console.log("[Service Worker] Error caching new resource:", err);
						});

					return response;
				})
				.catch((err) => {
					console.log("[Service Worker] Fetch failed:", err);

					// Network failed, return offline page for navigation requests
					if (event.request.headers.get("Accept").includes("text/html")) {
						return caches.match("/offline.html");
					}

					// For other assets, just return an error
					return new Response("Network error occurred", {
						status: 503,
						headers: { "Content-Type": "text/plain" },
					});
				});
		})
	);
});

// Listen for messages from the client
self.addEventListener("message", (event) => {
	// Check for skip waiting message
	if (event.data && event.data.action === "skipWaiting") {
		self.skipWaiting();
	}
});

// Optional: periodically sync and update assets when online
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
