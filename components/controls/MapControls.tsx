'use client'
import { Plus, Minus, Navigation, Maximize, Ruler, Layers, TriangleAlert } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'
import { useGeolocation } from '@/lib/hooks/useGeolocation'

export default function MapControls() {
  const { locate } = useGeolocation()
  const {
    zoom, setZoom,
    mapStyle, setMapStyle,
    trafficFlowVisible, setTrafficFlowVisible,
    trafficIncidentsVisible, setTrafficIncidentsVisible,
    measureMode, setMeasureMode, clearMeasurePoints,
  } = useMapStore()

  const styles = ['dark', 'street', 'satellite', 'terrain'] as const
  const nextStyle = styles[(styles.indexOf(mapStyle) + 1) % styles.length]
  const styleLabels = { dark: 'Dark', street: 'Street', satellite: 'Sat', terrain: 'Terrain' }

  const toggleMeasure = () => {
    if (measureMode) clearMeasurePoints()
    setMeasureMode(!measureMode)
  }

  const toggleTraffic = () => {
    const next = !trafficFlowVisible
    setTrafficFlowVisible(next)
    setTrafficIncidentsVisible(next)
  }

  return (
    <div className="absolute right-4 bottom-8 flex flex-col gap-2 z-[500] pointer-events-auto">
      <button className="icon-btn" onClick={() => setZoom(Math.min(zoom + 1, 19))} title="Zoom in">
        <Plus size={16} />
      </button>
      <button className="icon-btn" onClick={() => setZoom(Math.max(zoom - 1, 3))} title="Zoom out">
        <Minus size={16} />
      </button>
      <div className="w-6 h-px bg-white/10 mx-auto" />
      <button className="icon-btn" onClick={locate} title="My location">
        <Navigation size={16} />
      </button>
      <button
        className={`icon-btn ${trafficFlowVisible ? 'text-amber-400 bg-amber-500/15' : ''}`}
        onClick={toggleTraffic}
        title="Toggle traffic layer"
      >
        <TriangleAlert size={16} />
      </button>
      <button
        className={`icon-btn ${measureMode ? 'text-amber-400 bg-amber-500/15' : ''}`}
        onClick={toggleMeasure}
        title="Measure distance"
      >
        <Ruler size={16} />
      </button>
      <button
        className="icon-btn flex-col gap-0.5 !h-12 text-[9px] font-bold"
        onClick={() => setMapStyle(nextStyle)}
        title={`Switch to ${nextStyle}`}
      >
        <Layers size={13} />
        <span>{styleLabels[mapStyle]}</span>
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
