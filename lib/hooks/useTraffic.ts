'use client'
import { useEffect, useCallback } from 'react'
import { useMapStore } from '@/lib/store/mapStore'

export function useTraffic() {
  const { center, zoom, trafficIncidentsVisible, setIncidents, setIncidentsLoading } = useMapStore()

  const fetchIncidents = useCallback(async () => {
    if (!trafficIncidentsVisible || zoom < 10) return
    const R = 0.15 * (2 ** (14 - zoom))
    const bbox = `${center[1] - R},${center[0] - R},${center[1] + R},${center[0] + R}`
    setIncidentsLoading(true)
    try {
      const res = await fetch(`/api/traffic?bbox=${bbox}`)
      if (!res.ok) return
      const data = await res.json()
      setIncidents(data)
    } catch {
      // silently ignore traffic errors
    } finally {
      setIncidentsLoading(false)
    }
  }, [center, zoom, trafficIncidentsVisible, setIncidents, setIncidentsLoading])

  useEffect(() => {
    fetchIncidents()
    const id = setInterval(fetchIncidents, 120_000)
    return () => clearInterval(id)
  }, [fetchIncidents])

  return { fetchIncidents }
}
