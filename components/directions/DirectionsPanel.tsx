'use client'
import { useEffect } from 'react'
import { Car, PersonStanding, Bike, ArrowRight, Loader2, ChevronRight } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'
import { useDirections } from '@/lib/hooks/useDirections'
import { formatDistance, formatDuration } from '@/lib/utils/distance'
import SearchBar from '@/components/search/SearchBar'
import type { TransportMode } from '@/lib/types'

const MODES: { key: TransportMode; icon: React.ReactNode; label: string }[] = [
  { key: 'driving', icon: <Car size={16} />, label: 'Drive' },
  { key: 'walking', icon: <PersonStanding size={16} />, label: 'Walk' },
  { key: 'cycling', icon: <Bike size={16} />, label: 'Cycle' },
]

function ManeuverIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    turn: '↱',
    depart: '↑',
    arrive: '🏁',
    roundabout: '⟳',
    merge: '⤢',
    fork: '⑂',
  }
  return <span className="text-gray-400 text-sm">{icons[type] || '→'}</span>
}

export default function DirectionsPanel() {
  const {
    origin, destination, transportMode, route, isRoutingLoading,
    setOrigin, setDestination, setTransportMode, selectedPlace,
  } = useMapStore()
  const { fetchRoute } = useDirections()

  useEffect(() => {
    if (selectedPlace && !destination) setDestination(selectedPlace)
  }, [selectedPlace, destination, setDestination])

  useEffect(() => {
    if (origin && destination) fetchRoute()
  }, [origin, destination, transportMode]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-white/8">
        <h2 className="text-sm font-semibold mb-3">Directions</h2>

        {/* Origin */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 ml-1" />
          {origin ? (
            <div className="flex-1 glass rounded-lg px-3 py-2 flex items-center justify-between text-sm">
              <span className="truncate text-white">{origin.name}</span>
              <button onClick={() => setOrigin(null)} className="text-gray-500 hover:text-white ml-2 text-xs">✕</button>
            </div>
          ) : (
            <div className="flex-1 glass rounded-lg px-3 py-2 text-sm text-gray-500">
              Choose starting point
            </div>
          )}
        </div>

        {/* Destination */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0 ml-1" />
          {destination ? (
            <div className="flex-1 glass rounded-lg px-3 py-2 flex items-center justify-between text-sm">
              <span className="truncate text-white">{destination.name}</span>
              <button onClick={() => setDestination(null)} className="text-gray-500 hover:text-white ml-2 text-xs">✕</button>
            </div>
          ) : (
            <div className="flex-1">
              <SearchBar />
            </div>
          )}
        </div>

        {/* Transport mode */}
        <div className="flex gap-1">
          {MODES.map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setTransportMode(key)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-lg text-xs transition-all
                ${transportMode === key ? 'bg-white text-black' : 'glass text-gray-400 hover:text-white'}`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Route result */}
      <div className="flex-1 overflow-y-auto p-4">
        {isRoutingLoading && (
          <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Finding route…</span>
          </div>
        )}

        {route && !isRoutingLoading && (
          <>
            <div className="glass rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-3">
                <div>
                  <div className="text-2xl font-bold text-white">{formatDuration(route.duration)}</div>
                  <div className="text-sm text-gray-400">{formatDistance(route.distance)}</div>
                </div>
                <ArrowRight size={16} className="text-gray-600 mx-1" />
                <div className="text-xs text-gray-400">
                  {origin?.name} → {destination?.name}
                </div>
              </div>
            </div>

            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Turn-by-turn</h3>
            <div className="space-y-0.5">
              {route.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-white/4 transition-colors">
                  <ManeuverIcon type={step.maneuver} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white leading-tight">{step.instruction}</div>
                    {step.name && <div className="text-xs text-gray-500 mt-0.5">{step.name}</div>}
                  </div>
                  <div className="text-xs text-gray-500 flex-shrink-0">
                    {formatDistance(step.distance)}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!route && !isRoutingLoading && (
          <div className="text-center py-8 text-gray-500 text-sm space-y-2">
            <ChevronRight size={24} className="mx-auto text-gray-600" />
            <p>Set origin and destination<br />to get directions</p>
          </div>
        )}
      </div>
    </div>
  )
}
