'use client'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useMapStore } from '@/lib/store/mapStore'

const SEVERITY_RADIUS: Record<number, number> = { 1: 300, 2: 500, 3: 700, 4: 1000 }
const SEVERITY_COLORS: Record<number, string> = {
  1: 'rgba(250,204,21,',   // yellow
  2: 'rgba(251,146,60,',   // orange
  3: 'rgba(239,68,68,',    // red
  4: 'rgba(185,28,28,',    // dark red
}

export default function HeatmapLayer({ visible }: { visible: boolean }) {
  const map = useMap()
  const { incidents } = useMapStore()
  const layerRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (layerRef.current) { map.removeLayer(layerRef.current); layerRef.current = null }
    if (!visible || incidents.length === 0) return

    const group = L.layerGroup()

    incidents.forEach((inc) => {
      const severity = inc.severity as 1 | 2 | 3 | 4
      const radius = SEVERITY_RADIUS[severity] ?? 400
      const colorBase = SEVERITY_COLORS[severity] ?? 'rgba(239,68,68,'

      // Outer glow
      L.circle([inc.lat, inc.lon], {
        radius,
        color: 'transparent',
        fillColor: colorBase + '0.15)',
        fillOpacity: 1,
        weight: 0,
      }).addTo(group)

      // Inner core
      L.circle([inc.lat, inc.lon], {
        radius: radius * 0.35,
        color: 'transparent',
        fillColor: colorBase + '0.4)',
        fillOpacity: 1,
        weight: 0,
      }).addTo(group)
    })

    group.addTo(map)
    layerRef.current = group

    return () => {
      if (layerRef.current) map.removeLayer(layerRef.current)
    }
  }, [visible, incidents, map])

  return null
}
