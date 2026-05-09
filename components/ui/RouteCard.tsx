'use client'
import { useState } from 'react'
import { X, ChevronDown, ChevronUp, Car, PersonStanding, Bike, TriangleAlert, ArrowRight, Share2, Plus, Volume2, VolumeX, Bookmark } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'
import { useDirections } from '@/lib/hooks/useDirections'
import { useVoiceNavigation } from '@/lib/hooks/useVoiceNavigation'
import { formatDistance, formatDuration } from '@/lib/utils/distance'
import type { TransportMode, Route } from '@/lib/types'

const MODES: { key: TransportMode; icon: React.ReactNode; label: string }[] = [
  { key: 'driving',  icon: <Car size={15} />,           label: 'Drive' },
  { key: 'walking',  icon: <PersonStanding size={15} />, label: 'Walk'  },
  { key: 'cycling',  icon: <Bike size={15} />,           label: 'Cycle' },
]

const MANEUVER_ICONS: Record<string, string> = {
  turn: '↱', depart: '↑', arrive: '⚑', roundabout: '⟳',
  merge: '⤢', fork: '⑂', 'on ramp': '↗', 'off ramp': '↘',
}

function trafficInfo(incidents: number, delay?: number) {
  const extra = delay ? Math.round(delay / 60) : 0
  if (incidents === 0 && extra === 0) return { text: 'Clear roads', color: 'text-green-400' }
  if (incidents <= 2 && extra < 5)   return { text: extra > 0 ? `+${extra} min delay` : 'Light traffic', color: 'text-yellow-400' }
  if (incidents <= 5 && extra < 15)  return { text: `Moderate · +${extra} min`, color: 'text-orange-400' }
  return { text: `Heavy traffic · +${extra} min`, color: 'text-red-400' }
}

function rideShareEstimate(distanceM: number, durationS: number) {
  const km = distanceM / 1000
  const min = durationS / 60
  const uber = 2.0 + km * 1.5 + min * 0.25
  const lyft = 1.5 + km * 1.2 + min * 0.22
  return {
    uber: `$${uber.toFixed(0)}–$${(uber * 1.3).toFixed(0)}`,
    lyft: `$${lyft.toFixed(0)}–$${(lyft * 1.3).toFixed(0)}`,
  }
}

