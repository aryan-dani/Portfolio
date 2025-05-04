

// Use a static cache name. Updates rely on Network-First strategy
// and the browser detecting changes to this service-worker.js file.
const CACHE_NAME = "portfolio-cache";

// List all assets you want to pre-cache
const PRECACHE_URLS = [
	"./",
	"index.html",
	"skills.html",
	"about.html",
	"projects.html",
	"experience.html",
	"certification.html",
	"copyright.html",
	"offline.html",
	"SCSS/main.css",
	"Js/main.js",
	"Js/card-3d-effect.js",
	"Js/certification.js",
	"Js/custom-cursor.js",
	"Js/performance.js",
	"Js/skills.js",
	"Images/Profile photo.jpg",
	"Images/Header.jpg",
	"Images/Header_Phone.jpg",
	"favicons/favicon.ico",
	"https://kit.fontawesome.com/1267cf2b7d.js",
	"https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js",
	"https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
];

self.addEventListener("install", (evt) => {
	self.skipWaiting(); // Force activation
	evt.waitUntil(
		caches
			.open(CACHE_NAME)
			.then((cache) => {
				console.log("Opened cache:", CACHE_NAME);
				// Add all URLs, but don't fail install if one external URL fails
				// Use addAll for essential local assets, add individually for external
				const essentialAssets = PRECACHE_URLS.filter(url => !url.startsWith('http'));
				const externalAssets = PRECACHE_URLS.filter(url => url.startsWith('http'));

				const cacheEssential = cache.addAll(essentialAssets);
				const cacheExternal = Promise.all(
					externalAssets.map(url => cache.add(url).catch(err => console.warn(`Failed to cache external asset: ${url}`, err)))
				);

				return Promise.all([cacheEssential, cacheExternal]);
			})
			.catch((err) =>
				console.error("Failed to cache resources during install:", err)
			)
	);
});

self.addEventListener("activate", (evt) => {
	console.log("Service worker activating...");
	evt.waitUntil(
		caches
			.keys()
			.then((keys) => {
				// Delete ALL caches that don't match the current static CACHE_NAME
				// This cleans up old versioned caches if they exist.
				return Promise.all(
					keys.map((key) => {
						if (key !== CACHE_NAME) {
							console.log("Deleting old cache:", key);
							return caches.delete(key);
						}
						return Promise.resolve();
					})
				);
			})
			.then(() => {
				console.log("Old caches deleted.");
				return self.clients.claim(); // Take control immediately
			})
			.catch((err) => console.error("Failed to activate service worker:", err))
	);
});

// Fetch logic remains the same (Network-first for dynamic, Cache-first for static)
self.addEventListener("fetch", (evt) => {
	// Network-first for CSS/JS/External Scripts, fallback to cache
	if (
		evt.request.url.match(/(\.css|\.js)$/i) ||
		evt.request.destination === "style" ||
		evt.request.destination === "script" ||
		evt.request.url.startsWith('https://kit.fontawesome.com') ||
		evt.request.url.startsWith('https://cdn.jsdelivr.net')
	) {
		evt.respondWith(
			fetch(evt.request)
				.then((res) => {
					// Check if response is valid before caching
					if (!res || res.status !== 200 || (res.type !== 'basic' && res.type !== 'cors')) {
						// Don't log warnings for external resources failing, could be CORS or temporary issues
						if (!evt.request.url.startsWith('http')) {
							console.warn('Fetch returned invalid response for:', evt.request.url, res?.status);
						}
						return res;
					}
					const resClone = res.clone();
					caches
						.open(CACHE_NAME)
						.then((cache) => cache.put(evt.request, resClone))
						.catch((err) =>
							console.warn("Failed to update cache for:", evt.request.url, err) // Use warn
						);
					return res;
				})
				.catch(() => {
					console.log(
						"Network request failed, serving from cache:",
						evt.request.url
					);
					return caches.match(evt.request).then((cachedResponse) => {
						return cachedResponse; // Return cached or undefined
					});
				})
		);
	} else if (evt.request.destination === "document") {
		// Network-first for HTML documents, fallback to cache, then offline page
		evt.respondWith(
			fetch(evt.request)
				.then((res) => {
					if (!res || res.status !== 200 || res.type !== 'basic') {
						console.warn('Fetch returned invalid response for HTML:', evt.request.url, res?.status);
						return res;
					}
					const resClone = res.clone();
					caches
						.open(CACHE_NAME)
						.then((cache) => cache.put(evt.request, resClone))
						.catch((err) =>
							console.warn("Failed to cache HTML:", evt.request.url, err)
						);
					return res;
				})
				.catch(() => {
					console.log(
						"Network request failed for HTML, serving from cache or offline:",
						evt.request.url
					);
					return caches.match(evt.request).then((cachedResponse) => {
						return cachedResponse || caches.match("offline.html"); // Fallback to offline page
					});
				})
		);
	} else {
		// Cache-first for other assets (images, fonts, etc.)
		evt.respondWith(
			caches.match(evt.request).then((cachedResponse) => {
				return cachedResponse || fetch(evt.request).then((networkResponse) => {
					if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
						if (!evt.request.url.startsWith('http')) { // Only warn for local assets
							console.warn('Fetch returned invalid response for other asset:', evt.request.url, networkResponse?.status);
						}
						return networkResponse;
					}
					const responseClone = networkResponse.clone();
					caches
						.open(CACHE_NAME)
						.then((cache) => cache.put(evt.request, responseClone))
						.catch((err) =>
							console.warn("Failed to cache other asset:", evt.request.url, err)
						);
					return networkResponse;
				}).catch(() => {
					console.log(
						"Failed to fetch other asset from network and cache:",
						evt.request.url
					);
					// Let the browser handle the failure
				});
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

console.log("[Service Worker] Service worker loaded successfully.");
