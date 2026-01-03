// Enhanced Service Worker for MarketMindAI - Production Optimized
const CACHE_NAME = 'marketmindai-v2.0.0';
const API_CACHE = 'marketmindai-api-v2.0.0';
const RUNTIME_CACHE = 'marketmindai-runtime-v2.0.0';

// Critical assets to cache immediately (will be updated during build)
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/static/css/main.740466d8.css",
  "/static/js/main.6d9d9fd0.js"
];

// API endpoints to cache for SEO and performance
const CACHEABLE_API_ROUTES = [
  '/api/blogs',
  '/api/tools', 
  '/api/sitemap.xml',
  '/api/robots.txt',
  '/api/categories'
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching critical assets');
      return cache.addAll(STATIC_ASSETS.filter(asset => asset !== '/'));
    }).catch(error => {
      console.log('[SW] Cache installation failed:', error);
    })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== API_CACHE && 
              cacheName !== RUNTIME_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  // API Routes - Cache First with Background Update
  if (url.pathname.startsWith('/api/')) {
    const isCacheable = CACHEABLE_API_ROUTES.some(route => 
      url.pathname.includes(route.replace('/api', ''))
    );
    
    if (isCacheable) {
      event.respondWith(
        caches.open(API_CACHE).then(async (cache) => {
          try {
            // Try cache first
            const cachedResponse = await cache.match(event.request);
            
            if (cachedResponse) {
              // Return cached version immediately
              // Update in background
              fetch(event.request)
                .then(response => {
                  if (response.ok && response.status === 200) {
                    cache.put(event.request, response.clone());
                  }
                })
                .catch(() => {
                  // Silently fail background updates
                });
              
              return cachedResponse;
            }
            
            // Fetch from network and cache
            const response = await fetch(event.request);
            if (response.ok && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
            
          } catch (error) {
            console.log('[SW] API fetch failed:', error);
            
            // Return fallback for critical SEO endpoints
            if (url.pathname.includes('sitemap.xml')) {
              return new Response(
                '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://marketmindai.com/</loc></url></urlset>',
                { 
                  headers: { 
                    'Content-Type': 'application/xml',
                    'Cache-Control': 'max-age=300'
                  } 
                }
              );
            }
            
            if (url.pathname.includes('robots.txt')) {
              return new Response(
                'User-agent: *\nAllow: /\nSitemap: https://marketmindai.com/sitemap.xml',
                { 
                  headers: { 
                    'Content-Type': 'text/plain',
                    'Cache-Control': 'max-age=86400'
                  } 
                }
              );
            }
            
            throw error;
          }
        })
      );
      return;
    }
  }

  // Static Assets - Cache First Strategy
  if (event.request.destination === 'script' || 
      event.request.destination === 'style' ||
      event.request.destination === 'font') {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        try {
          const response = await fetch(event.request);
          if (response.ok && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch (error) {
          console.log('[SW] Static asset fetch failed:', error);
          throw error;
        }
      })
    );
    return;
  }

  // Images - Cache First with longer TTL
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        try {
          const response = await fetch(event.request);
          if (response.ok && response.status === 200) {
            cache.put(event.request, response.clone());
          }
          return response;
        } catch (error) {
          console.log('[SW] Image fetch failed:', error);
          // Return placeholder or throw error
          throw error;
        }
      })
    );
    return;
  }

  // Navigation requests - Network First with Cache Fallback
  if (event.request.mode === 'navigate' || 
      event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful navigation responses
          if (response.ok && response.status === 200) {
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, response.clone());
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cached version or offline page
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return cached homepage as fallback
              return caches.match('/');
            });
        })
    );
    return;
  }

  // Default: Network First
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('[SW] Background sync triggered');
    event.waitUntil(
      // Refresh critical caches
      caches.open(API_CACHE).then(cache => {
        return Promise.all(
          CACHEABLE_API_ROUTES.map(route => {
            return fetch(`https://marketmindai.com${route}`)
              .then(response => {
                if (response.ok) {
                  return cache.put(route, response);
                }
              })
              .catch(() => {
                // Ignore errors during background sync
              });
          })
        );
      })
    );
  }
});

// Push notifications (if needed later)
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  // Handle push notifications if implemented
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('[SW] Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('[SW] Unhandled promise rejection:', event.reason);
});

console.log('[SW] MarketMindAI Service Worker loaded');