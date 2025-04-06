/**
 * Portfolio Website Service Worker
 * Provides offline capabilities and performance optimizations through caching
 */

// Cache name with version for better cache management
const CACHE_NAME = 'portfolio-cache-v1';

// Assets to cache immediately on service worker installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/about.html',
  '/certification.html',
  '/jobs.html',
  '/projects.html',
  '/skills.html',
  '/copyright.html',
  '/offline.html',
  '/SCSS/main.css',
  '/Js/main.js',
  '/Js/performance.js',
  '/Images/Header.jpg',
  '/Images/Header_Phone.jpg'
];

// Install event - cache critical assets
self.addEventListener('install', event => {
  console.log('Service Worker installing');
  
  // Skip waiting to ensure the new service worker activates immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching critical assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .catch(error => {
        console.error('Pre-caching failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating');
  
  // Claim clients to ensure the service worker takes control immediately
  event.waitUntil(self.clients.claim());
  
  // Remove old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('portfolio-cache-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Service Worker: Removing old cache', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Fetch event - serve from cache or network with dynamic caching
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Handle HTML navigation requests with network-first strategy
  if (event.request.mode === 'navigate' || 
      (event.request.method === 'GET' && 
       event.request.headers.get('accept').includes('text/html'))) {
    
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If we got a valid response, clone it and cache it
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline, try to serve from cache
          return caches.match(event.request)
            .then(cachedResponse => {
              // Return cached response or fallback to offline page
              return cachedResponse || caches.match('/offline.html');
            });
        })
    );
    return;
  }
  
  // For CSS, JS, images, etc. use a cache-first strategy
  if (event.request.destination === 'style' || 
      event.request.destination === 'script' || 
      event.request.destination === 'image' || 
      event.request.destination === 'font') {
    
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          // Return cached response if available
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Otherwise fetch from network and cache
          return fetch(event.request)
            .then(response => {
              // Make sure we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              // Clone the response as it can only be consumed once
              const responseToCache = response.clone();
              
              // Cache the fetched resource
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              
              return response;
            });
        })
    );
    return;
  }
  
  // For other requests, use a network-first approach
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Listen for push notifications
self.addEventListener('push', event => {
  let notification = {
    title: 'Portfolio Update',
    body: 'New content has been added to the portfolio!',
    icon: '/Images/logo.png',
    badge: '/Images/badge.png',
    data: {
      url: self.location.origin
    }
  };
  
  // Use notification data if available
  if (event.data) {
    try {
      notification = { ...notification, ...JSON.parse(event.data.text()) };
    } catch (e) {
      console.error('Could not parse push notification data:', e);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notification.title, {
      body: notification.body,
      icon: notification.icon,
      badge: notification.badge,
      data: notification.data
    })
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  // Open the target URL when notification is clicked
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Background sync for offline form submissions (if applicable)
self.addEventListener('sync', event => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForm());
  }
});

// Helper function to sync contact form data
function syncContactForm() {
  return fetch('/api/sync-contact-forms')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to sync contact forms');
      }
      return response;
    })
    .catch(error => {
      console.error('Background sync error:', error);
    });
}

console.log('Service worker loaded successfully');