'use client'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useMapStore } from '@/lib/store/mapStore'
import { createSearchIcon } from '@/lib/utils/icons'

export default function SearchMarker() {
  const map = useMap()
  const { selectedPlace } = useMapStore()
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (markerRef.current) { map.removeLayer(markerRef.current); markerRef.current = null }
    if (!selectedPlace) return

    const icon = L.divIcon({
      html: createSearchIcon(),
      iconSize: [36, 44],
      iconAnchor: [18, 44],
      popupAnchor: [0, -44],
      className: '',
    })

    markerRef.current = L.marker([selectedPlace.lat, selectedPlace.lon], { icon })
      .bindPopup(
        `<div style="min-width:160px">
          <div style="font-weight:600;font-size:14px;margin-bottom:4px">${selectedPlace.name}</div>
          <div style="font-size:12px;color:#9ca3af;line-height:1.4">${selectedPlace.address?.road ? selectedPlace.address.road + ', ' : ''}${selectedPlace.address?.city || ''}</div>
          <div style="font-size:11px;color:#6b7280;margin-top:4px">${selectedPlace.lat.toFixed(5)}, ${selectedPlace.lon.toFixed(5)}</div>
        </div>`,
        { maxWidth: 240 }
      )
      .addTo(map)
      .openPopup()

    return () => {
      if (markerRef.current) map.removeLayer(markerRef.current)
    }
  }, [selectedPlace, map])

  return null
}
