// Service Worker for caching and offline support
const CACHE_NAME = 'project-tracker-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    // Add other static assets as needed
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Install event');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch((error) => {
                console.error('[SW] Failed to cache static assets:', error);
            })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activate event');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE)
                    .map((cacheName) => {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        })
    );
    self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Skip API requests - let them fail gracefully
    if (event.request.url.includes('/api/') || event.request.url.includes('/auth/')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version if found
                if (response) {
                    return response;
                }

                // Otherwise fetch from network
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response.ok) {
                            return response;
                        }

                        // Cache successful responses
                        const responseClone = response.clone();
                        caches.open(DYNAMIC_CACHE)
                            .then((cache) => {
                                cache.put(event.request, responseClone);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.log('[SW] Fetch failed, serving offline page if available');
                        // Could serve an offline page here
                        throw error;
                    });
            })
    );
});

// Background sync for offline actions (if supported)
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync event:', event.tag);

    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Handle offline actions that need to be synced
            console.log('[SW] Performing background sync')
        );
    }
});

// Push notifications (if implemented later)
self.addEventListener('push', (event) => {
    console.log('[SW] Push event received');

    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/vite.svg',
            badge: '/vite.svg',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: data.primaryKey
            }
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click received');

    event.notification.close();

    event.waitUntil(
        // eslint-disable-next-line no-undef
        clients.openWindow('/')
    );
});