interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class TTLCache<T> {
  private store = new Map<string, CacheEntry<T>>()
  private maxSize: number

  constructor(maxSize = 500) {
    this.maxSize = maxSize
  }

  get(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key)
      return null
    }
    return entry.value
  }

  set(key: string, value: T, ttlSeconds: number) {
    if (this.store.size >= this.maxSize) {
      // Evict oldest entry
      const firstKey = this.store.keys().next().value
      if (firstKey) this.store.delete(firstKey)
    }
    this.store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }
}

// Shared caches (per server instance — swap for Redis in production)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const routeCache   = new TTLCache<any>(200)   // 200 routes, 5 min TTL
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const searchCache  = new TTLCache<any>(1000)  // 1000 queries, 30s TTL
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const reverseCache = new TTLCache<any>(2000)  // 2000 coordinates, 10 min TTL
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const placesCache  = new TTLCache<any>(300)   // 300 POI queries, 5 min TTL

// Live location sharing store (in-memory; swap for Redis/KV in production)
export const shareStore = new TTLCache<{
  lat: number; lon: number; name: string
  speed?: number; heading?: number; updatedAt: number
}>(1000) // 1 hour TTL per session
