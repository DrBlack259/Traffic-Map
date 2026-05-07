'use client'
import { useCallback, useRef } from 'react'
import { useMapStore } from '@/lib/store/mapStore'
import type { SearchResult } from '@/lib/types'

const cache = new Map<string, SearchResult[]>()

export function useSearch() {
  const { setSearchResults, setIsSearching, setToast } = useMapStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback((query: string) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (!query.trim()) { setSearchResults([]); return }

    timerRef.current = setTimeout(async () => {
      if (cache.has(query)) { setSearchResults(cache.get(query)!); return }
      setIsSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data: SearchResult[] = await res.json()
        cache.set(query, data)
        setSearchResults(data)
      } catch {
        setToast({ message: 'Search failed', type: 'error' })
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }, [setSearchResults, setIsSearching, setToast])

  return { search }
}
