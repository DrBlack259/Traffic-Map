'use client'
import { useEffect, useState } from 'react'
import MapView from '@/components/map/MapView'
import FloatingSearchBar from '@/components/ui/FloatingSearchBar'
import MapControls from '@/components/controls/MapControls'
import SearchOverlay from '@/components/ui/SearchOverlay'
import WhereToCard from '@/components/ui/WhereToCard'
import RouteCard from '@/components/ui/RouteCard'
import LayerPicker from '@/components/ui/LayerPicker'
import RoutingLoader from '@/components/ui/RoutingLoader'
import Toast from '@/components/ui/Toast'
import WaypointManager from '@/components/ui/WaypointManager'
import LocationShareViewer from '@/components/ui/LocationShareViewer'
import { useMapStore } from '@/lib/store/mapStore'
import { useTraffic } from '@/lib/hooks/useTraffic'
import { useDirections } from '@/lib/hooks/useDirections'

export default function MapApp() {
  const {
    userLocation, route, searchingFor, origin, destination,
    showLayerPicker, transportMode, showWaypointManager,
  } = useMapStore()
  useTraffic()
  const { fetchRoute } = useDirections()
  const [viewingShareId, setViewingShareId] = useState<string | null>(null)

  // Auto-fetch route when both endpoints are set, or mode changes
  useEffect(() => {
    if (origin && destination) fetchRoute()
  }, [origin, destination, transportMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // Read URL params on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)

    // Map position params
    const lat = params.get('lat')
    const lon = params.get('lon')
    const zoom = params.get('z')
    if (lat && lon) {
      useMapStore.getState().setCenter([parseFloat(lat), parseFloat(lon)])
      if (zoom) useMapStore.getState().setZoom(parseInt(zoom))
    }

    // Live share viewer
    const shareId = params.get('share')
    if (shareId) setViewingShareId(shareId)
  }, [])

  const showWhereToCard = !!userLocation && !route && !searchingFor
  const showRouteCard = !!route && !searchingFor

  return (
    <div className="w-full h-screen relative overflow-hidden bg-[#0d0d0d]">
      {/* Full-screen map */}
      <MapView />

      {/* Floating top search bar */}
      <FloatingSearchBar />

      {/* Right-side map controls */}
      <MapControls />

      {/* Layer style picker */}
      {showLayerPicker && <LayerPicker />}

      {/* Full-screen search overlay */}
      {searchingFor && <SearchOverlay />}

      {/* Bottom: "Where to?" card after GPS fix */}
      {showWhereToCard && <WhereToCard />}

      {/* Bottom: Route summary card */}
      {showRouteCard && <RouteCard />}

      {/* Waypoint manager modal */}
      {showWaypointManager && <WaypointManager />}

      {/* Live location viewer (when opened via share link) */}
      {viewingShareId && (
        <LocationShareViewer
          shareId={viewingShareId}
          onClose={() => {
            setViewingShareId(null)
            // Strip share param from URL without reload
            const url = new URL(window.location.href)
            url.searchParams.delete('share')
            window.history.replaceState({}, '', url.toString())
          }}
        />
      )}

      {/* Routing spinner */}
      <RoutingLoader />

      <Toast />
    </div>
  )
}
