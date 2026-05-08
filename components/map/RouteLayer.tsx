'use client'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useMapStore } from '@/lib/store/mapStore'

export default function RouteLayer() {
  const map = useMap()
  const { route, routeAlternatives, selectedRouteIndex } = useMapStore()
  const altLayersRef = useRef<L.GeoJSON[]>([])
  const mainLayerRef = useRef<L.GeoJSON | null>(null)

  useEffect(() => {
    // Remove all existing layers
    altLayersRef.current.forEach(l => map.removeLayer(l))
    altLayersRef.current = []
    if (mainLayerRef.current) { map.removeLayer(mainLayerRef.current); mainLayerRef.current = null }

    if (!route) return

    // Draw non-selected alternatives first (behind)
    routeAlternatives.forEach((alt, i) => {
      if (i === selectedRouteIndex) return
      const layer = L.geoJSON(alt.geometry, {
        style: {
          color: '#6b7280',
          weight: 5,
          opacity: 0.55,
          lineCap: 'round',
          lineJoin: 'round',
        },
      }).addTo(map)
      altLayersRef.current.push(layer)
    })

    // Draw selected route on top
    const isDashed = route.mode !== 'driving'
    mainLayerRef.current = L.geoJSON(route.geometry, {
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

    // Fit bounds to selected route
    const bounds = mainLayerRef.current.getBounds()
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [60, 60] })

    return () => {
      altLayersRef.current.forEach(l => map.removeLayer(l))
      altLayersRef.current = []
      if (mainLayerRef.current) map.removeLayer(mainLayerRef.current)
    }
  }, [route, routeAlternatives, selectedRouteIndex, map])

  return null
}
