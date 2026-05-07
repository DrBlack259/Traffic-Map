'use client'
import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMapEvents, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css'
import 'leaflet-defaulticon-compatibility'
import { useMapStore } from '@/lib/store/mapStore'
import TrafficLayer from './TrafficLayer'
import RouteLayer from './RouteLayer'
import SearchMarker from './SearchMarker'
import UserLocationMarker from './UserLocationMarker'
import IncidentMarkers from './IncidentMarkers'
import POIMarkers from './POIMarkers'
import MeasureTool from './MeasureTool'
import MapControls from '../controls/MapControls'

const TILE_LAYERS = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  terrain: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
}

const TILE_ATTRIBUTIONS = {
  dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
  street: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  satellite: '&copy; <a href="https://www.esri.com/">Esri</a>',
  terrain: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
}

function MapEventHandler() {
  const { setCenter, setZoom, measureMode, addMeasurePoint, setDestination, searchingFor, route } = useMapStore()

  useMapEvents({
    moveend: (e) => {
      const c = e.target.getCenter()
      setCenter([c.lat, c.lng])
      setZoom(e.target.getZoom())
    },
    click: async (e) => {
      if (measureMode) {
        addMeasurePoint({ lat: e.latlng.lat, lon: e.latlng.lng })
        return
      }
      // If searchOverlay is open or route already set, ignore map clicks
      if (searchingFor || route) return

      try {
        const res = await fetch(`/api/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}`)
        if (!res.ok) return
        const place = await res.json()
        if (place) {
          // Long-tap / click on map sets it as destination directly
          setDestination(place)
        }
      } catch { /* silent */ }
    },
  })
  return null
}

function MapSyncController() {
  const map = useMap()
  const { zoom, userLocation, destination, route } = useMapStore()
  const prevZoom = useRef<number | null>(null)
  const prevUserLoc = useRef<string | null>(null)
  const prevPlace = useRef<string | null>(null)
  const prevRoute = useRef<string | null>(null)

  useEffect(() => {
    if (prevZoom.current !== zoom && Math.abs(map.getZoom() - zoom) > 0) {
      map.setZoom(zoom)
    }
    prevZoom.current = zoom
  }, [zoom, map])

  useEffect(() => {
    if (!userLocation) return
    const key = userLocation.join(',')
    if (prevUserLoc.current !== key) {
      map.flyTo(userLocation, 15, { duration: 1.2 })
      prevUserLoc.current = key
    }
  }, [userLocation, map])

  useEffect(() => {
    if (!destination) return
    const key = destination.id
    if (prevPlace.current !== key) {
      map.flyTo([destination.lat, destination.lon], 14, { duration: 1 })
      prevPlace.current = key
    }
  }, [destination, map])

  useEffect(() => {
    if (!route) return
    const key = route.distance + '-' + route.duration
    if (prevRoute.current !== key) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const L = require('leaflet')
      const coords = route.geometry.coordinates.map((pos) => [pos[1], pos[0]] as [number, number])
      map.fitBounds(L.latLngBounds(coords), { padding: [60, 60] })
      prevRoute.current = key
    }
  }, [route, map])

  return null
}

export default function MapView() {
  const { center, zoom, mapStyle } = useMapStore()

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%', background: '#0d0d0d' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          key={mapStyle}
          url={TILE_LAYERS[mapStyle]}
          attribution={TILE_ATTRIBUTIONS[mapStyle]}
          maxZoom={19}
        />
        <TrafficLayer />
        <RouteLayer />
        <SearchMarker />
        <UserLocationMarker />
        <IncidentMarkers />
        <POIMarkers />
        <MeasureTool />
        <MapEventHandler />
        <MapSyncController />
      </MapContainer>

      {/* Controls overlaid outside MapContainer */}
      <MapControls />

      {/* Map style label */}
      <div className="absolute bottom-4 left-4 z-[500] glass rounded-lg px-3 py-1.5 text-xs text-gray-400">
        {mapStyle === 'dark' ? 'Dark' : mapStyle === 'satellite' ? 'Satellite' : mapStyle === 'terrain' ? 'Terrain' : 'Street'} · OSM
      </div>
    </div>
  )
}
