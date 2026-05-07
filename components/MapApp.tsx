'use client'
import { useEffect } from 'react'
import MapView from '@/components/map/MapView'
import TopNav from '@/components/ui/TopNav'
import Sidebar from '@/components/sidebar/Sidebar'
import BottomSheet from '@/components/ui/BottomSheet'
import Toast from '@/components/ui/Toast'
import { useMapStore } from '@/lib/store/mapStore'
import { useTraffic } from '@/lib/hooks/useTraffic'

export default function MapApp() {
  const { sidebarOpen } = useMapStore()
  useTraffic()

  // Read URL params for shared location
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const lat = params.get('lat')
    const lon = params.get('lon')
    const zoom = params.get('z')
    if (lat && lon) {
      useMapStore.getState().setCenter([parseFloat(lat), parseFloat(lon)])
      if (zoom) useMapStore.getState().setZoom(parseInt(zoom))
    }
  }, [])

  return (
    <div className="flex flex-col h-screen bg-[#0d0d0d] overflow-hidden">
      <TopNav />
      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop sidebar */}
        <aside
          className={`
            hidden lg:flex flex-col w-[400px] flex-shrink-0 border-r border-white/8
            glass transition-all duration-300 overflow-hidden z-10
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full w-0'}
          `}
        >
          <Sidebar />
        </aside>

        {/* Map fills remaining space */}
        <div className="flex-1 relative">
          <MapView />
        </div>

        {/* Mobile bottom sheet */}
        <div className="lg:hidden">
          <BottomSheet />
        </div>
      </div>
      <Toast />
    </div>
  )
}
