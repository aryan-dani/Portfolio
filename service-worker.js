/**
 * Portfolio Website Service Worker
 * Provides offline capabilities and performance optimizations through caching
 */

// Cache name with version for better cache management
const CACHE_NAME = 'portfolio-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/jobs.html',
  '/projects.html',
  '/skills.html',
  '/certification.html',
  '/about.html',
  '/copyright.html',
  '/offline.html',
  '/SCSS/main.css',
  '/Js/main.js',
  '/Js/performance.js',
  '/Images/Header.jpg',
  '/Images/Header_Phone.jpg'
];

// Install event - cache essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim clients immediately
  self.clients.claim();
});

// Fetch event - network-first strategy with fallback to cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone the response
        const responseToCache = response.clone();
        
        // Update cache
        caches.open(CACHE_NAME)
          .then(cache => {
            if (event.request.method === 'GET') {
              cache.put(event.request, responseToCache);
            }
          });
        
        return response;
      })
      .catch(() => {
        // Return from cache if network fails
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            
            // If the request is for a page, return the offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html');
            }
          });
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