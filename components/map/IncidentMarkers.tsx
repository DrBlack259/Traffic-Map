'use client'
import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { useMapStore } from '@/lib/store/mapStore'
import { createIncidentIcon } from '@/lib/utils/icons'
import type { TrafficIncident } from '@/lib/types'

const INCIDENT_LABELS: Record<string, string> = {
  ACCIDENT: 'Accident',
  JAM: 'Traffic Jam',
  ROAD_CLOSED: 'Road Closed',
  ROAD_WORKS: 'Road Works',
  LANE_CLOSED: 'Lane Closed',
  FOG: 'Fog',
  RAIN: 'Rain',
  ICE: 'Ice',
  WIND: 'Wind',
  FLOODING: 'Flooding',
  BROKEN_DOWN_VEHICLE: 'Broken Down Vehicle',
  DANGEROUS_CONDITIONS: 'Dangerous Conditions',
  OTHER_NEWS: 'Traffic Event',
}

function severityLabel(s: number): string {
  return ['', 'Minor', 'Moderate', 'Major', 'Severe'][s] || 'Unknown'
}

export default function IncidentMarkers() {
  const map = useMap()
  const { incidents, trafficIncidentsVisible } = useMapStore()
  const groupRef = useRef<L.LayerGroup | null>(null)

  useEffect(() => {
    if (groupRef.current) { map.removeLayer(groupRef.current); groupRef.current = null }
    if (!trafficIncidentsVisible || !incidents.length) return

    const group = L.layerGroup().addTo(map)
    groupRef.current = group

    incidents.forEach((inc: TrafficIncident) => {
      if (!inc.lat || !inc.lon) return
      const icon = L.divIcon({
        html: createIncidentIcon(inc.severity),
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        className: '',
      })
      const delayText = inc.delay ? `<div style="color:#F59E0B;font-size:11px">Delay: +${Math.round(inc.delay / 60)} min</div>` : ''
      const roadText = inc.roadName ? `<div style="color:#9ca3af;font-size:11px">${inc.roadName}</div>` : ''
      L.marker([inc.lat, inc.lon], { icon })
        .bindPopup(
          `<div style="min-width:160px">
            <div style="font-weight:600;font-size:13px;margin-bottom:2px">${INCIDENT_LABELS[inc.type] || 'Incident'}</div>
            <div style="font-size:12px;color:#9ca3af;margin-bottom:4px">${severityLabel(inc.severity)} severity</div>
            ${roadText}
            <div style="font-size:11px;line-height:1.5;margin-top:4px;color:#d1d5db">${inc.description}</div>
            ${delayText}
          </div>`,
          { maxWidth: 220 }
        )
        .addTo(group)
    })

    return () => {
      if (groupRef.current) map.removeLayer(groupRef.current)
    }
  }, [incidents, trafficIncidentsVisible, map])

  return null
}
