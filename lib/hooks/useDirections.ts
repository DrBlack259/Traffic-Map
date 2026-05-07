'use client'
import { useCallback } from 'react'
import { useMapStore } from '@/lib/store/mapStore'

export function useDirections() {
  const {
    origin, destination, transportMode,
    setRoute, setIsRoutingLoading, setToast,
    trafficFlowVisible, setTrafficFlowVisible,
    trafficIncidentsVisible, setTrafficIncidentsVisible,
  } = useMapStore()

  const fetchRoute = useCallback(async () => {
    if (!origin || !destination) return
    setIsRoutingLoading(true)
    setRoute(null)

    // Auto-enable traffic when routing
    if (!trafficFlowVisible) setTrafficFlowVisible(true)
    if (!trafficIncidentsVisible) setTrafficIncidentsVisible(true)

    try {
      const res = await fetch(
        `/api/route?olat=${origin.lat}&olon=${origin.lon}&dlat=${destination.lat}&dlon=${destination.lon}&mode=${transportMode}`
      )
      if (!res.ok) throw new Error('Routing failed')
      const data = await res.json()
      if (data?.error) throw new Error(data.error)
      setRoute(data)
    } catch {
      setToast({ message: 'Could not find a route. Try a different destination.', type: 'error' })
    } finally {
      setIsRoutingLoading(false)
    }
  }, [origin, destination, transportMode, setRoute, setIsRoutingLoading, setToast, trafficFlowVisible, trafficIncidentsVisible, setTrafficFlowVisible, setTrafficIncidentsVisible])

  return { fetchRoute }
}
