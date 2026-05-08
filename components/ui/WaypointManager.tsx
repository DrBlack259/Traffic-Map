'use client'
import { useState } from 'react'
import { X, GripVertical, Plus, MapPin } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'
import { useDirections } from '@/lib/hooks/useDirections'
import type { SearchResult } from '@/lib/types'

function WaypointRow({
  place,
  onRemove,
}: {
  place: SearchResult
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8 last:border-0">
      <GripVertical size={16} className="text-gray-600 flex-shrink-0" />
      <MapPin size={14} className="text-blue-400 flex-shrink-0" />
      <span className="flex-1 text-sm text-white truncate">{place.name}</span>
      <button
        onClick={onRemove}
        className="icon-btn w-7 h-7 flex-shrink-0"
        aria-label="Remove stop"
      >
        <X size={13} />
      </button>
    </div>
  )
}

export default function WaypointManager() {
  const {
    origin, destination, waypoints,
    removeWaypoint, setShowWaypointManager, setSearchingFor,
  } = useMapStore()
  const { fetchRoute } = useDirections()
  const [adding, setAdding] = useState(false)

  const handleAddStop = () => {
    setAdding(false)
    setShowWaypointManager(false)
    setSearchingFor('waypoint')
  }

  const handleRemove = (id: string) => {
    removeWaypoint(id)
    fetchRoute()
  }

  return (
    <div className="fixed inset-0 z-[800] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowWaypointManager(false)}
      />

      <div className="relative w-full max-w-lg animate-slide-up">
        <div className="glass rounded-t-3xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-base font-semibold text-white">Stops</h2>
            <button
              onClick={() => setShowWaypointManager(false)}
              className="icon-btn w-8 h-8"
            >
              <X size={15} />
            </button>
          </div>

          {/* Origin */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/8">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400 flex-shrink-0 ml-1" />
            <span className="text-sm text-gray-300 truncate flex-1">
              {origin?.name ?? 'My Location'}
            </span>
          </div>

          {/* Waypoints */}
          {waypoints.map(wp => (
            <WaypointRow
              key={wp.id}
              place={wp}
              onRemove={() => handleRemove(wp.id)}
            />
          ))}

          {/* Add stop button */}
          <button
            onClick={handleAddStop}
            className="flex items-center gap-3 px-4 py-3 w-full border-b border-white/8 hover:bg-white/5 transition-colors"
          >
            <Plus size={16} className="text-blue-400 flex-shrink-0 ml-0.5" />
            <span className="text-sm text-blue-400">Add stop</span>
          </button>

          {/* Destination */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-2.5 h-2.5 rounded-sm bg-red-400 flex-shrink-0 ml-1" />
            <span className="text-sm text-white truncate flex-1">
              {destination?.name ?? 'Destination'}
            </span>
          </div>

          {/* Done */}
          <div className="px-4 pb-5 pt-2">
            <button
              onClick={() => setShowWaypointManager(false)}
              className="w-full py-3 rounded-2xl bg-white text-black text-sm font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
