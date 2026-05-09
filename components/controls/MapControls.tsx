'use client'
import { Plus, Minus, Navigation, Maximize, Layers, Flame, Bot, Globe, Map } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'
import { useGeolocation } from '@/lib/hooks/useGeolocation'

export default function MapControls() {
  const { locate } = useGeolocation()
  const {
    zoom, setZoom, route,
    showLayerPicker, setShowLayerPicker,
    heatmapVisible, setHeatmapVisible,
    showAIAssistant, setShowAIAssistant,
    viewMode, setViewMode,
  } = useMapStore()

  const bottomClass = route ? 'bottom-[320px]' : 'bottom-8'
  const is3D = viewMode === '3d'

  return (
    <div className={`absolute right-4 ${bottomClass} flex flex-col gap-2 z-[500] transition-all duration-300`}>
      {/* 2D/3D toggle — always at top */}
      <button
        onClick={() => setViewMode(is3D ? '2d' : '3d')}
        className={`icon-btn font-bold text-[10px] leading-none flex-col gap-0.5 h-11 ${
          is3D ? 'bg-white text-black' : 'bg-white/15 text-white'
        }`}
        title={is3D ? 'Switch to 2D map' : 'Switch to 3D globe'}
      >
        {is3D ? <Map size={14} /> : <Globe size={14} />}
        <span>{is3D ? '2D' : '3D'}</span>
      </button>

      <div className="w-6 h-px bg-white/10 mx-auto" />

      {/* Zoom — only relevant in 2D */}
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

      {/* GPS / My Location */}
      <button
        onClick={locate}
        className="icon-btn !w-12 !h-12 !rounded-2xl bg-white text-black hover:bg-gray-100 shadow-lg"
        title="Show my location & plan route"
      >
        <Navigation size={20} />
      </button>

      <div className="w-6 h-px bg-white/10 mx-auto" />

      {/* Map layers (2D only) */}
      {!is3D && (
        <button
          onClick={() => setShowLayerPicker(!showLayerPicker)}
          className={`icon-btn ${showLayerPicker ? 'bg-white/20' : ''}`}
          title="Map layers"
        >
          <Layers size={16} />
        </button>
      )}

      {/* Traffic heatmap */}
      <button
        onClick={() => setHeatmapVisible(!heatmapVisible)}
        className={`icon-btn ${heatmapVisible ? 'text-orange-400 bg-orange-500/15' : ''}`}
        title="Traffic heatmap"
      >
        <Flame size={16} />
      </button>

      {/* AI Assistant */}
      <button
        onClick={() => setShowAIAssistant(!showAIAssistant)}
        className={`icon-btn ${showAIAssistant ? 'text-violet-400 bg-violet-500/15' : ''}`}
        title="AI navigation assistant"
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
