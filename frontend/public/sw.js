// Service Worker for SEO and Performance Optimization
const CACHE_NAME = 'marketmind-v1.1';
const API_CACHE = 'marketmind-api-v1.1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  // Add other static assets as needed
];

// API endpoints to cache for SEO
const CACHEABLE_API_ROUTES = [
  '/api/blogs',
  '/api/tools', 
  '/api/sitemap.xml',
  '/api/robots.txt'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Cache API responses for SEO
  if (url.pathname.startsWith('/api/')) {
    // Check if it's a cacheable route
    const isCacheable = CACHEABLE_API_ROUTES.some(route => url.pathname.includes(route));
    
    if (isCacheable) {
      event.respondWith(
        caches.open(API_CACHE).then(async (cache) => {
          // Try cache first
          const cachedResponse = await cache.match(event.request);
          
          if (cachedResponse) {
            // Return cached version and update in background
            fetch(event.request)
              .then(response => {
                if (response.ok) {
                  cache.put(event.request, response.clone());
                }
              })
              .catch(() => {
                // Ignore network errors in background update
              });
            
            return cachedResponse;
          }
          
          // Fetch from network and cache
          try {
            const response = await fetch(event.request);
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          } catch (error) {
            // Return a basic fallback for SEO endpoints
            if (url.pathname.includes('sitemap.xml')) {
              return new Response(
                '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
                { headers: { 'Content-Type': 'application/xml' } }
              );
            }
            throw error;
          }
        })
      );
      return;
    }
  }
  
  // Regular caching strategy for static assets
  if (event.request.destination === 'document') {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
    return;
  }
  
  // Cache first strategy for static assets
  if (event.request.destination === 'image' || 
      event.request.destination === 'script' || 
      event.request.destination === 'style') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        const response = await fetch(event.request);
        if (response.ok) {
          cache.put(event.request, response.clone());
        }
        return response;
      })
    );
    return;
  }
});