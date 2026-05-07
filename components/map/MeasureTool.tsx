'use client'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useMapStore } from '@/lib/store/mapStore'
import { haversineDistance, formatDistance } from '@/lib/utils/distance'

export default function MeasureTool() {
  const map = useMap()
  const { measureMode, measurePoints } = useMapStore()
  const groupRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (groupRef.current) { map.removeLayer(groupRef.current); groupRef.current = null }
    if (!measureMode || measurePoints.length === 0) return

    const group = L.layerGroup().addTo(map)
    groupRef.current = group

    // Draw markers and line
    const latlngs: [number, number][] = measurePoints.map((p) => [p.lat, p.lon])

    if (latlngs.length > 1) {
      L.polyline(latlngs, { color: '#F59E0B', weight: 3, dashArray: '6 4' }).addTo(group)
    }

    let totalDist = 0
    measurePoints.forEach((p, i) => {
      if (i > 0) {
        const prev = measurePoints[i - 1]
        totalDist += haversineDistance(prev.lat, prev.lon, p.lat, p.lon)
      }
      const icon = L.divIcon({
        html: `<div style="width:12px;height:12px;border-radius:50%;background:#F59E0B;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.5)"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
        className: '',
      })
      const marker = L.marker([p.lat, p.lon], { icon }).addTo(group)
      if (i > 0) {
        marker.bindTooltip(formatDistance(totalDist), { permanent: true, direction: 'top', className: 'bg-surface text-white border-none text-xs' })
      }
    })

    return () => {
      if (groupRef.current) map.removeLayer(groupRef.current)
    }
  }, [measureMode, measurePoints, map])

  return null
}
