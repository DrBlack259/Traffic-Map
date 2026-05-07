'use client'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useMapStore } from '@/lib/store/mapStore'

export default function UserLocationMarker() {
  const map = useMap()
  const { userLocation } = useMapStore()
  const groupRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (groupRef.current) { map.removeLayer(groupRef.current); groupRef.current = null }
    if (!userLocation) return

    const [lat, lon] = userLocation
    const group = L.layerGroup().addTo(map)
    groupRef.current = group

    // Accuracy circle
    L.circle([lat, lon], { radius: 60, color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.1, weight: 1 }).addTo(group)

    // Pulsing dot
    const icon = L.divIcon({
      html: `
        <div style="position:relative;width:24px;height:24px;">
          <div class="location-pulse" style="
            position:absolute;inset:0;border-radius:50%;
            background:rgba(59,130,246,0.3);
          "></div>
          <div style="
            position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
            width:14px;height:14px;border-radius:50%;
            background:#3B82F6;border:2.5px solid #fff;
            box-shadow:0 0 0 3px rgba(59,130,246,0.35);
          "></div>
        </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      className: '',
    })
    L.marker([lat, lon], { icon }).addTo(group)

    return () => {
      if (groupRef.current) map.removeLayer(groupRef.current)
    }
  }, [userLocation, map])

  return null
}
