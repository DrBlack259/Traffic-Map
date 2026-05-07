'use client'
import { Plus, Minus, Navigation, Maximize } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'
import { useGeolocation } from '@/lib/hooks/useGeolocation'

export default function MapControls() {
  const { locate } = useGeolocation()
  const { zoom, setZoom, route } = useMapStore()

  // Push controls up when route card is showing
  const bottomClass = route ? 'bottom-[320px]' : 'bottom-8'

  return (
    <div className={`absolute right-4 ${bottomClass} flex flex-col gap-2 z-[500] transition-all duration-300`}>
      <button className="icon-btn" onClick={() => setZoom(Math.min(zoom + 1, 19))} title="Zoom in">
        <Plus size={18} />
      </button>
      <button className="icon-btn" onClick={() => setZoom(Math.max(zoom - 1, 3))} title="Zoom out">
        <Minus size={18} />
      </button>

      <div className="w-6 h-px bg-white/10 mx-auto" />

      {/* GPS / My Location — the key button */}
      <button
        onClick={locate}
        className="icon-btn !w-12 !h-12 !rounded-2xl bg-white text-black hover:bg-gray-100 shadow-lg"
        title="Show my location & plan route"
      >
        <Navigation size={20} />
      </button>

      <button
        className="icon-btn"
        onClick={() => document.documentElement.requestFullscreen?.()}
        title="Fullscreen"
      >
        <Maximize size={16} />
      </button>
    </div>
  )
}
