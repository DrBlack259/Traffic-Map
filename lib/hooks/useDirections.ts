'use client'
import { useCallback } from 'react'
import { useMapStore } from '@/lib/store/mapStore'
import type { Route } from '@/lib/types'

export function useDirections() {
  const {
    origin, destination, waypoints, transportMode,
    setRoute, setRouteAlternatives, setSelectedRouteIndex,
    setIsRoutingLoading, setToast,
    setTrafficFlowVisible, setTrafficIncidentsVisible,
  } = useMapStore()

  const fetchRoute = useCallback(async () => {
    if (!origin || !destination) return
    setIsRoutingLoading(true)
    setRoute(null)
    setRouteAlternatives([])

    // Auto-enable traffic overlay
    setTrafficFlowVisible(true)
    setTrafficIncidentsVisible(true)

    try {
      const wpParams = waypoints.map(w => `wp=${w.lat},${w.lon}`).join('&')
      const url = `/api/route?olat=${origin.lat}&olon=${origin.lon}&dlat=${destination.lat}&dlon=${destination.lon}&mode=${transportMode}${wpParams ? '&' + wpParams : ''}`

      const res = await fetch(url)
      if (!res.ok) throw new Error('Routing failed')

      const alternatives: Route[] = await res.json()
      if (!alternatives?.length) throw new Error('No route found')

      setRouteAlternatives(alternatives)
      setSelectedRouteIndex(0)
      setRoute(alternatives[0])
    } catch {
      setToast({ message: 'Could not find a route. Try a different destination.', type: 'error' })
    } finally {
      setIsRoutingLoading(false)
    }
  }, [origin, destination, waypoints, transportMode,
    setRoute, setRouteAlternatives, setSelectedRouteIndex,
    setIsRoutingLoading, setToast,
    setTrafficFlowVisible, setTrafficIncidentsVisible])

  const selectAlternative = useCallback((index: number) => {
    const alts = useMapStore.getState().routeAlternatives
    if (alts[index]) {
      useMapStore.getState().setRoute(alts[index])
      useMapStore.getState().setSelectedRouteIndex(index)
    }
  }, [])

  return { fetchRoute, selectAlternative }
}
