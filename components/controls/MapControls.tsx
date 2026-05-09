'use client'
import { Plus, Minus, Navigation, Maximize, Flame, Bot, Globe, Map as MapIcon } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'
import { useGeolocation } from '@/lib/hooks/useGeolocation'

export default function MapControls() {
  const { locate } = useGeolocation()
  const {
    zoom, setZoom, route,
    heatmapVisible, setHeatmapVisible,
    showAIAssistant, setShowAIAssistant,
    viewMode, setViewMode,
  } = useMapStore()

  // On mobile: push controls up when route card is visible
  const mobileBottom = route ? 'bottom-[310px]' : 'bottom-6'

  const is3D = viewMode === '3d'

  return (
    <div className={`absolute right-3 lg:right-4 ${mobileBottom} lg:bottom-6 flex flex-col gap-2 z-[500] transition-all duration-300`}>

      {/* 2D/3D toggle — mobile only (desktop uses sidebar) */}
      <button
        onClick={() => setViewMode(is3D ? '2d' : '3d')}
        className={`icon-btn flex-col gap-0 lg:hidden ${is3D ? 'bg-white text-black' : 'bg-white/15 text-white'}`}
        title={is3D ? 'Switch to 2D' : '3D Globe'}
      >
        {is3D ? <MapIcon size={13} /> : <Globe size={13} />}
        <span className="text-[8px] font-bold leading-none mt-0.5">{is3D ? '2D' : '3D'}</span>
      </button>

      {/* Zoom — 2D only */}
      {!is3D && (
        <>
          <button className="icon-btn" onClick={() => setZoom(Math.min(zoom + 1, 19))} title="Zoom in">
            <Plus size={18} />
          </button>
          <button className="icon-btn" onClick={() => setZoom(Math.max(zoom - 1, 3))} title="Zoom out">
            <Minus size={18} />
          </button>
          <div className="w-6 h-px bg-white/10 mx-auto" />
        </>
      )}

      {/* GPS — always visible */}
      <button
        onClick={locate}
        className="icon-btn !w-12 !h-12 !rounded-2xl bg-white text-black hover:bg-gray-100 shadow-lg"
        title="My location"
      >
        <Navigation size={20} />
      </button>

      <div className="w-6 h-px bg-white/10 mx-auto" />

      {/* Heatmap */}
      <button
        onClick={() => setHeatmapVisible(!heatmapVisible)}
        className={`icon-btn ${heatmapVisible ? 'text-orange-400 bg-orange-500/15' : ''}`}
        title="Traffic heatmap"
      >
        <Flame size={16} />
      </button>

      {/* AI — mobile only (desktop uses sidebar) */}
      <button
        onClick={() => setShowAIAssistant(!showAIAssistant)}
        className={`icon-btn lg:hidden ${showAIAssistant ? 'text-violet-400 bg-violet-500/15' : ''}`}
        title="AI assistant"
      >
        <Bot size={16} />
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
