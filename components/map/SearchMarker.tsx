'use client'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useMapStore } from '@/lib/store/mapStore'
import { createSearchIcon } from '@/lib/utils/icons'

export default function SearchMarker() {
  const map = useMap()
  const { destination, origin } = useMapStore()
  const destRef = useRef<L.Marker | null>(null)
  const origRef = useRef<L.Marker | null>(null)

  // Destination marker (red pin)
  useEffect(() => {
    if (destRef.current) { map.removeLayer(destRef.current); destRef.current = null }
    if (!destination) return

    const icon = L.divIcon({
      html: createSearchIcon(),
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -44],
      className: '',
    })

    destRef.current = L.marker([destination.lat, destination.lon], { icon })
      .bindPopup(
        `<div style="min-width:160px">
          <div style="font-weight:600;font-size:14px;margin-bottom:4px">${destination.name}</div>
          <div style="font-size:12px;color:#9ca3af">${destination.address?.city ?? ''}</div>
        </div>`,
        { maxWidth: 220 }
      )
      .addTo(map)

    return () => { if (destRef.current) map.removeLayer(destRef.current) }
  }, [destination, map])

  // Origin marker (green dot — only when it's not "My Location" GPS)
  useEffect(() => {
    if (origRef.current) { map.removeLayer(origRef.current); origRef.current = null }
    if (!origin || origin.id === 'user-location') return

    const icon = L.divIcon({
      html: `<div style="width:16px;height:16px;border-radius:50%;background:#22C55E;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5)"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      className: '',
    })

    origRef.current = L.marker([origin.lat, origin.lon], { icon }).addTo(map)

    return () => { if (origRef.current) map.removeLayer(origRef.current) }
  }, [origin, map])

  return null
}
