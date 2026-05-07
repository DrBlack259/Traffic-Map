'use client'
import { MapPin, Navigation2, Copy, ExternalLink, X } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'

export default function PlaceCard() {
  const { selectedPlace, setSelectedPlace, setOrigin, setDestination, setDirectionsOpen, setActiveTab } = useMapStore()
  if (!selectedPlace) return null

  const copyCoords = () => {
    navigator.clipboard.writeText(`${selectedPlace.lat.toFixed(6)}, ${selectedPlace.lon.toFixed(6)}`)
    useMapStore.getState().setToast({ message: 'Coordinates copied!', type: 'success' })
  }

  const getDirections = () => {
    setDestination(selectedPlace)
    setDirectionsOpen(true)
    setActiveTab('directions')
  }

  const share = () => {
    const url = `${window.location.origin}?lat=${selectedPlace.lat}&lon=${selectedPlace.lon}&z=15`
    navigator.clipboard.writeText(url)
    useMapStore.getState().setToast({ message: 'Share link copied!', type: 'success' })
  }

  return (
    <div className="glass rounded-2xl p-4 animate-fade-in">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <MapPin size={18} className="text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm leading-tight">{selectedPlace.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">{selectedPlace.type}</p>
          </div>
        </div>
        <button onClick={() => setSelectedPlace(null)} className="text-gray-500 hover:text-white flex-shrink-0">
          <X size={14} />
        </button>
      </div>

      <div className="text-xs text-gray-400 mb-3 leading-relaxed">
        {selectedPlace.displayName}
      </div>

      <div className="text-xs text-gray-500 font-mono mb-3">
        {selectedPlace.lat.toFixed(6)}, {selectedPlace.lon.toFixed(6)}
      </div>

      <div className="flex gap-2">
        <button
          onClick={getDirections}
          className="flex-1 flex items-center justify-center gap-2 bg-white text-black text-xs font-semibold rounded-lg py-2 hover:bg-gray-100 transition-colors"
        >
          <Navigation2 size={12} />
          Directions
        </button>
        <button onClick={copyCoords} className="icon-btn flex-shrink-0" title="Copy coordinates">
          <Copy size={14} />
        </button>
        <button onClick={share} className="icon-btn flex-shrink-0" title="Share location">
          <ExternalLink size={14} />
        </button>
      </div>
    </div>
  )
}
