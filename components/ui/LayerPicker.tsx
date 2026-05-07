'use client'
import { useMapStore } from '@/lib/store/mapStore'
import type { MapStyle } from '@/lib/types'

const LAYERS: { key: MapStyle; label: string; bg: string }[] = [
  { key: 'dark',      label: 'Dark',      bg: '#1a1a2e' },
  { key: 'satellite', label: 'Satellite', bg: '#2d4a1e' },
  { key: 'street',    label: 'Street',    bg: '#e8e0d0' },
  { key: 'terrain',   label: 'Terrain',   bg: '#c8d8a0' },
]

export default function LayerPicker() {
  const { mapStyle, setMapStyle, setShowLayerPicker, trafficFlowVisible, setTrafficFlowVisible } = useMapStore()

  return (
    <div className="absolute top-20 right-4 z-[700] glass rounded-2xl p-4 w-52 shadow-2xl animate-fade-in">
      <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-3">Map Type</p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {LAYERS.map(({ key, label, bg }) => (
          <button
            key={key}
            onClick={() => { setMapStyle(key); setShowLayerPicker(false) }}
            className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all ${
              mapStyle === key ? 'ring-2 ring-white' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <div className="w-full h-10 rounded-lg" style={{ background: bg }} />
            <span className="text-xs text-white">{label}</span>
          </button>
        ))}
      </div>

      <div className="border-t border-white/8 pt-3">
        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-2">Traffic</p>
        <button
          onClick={() => setTrafficFlowVisible(!trafficFlowVisible)}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
            trafficFlowVisible ? 'bg-amber-500/20 text-amber-300' : 'bg-white/8 text-gray-400'
          }`}
        >
          <span>Live Traffic</span>
          <div className={`w-8 h-4 rounded-full transition-colors ${trafficFlowVisible ? 'bg-amber-500' : 'bg-white/20'}`}>
            <div className={`w-3 h-3 rounded-full bg-white mt-0.5 transition-transform ${trafficFlowVisible ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
        </button>
      </div>
    </div>
  )
}
