'use client'
import { useEffect, useRef, useCallback } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useMapStore } from '@/lib/store/mapStore'

const DARK_STYLE = 'https://tiles.openfreemap.org/styles/dark'

export default function Globe3DView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const { center, zoom, route, userLocation, destination } = useMapStore()
  const routeLayerAdded = useRef(false)

  // Initialise map once
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DARK_STYLE,
      center: [center[1], center[0]],
      zoom: zoom - 1,
      pitch: 45,
      bearing: 0,
      antialias: true,
      projection: 'globe',
    } as any)

    mapRef.current = map

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right')

    map.on('load', () => {
      // 3D terrain (using Maptiler open endpoint — no key for basic relief)
      map.addSource('terrain', {
        type: 'raster-dem',
        url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
        tileSize: 256,
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(map as any).setTerrain({ source: 'terrain', exaggeration: 1.5 })

      // Atmosphere / sky layer for globe
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(map as any).setFog({
        color: 'rgb(10,10,20)',
        'high-color': 'rgb(20,30,60)',
        'horizon-blend': 0.08,
        'space-color': 'rgb(4,4,12)',
        'star-intensity': 0.8,
      })

      // 3D buildings
      if (!map.getLayer('3d-buildings')) {
        map.addLayer({
          id: '3d-buildings',
          source: 'openmaptiles',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': '#1a1a2e',
            'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'render_height']],
            'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 15, 0, 15.05, ['get', 'render_min_height']],
            'fill-extrusion-opacity': 0.75,
          },
        })
      }

      routeLayerAdded.current = false
    })

    return () => {
      map.remove()
      mapRef.current = null
      routeLayerAdded.current = false
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // User location marker
  useEffect(() => {
    const map = mapRef.current
    if (!map || !userLocation) return

    const existing = document.getElementById('user-loc-globe')
    if (existing) existing.remove()

    const el = document.createElement('div')
    el.id = 'user-loc-globe'
    el.style.cssText = `
      width:16px;height:16px;border-radius:50%;
      background:#3b82f6;border:3px solid white;
      box-shadow:0 0 0 6px rgba(59,130,246,0.3);
    `

    new maplibregl.Marker({ element: el })
      .setLngLat([userLocation[1], userLocation[0]])
      .addTo(map)
  }, [userLocation])

  // Destination marker
  useEffect(() => {
    const map = mapRef.current
    if (!map || !destination) return

    const el = document.createElement('div')
    el.style.cssText = `
      width:14px;height:14px;border-radius:50%;
      background:#ef4444;border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.5);
    `

    new maplibregl.Marker({ element: el })
      .setLngLat([destination.lon, destination.lat])
      .setPopup(new maplibregl.Popup({ offset: 20, closeButton: false })
        .setHTML(`<div style="color:#fff;background:#1c1c1c;padding:6px 10px;border-radius:8px;font-size:12px;white-space:nowrap">${destination.name}</div>`))
      .addTo(map)

    map.flyTo({ center: [destination.lon, destination.lat], zoom: 14, pitch: 55, duration: 2000 })
  }, [destination])

  // Route polyline
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const removeRoute = () => {
      if (map.getLayer('route-3d')) map.removeLayer('route-3d')
      if (map.getSource('route-3d')) map.removeSource('route-3d')
      routeLayerAdded.current = false
    }

    if (!route) { removeRoute(); return }

    const addRoute = () => {
      removeRoute()
      map.addSource('route-3d', {
        type: 'geojson',
        data: { type: 'Feature', geometry: route.geometry, properties: {} },
      })
      map.addLayer({
        id: 'route-3d',
        type: 'line',
        source: 'route-3d',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#ffffff',
          'line-width': 5,
          'line-opacity': 0.9,
        },
      })
      routeLayerAdded.current = true

      // Fly to route bounds
      const coords = route.geometry.coordinates
      const lngs = coords.map(c => c[0])
      const lats = coords.map(c => c[1])
      map.fitBounds(
        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
        { padding: 80, pitch: 50, duration: 1500 }
      )
    }

    if (map.isStyleLoaded()) {
      addRoute()
    } else {
      map.once('load', addRoute)
    }
  }, [route])

  // Sync center from store when not in route mode
  const syncCenter = useCallback(() => {
    const map = mapRef.current
    if (!map || route) return
    map.flyTo({ center: [center[1], center[0]], zoom: zoom - 1, duration: 600 })
  }, [center, zoom, route])

  useEffect(() => { syncCenter() }, [syncCenter])

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full" />
      {/* 3D mode label */}
      <div className="absolute bottom-4 left-4 z-10 glass rounded-lg px-3 py-1.5 text-xs text-gray-400">
        3D Globe · OpenFreeMap + MapLibre
      </div>
      {/* Tilt hint */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 glass rounded-full px-4 py-2 text-xs text-gray-400 pointer-events-none opacity-70">
        Right-click drag to tilt · Scroll to zoom
      </div>
    </div>
  )
}
