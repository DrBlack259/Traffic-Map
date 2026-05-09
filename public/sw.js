const TILE_CACHE = 'map-tiles-v1'
const API_CACHE = 'map-api-v1'
const TILE_MAX = 500
const API_MAX = 100

// Tile URL patterns to cache
const TILE_ORIGINS = [
  'tile.openstreetmap.org',
  'tiles.stadiamaps.com',
  'server.arcgisonline.com',
  'api.tomtom.com',
]

self.addEventListener('install', (e) => {
  e.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  const isTile = TILE_ORIGINS.some((o) => url.hostname.includes(o))
  const isApiSearch = url.pathname.startsWith('/api/search') || url.pathname.startsWith('/api/reverse')

  if (isTile) {
    e.respondWith(tileFirst(e.request))
    return
  }

  if (isApiSearch && e.request.method === 'GET') {
    e.respondWith(networkFirst(e.request, API_CACHE, API_MAX))
    return
  }
})

async function tileFirst(request) {
  const cache = await caches.open(TILE_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      await trimCache(cache, TILE_MAX)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('', { status: 503 })
  }
}

async function networkFirst(request, cacheName, max) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response.ok) {
      await trimCache(cache, max)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    return cached ?? new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function trimCache(cache, max) {
  const keys = await cache.keys()
  if (keys.length >= max) {
    await cache.delete(keys[0])
  }
}
