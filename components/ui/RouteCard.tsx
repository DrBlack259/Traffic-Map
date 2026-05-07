'use client'
import { useState } from 'react'
import { X, ChevronDown, ChevronUp, Car, PersonStanding, Bike, TriangleAlert, ArrowRight, Share2 } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'
import { formatDistance, formatDuration } from '@/lib/utils/distance'
import type { TransportMode } from '@/lib/types'

const MODES: { key: TransportMode; icon: React.ReactNode; label: string }[] = [
  { key: 'driving',  icon: <Car size={16} />,           label: 'Drive' },
  { key: 'walking',  icon: <PersonStanding size={16} />, label: 'Walk'  },
  { key: 'cycling',  icon: <Bike size={16} />,           label: 'Cycle' },
]

const MANEUVER_ICONS: Record<string, string> = {
  turn: '↱', depart: '↑', arrive: '⚑', roundabout: '⟳',
  merge: '⤢', fork: '⑂', 'on ramp': '↗', 'off ramp': '↘',
}

function trafficLabel(incidents: number): { text: string; color: string } {
  if (incidents === 0) return { text: 'Clear roads', color: 'text-green-400' }
  if (incidents <= 2)  return { text: 'Light traffic', color: 'text-yellow-400' }
  if (incidents <= 5)  return { text: 'Moderate traffic', color: 'text-orange-400' }
  return { text: 'Heavy traffic', color: 'text-red-400' }
}

export default function RouteCard() {
  const {
    route, origin, destination,
    transportMode, setTransportMode,
    incidents, clearRoute, setSearchingFor,
  } = useMapStore()
  const [stepsOpen, setStepsOpen] = useState(false)

  if (!route) return null

  const traffic = trafficLabel(incidents.length)

  const share = () => {
    if (!origin || !destination) return
    const url = `${window.location.origin}?lat=${destination.lat}&lon=${destination.lon}&z=13`
    navigator.clipboard.writeText(url)
    useMapStore.getState().setToast({ message: 'Route link copied!', type: 'success' })
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[600] px-4 pb-6 animate-slide-up">
      <div className="glass rounded-3xl overflow-hidden shadow-2xl">

        {/* Route header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-white/8">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-1 truncate">
              <span className="truncate">{origin?.name ?? 'My Location'}</span>
              <ArrowRight size={12} className="flex-shrink-0" />
              <span className="font-medium text-white truncate">{destination?.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-white">{formatDuration(route.duration)}</span>
              <div>
                <div className="text-sm text-gray-300">{formatDistance(route.distance)}</div>
                <div className={`text-xs font-medium flex items-center gap-1 ${traffic.color}`}>
                  {incidents.length > 0 && <TriangleAlert size={11} />}
                  {traffic.text}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <button onClick={share} className="icon-btn w-9 h-9" title="Share route">
              <Share2 size={14} />
            </button>
            <button onClick={clearRoute} className="icon-btn w-9 h-9" title="Clear route">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Transport mode selector */}
        <div className="flex gap-1 px-5 py-3 border-b border-white/8">
          {MODES.map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setTransportMode(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all
                ${transportMode === key
                  ? 'bg-white text-black'
                  : 'bg-white/8 text-gray-400 hover:text-white'}`}
            >
              {icon}{label}
            </button>
          ))}
          <button
            onClick={() => setSearchingFor('destination')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium bg-white/8 text-gray-400 hover:text-white transition-all"
          >
            Change
          </button>
        </div>

        {/* Turn-by-turn toggle */}
        <button
          onClick={() => setStepsOpen(!stepsOpen)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/5 transition-colors"
        >
          <span className="text-sm font-medium text-gray-200">Turn-by-turn directions</span>
          {stepsOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {stepsOpen && (
          <div className="max-h-56 overflow-y-auto border-t border-white/8">
            {route.steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3 border-b border-white/5 last:border-0">
                <span className="text-gray-400 text-base w-5 text-center flex-shrink-0 mt-0.5">
                  {MANEUVER_ICONS[step.maneuver] ?? '→'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">{step.instruction}</div>
                  {step.name && <div className="text-xs text-gray-500 mt-0.5">{step.name}</div>}
                </div>
                <div className="text-xs text-gray-500 flex-shrink-0">{formatDistance(step.distance)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
