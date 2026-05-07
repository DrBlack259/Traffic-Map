'use client'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useMapStore } from '@/lib/store/mapStore'

export default function RouteLayer() {
  const map = useMap()
  const { route } = useMapStore()
  const layerRef = useRef<L.GeoJSON | null>(null)

  useEffect(() => {
    if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null }
    if (!route) return

    const isDashed = route.mode !== 'driving'
    layerRef.current = L.geoJSON(route.geometry, {
      style: {
        color: '#ffffff',
        weight: isDashed ? 4 : 6,
        opacity: 0.95,
        dashArray: isDashed ? '8 6' : undefined,
        lineCap: 'round',
        lineJoin: 'round',
        className: 'route-line',
      },
    }).addTo(map)

    return () => {
      if (layerRef.current) map.removeLayer(layerRef.current)
    }
  }, [route, map])

  return null
}