function AlternativeTab({ route, selected, onClick }: { route: Route; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center py-2.5 px-2 rounded-xl text-center transition-all ${
        selected ? 'bg-white text-black' : 'bg-white/8 text-gray-400 hover:bg-white/12 hover:text-white'
      }`}
    >
      <span className="text-xs font-semibold">{route.label}</span>
      <span className={`text-sm font-bold mt-0.5 ${selected ? 'text-black' : 'text-white'}`}>
        {formatDuration(route.duration)}
      </span>
      <span className="text-[10px] opacity-70">{formatDistance(route.distance)}</span>
    </button>
  )
}

export default function RouteCard() {
  const {
    route, routeAlternatives, selectedRouteIndex,
    origin, destination, waypoints,
    transportMode, setTransportMode,
    incidents, clearRoute, setSearchingFor, setShowWaypointManager,
    setIsSharing, shareSessionId, setShareSessionId, userLocation,
    savePlace, removeSavedPlace, savedPlaces,
  } = useMapStore()
  const { selectAlternative, fetchRoute } = useDirections()
  const [stepsOpen, setStepsOpen] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)

  useVoiceNavigation(voiceOn)

  if (!route) return null

  const traffic = trafficInfo(incidents.length, route.trafficDelay)
  const estimates = route.mode === 'driving' ? rideShareEstimate(route.distance, route.duration) : null
  const isDestSaved = destination ? savedPlaces.some(p => p.id === destination.id) : false

  const startSharing = async () => {
    if (!userLocation) return
    const id = Math.random().toString(36).slice(2, 10)
    await fetch(`/api/share/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: userLocation[0], lon: userLocation[1], name: 'My Location' }),
    })
    setShareSessionId(id)
    setIsSharing(true)
    const url = `${window.location.origin}?share=${id}`
    navigator.clipboard.writeText(url)
    useMapStore.getState().setToast({ message: 'Live location link copied! Sharing started.', type: 'success' })
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[600] px-3 bottom-card animate-slide-up">
      <div className="glass rounded-3xl overflow-hidden shadow-2xl">

        {/* Route header */}
        <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-white/8">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1 truncate">
              <span className="truncate max-w-[100px]">{origin?.name ?? 'My Location'}</span>
              {waypoints.map(wp => (
                <span key={wp.id} className="flex items-center gap-1">
                  <ArrowRight size={10} />
                  <span className="truncate max-w-[60px]">{wp.name}</span>
                </span>
              ))}
              <ArrowRight size={10} className="flex-shrink-0" />
              <span className="font-medium text-white truncate max-w-[120px]">{destination?.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-white">{formatDuration(route.duration)}</span>
              <div>
                <div className="text-sm text-gray-300">{formatDistance(route.distance)}</div>
                <div className={`text-xs font-medium flex items-center gap-1 ${traffic.color}`}>
                  {incidents.length > 0 && <TriangleAlert size={10} />}
                  {traffic.text}
                </div>
              </div>
            </div>

            {/* Ride-share estimates */}
            {estimates && (
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[11px] text-gray-500">Uber ~{estimates.uber}</span>
                <span className="text-[11px] text-gray-500">Lyft ~{estimates.lyft}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => setShowWaypointManager(true)}
              className="icon-btn w-9 h-9"
              title="Add stops"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={() => setVoiceOn(!voiceOn)}
              className={`icon-btn w-9 h-9 ${voiceOn ? 'text-blue-400 bg-blue-500/15' : ''}`}
              title={voiceOn ? 'Mute voice' : 'Voice navigation'}
            >
              {voiceOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
            {destination && (
              <button
                onClick={() => isDestSaved ? removeSavedPlace(destination.id) : savePlace(destination)}
                className={`icon-btn w-9 h-9 ${isDestSaved ? 'text-yellow-400 bg-yellow-500/15' : ''}`}
                title={isDestSaved ? 'Remove bookmark' : 'Save place'}
              >
                <Bookmark size={14} />
              </button>
            )}
            <button
              onClick={shareSessionId ? () => {
                setIsSharing(false); setShareSessionId(null)
                useMapStore.getState().setToast({ message: 'Location sharing stopped', type: 'info' })
              } : startSharing}
              className={`icon-btn w-9 h-9 ${shareSessionId ? 'text-green-400 bg-green-500/15' : ''}`}
              title={shareSessionId ? 'Stop sharing' : 'Share live location'}
            >
              <Share2 size={14} />
            </button>
            <button onClick={clearRoute} className="icon-btn w-9 h-9" title="Clear route">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Route alternatives */}
        {routeAlternatives.length > 1 && (
          <div className="flex gap-1.5 px-4 py-3 border-b border-white/8">
            {routeAlternatives.map((alt, i) => (
              <AlternativeTab
                key={i}
                route={alt}
                selected={selectedRouteIndex === i}
                onClick={() => selectAlternative(i)}
              />
            ))}
          </div>
        )}

        {/* Transport mode */}
        <div className="flex gap-1 px-4 py-3 border-b border-white/8">
          {MODES.map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => { setTransportMode(key); fetchRoute() }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all
                ${transportMode === key ? 'bg-white text-black' : 'bg-white/8 text-gray-400 hover:text-white'}`}
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
          <span className="text-sm font-medium text-gray-200">
            Turn-by-turn · {route.steps.length} steps
          </span>
          {stepsOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </button>

        {stepsOpen && (
          <div className="max-h-52 overflow-y-auto border-t border-white/8">
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
