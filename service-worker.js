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

	// Handle navigation requests (HTML pages)
	if (event.request.mode === "navigate") {
		event.respondWith(
			fetch(event.request)
				.then((response) => {
					// Optionally, cache the page for offline use
					const responseClone = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, responseClone);
					});
					return response;
				})
				.catch(() => {
					// If offline, serve the offline page from cache
					return caches.match("/offline.html");
				})
		);
		return;
	}

	// Stale-while-revalidate for static assets
	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			const fetchPromise = fetch(event.request)
				.then((networkResponse) => {
					// Update cache in the background
					if (networkResponse && networkResponse.status === 200) {
						const responseClone = networkResponse.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(event.request, responseClone);
						});
					}
					return networkResponse;
				})
				.catch(() => {
					// If network fails and no cache, fallback to offline page for HTML, else nothing
					if (event.request.destination === "document") {
						return caches.match("/offline.html");
					}
				});
			// Return cached response immediately, update in background
			return cachedResponse || fetchPromise;
		})
	);
});

// Listen for skipWaiting message to activate new SW immediately
self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
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
