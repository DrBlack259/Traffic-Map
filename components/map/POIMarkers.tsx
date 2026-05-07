'use client'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useMapStore } from '@/lib/store/mapStore'
import { createPOIIcon } from '@/lib/utils/icons'
import type { POI } from '@/lib/types'

export default function POIMarkers() {
  const map = useMap()
  const { nearbyPlaces } = useMapStore()
  const groupRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (groupRef.current) { map.removeLayer(groupRef.current); groupRef.current = null }
    if (!nearbyPlaces.length) return

    const group = L.layerGroup().addTo(map)
    groupRef.current = group

    nearbyPlaces.forEach((poi: POI) => {
      const icon = L.divIcon({
        html: createPOIIcon(poi.category),
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        className: '',
      })
      L.marker([poi.lat, poi.lon], { icon })
        .bindPopup(
          `<div>
            <div style="font-weight:600;font-size:13px">${poi.name}</div>
            <div style="font-size:11px;color:#9ca3af;text-transform:capitalize">${poi.category}</div>
            ${poi.tags?.opening_hours ? `<div style="font-size:11px;margin-top:4px;color:#d1d5db">${poi.tags.opening_hours}</div>` : ''}
          </div>`,
          { maxWidth: 200 }
        )
        .addTo(group)
    })

    return () => {
      if (groupRef.current) map.removeLayer(groupRef.current)
    }
  }, [nearbyPlaces, map])

  return null
}
