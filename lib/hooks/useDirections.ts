'use client'
import { useCallback } from 'react'
import { useMapStore } from '@/lib/store/mapStore'

export function useDirections() {
  const {
    origin, destination, transportMode,
    setRoute, setIsRoutingLoading, setToast,
  } = useMapStore()

  const fetchRoute = useCallback(async () => {
    if (!origin || !destination) return
    setIsRoutingLoading(true)
    setRoute(null)
    try {
      const res = await fetch(
        `/api/route?olat=${origin.lat}&olon=${origin.lon}&dlat=${destination.lat}&dlon=${destination.lon}&mode=${transportMode}`
      )
      if (!res.ok) throw new Error('Routing failed')
      const data = await res.json()
      setRoute(data)
    } catch {
      setToast({ message: 'Could not find a route. Try different endpoints.', type: 'error' })
    } finally {
      setIsRoutingLoading(false)
    }
  }, [origin, destination, transportMode, setRoute, setIsRoutingLoading, setToast])

  return { fetchRoute }
}
