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
import AIAssistant from '@/components/ui/AIAssistant'
import DesktopSidebar from '@/components/ui/DesktopSidebar'
import Globe3DView from '@/components/map/Globe3DLoader'
import { useMapStore } from '@/lib/store/mapStore'
import { useTraffic } from '@/lib/hooks/useTraffic'
import { useDirections } from '@/lib/hooks/useDirections'

export default function MapApp() {
  const {
    userLocation, route, searchingFor, origin, destination,
    showLayerPicker, transportMode, showWaypointManager,
    showAIAssistant, setShowAIAssistant, viewMode,
  } = useMapStore()
  useTraffic()
  const { fetchRoute } = useDirections()
  const [viewingShareId, setViewingShareId] = useState<string | null>(null)

  useEffect(() => {
    if (origin && destination) fetchRoute()
  }, [origin, destination, transportMode]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const lat = params.get('lat'); const lon = params.get('lon'); const zoom = params.get('z')
    if (lat && lon) {
      useMapStore.getState().setCenter([parseFloat(lat), parseFloat(lon)])
      if (zoom) useMapStore.getState().setZoom(parseInt(zoom))
    }
    const shareId = params.get('share')
    if (shareId) setViewingShareId(shareId)

    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [])

  // Mobile card visibility
  const showWhereToCard = !!userLocation && !route && !searchingFor
  const showRouteCard = !!route && !searchingFor

  return (
    // Desktop: flex-row (sidebar + map). Mobile: single column full-screen map.
    <div className="w-full h-full flex flex-row bg-[#0d0d0d]">

      {/* Desktop left sidebar — hidden on mobile */}
      <DesktopSidebar />

      {/* Map area — fills remaining space */}
      <div className="relative flex-1 min-w-0 h-full overflow-hidden">

        {/* Full-screen map */}
        {viewMode === '3d' ? <Globe3DView /> : <MapView />}

        {/* Floating top search bar — mobile only */}
        <div className="lg:hidden">
          <FloatingSearchBar />
        </div>

        {/* Map controls — always visible (desktop: right of map, mobile: right) */}
        <MapControls />

        {/* Layer picker — mobile/small screen */}
        {showLayerPicker && (
          <div className="lg:hidden">
            <LayerPicker />
          </div>
        )}

        {/* Full-screen search overlay — mobile only */}
        {searchingFor && (
          <div className="lg:hidden">
            <SearchOverlay />
          </div>
        )}

        {/* Mobile "Where to?" card */}
        {showWhereToCard && (
          <div className="lg:hidden">
            <WhereToCard />
          </div>
        )}

        {/* Mobile route card */}
        {showRouteCard && (
          <div className="lg:hidden">
            <RouteCard />
          </div>
        )}

        {/* Waypoint manager modal — works on all sizes */}
        {showWaypointManager && <WaypointManager />}

        {/* AI Assistant — mobile overlay only (desktop uses sidebar) */}
        {showAIAssistant && !searchingFor && (
          <div className="lg:hidden">
            <AIAssistant onClose={() => setShowAIAssistant(false)} />
          </div>
        )}

        {/* Live location viewer */}
        {viewingShareId && (
          <LocationShareViewer
            shareId={viewingShareId}
            onClose={() => {
              setViewingShareId(null)
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
    </div>
  )
}
