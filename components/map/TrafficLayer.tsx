'use client'
import { TileLayer } from 'react-leaflet'
import { useMapStore } from '@/lib/store/mapStore'

const TOMTOM_KEY = process.env.NEXT_PUBLIC_TOMTOM_API_KEY

export default function TrafficLayer() {
  const { trafficFlowVisible, trafficIncidentsVisible } = useMapStore()

  if (!TOMTOM_KEY || TOMTOM_KEY === 'your_tomtom_api_key_here') return null

  return (
    <>
      {trafficFlowVisible && (
        <TileLayer
          key="traffic-flow"
          url={`https://api.tomtom.com/traffic/map/4/tile/flow/relative0/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`}
          opacity={0.8}
          maxZoom={22}
          zIndex={400}
        />
      )}
      {trafficIncidentsVisible && (
        <TileLayer
          key="traffic-incidents"
          url={`https://api.tomtom.com/traffic/map/4/tile/incidents/s3/{z}/{x}/{y}.png?key=${TOMTOM_KEY}`}
          opacity={1}
          maxZoom={22}
          zIndex={401}
        />
      )}
    </>
  )
}
