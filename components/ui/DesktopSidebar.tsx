'use client'
import { useState, useRef, useEffect } from 'react'
import {
  Search, X, MapPin, Clock, Bookmark, Navigation, Car, PersonStanding, Bike,
  ArrowRight, TriangleAlert, Volume2, VolumeX, Share2, Plus, ChevronDown,
  ChevronUp, Bot, Send, Loader2, Layers, Flame, Globe, Map as MapIcon,
} from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'
import { useSearch } from '@/lib/hooks/useSearch'
import { useDirections } from '@/lib/hooks/useDirections'
import { useVoiceNavigation } from '@/lib/hooks/useVoiceNavigation'
import { useGeolocation } from '@/lib/hooks/useGeolocation'
import { formatDistance, formatDuration } from '@/lib/utils/distance'
import type { SearchResult, TransportMode, Route } from '@/lib/types'

// ─── Local helpers ────────────────────────────────────────────────────────────

const MODES: { key: TransportMode; icon: React.ReactNode; label: string }[] = [
  { key: 'driving', icon: <Car size={14} />, label: 'Drive' },
  { key: 'walking', icon: <PersonStanding size={14} />, label: 'Walk' },
  { key: 'cycling', icon: <Bike size={14} />, label: 'Cycle' },
]

const MANEUVER_ICONS: Record<string, string> = {
  turn: '↱', depart: '↑', arrive: '⚑', roundabout: '⟳',
  merge: '⤢', fork: '⑂', 'on ramp': '↗', 'off ramp': '↘',
}

const RECENT_KEY = 'traffic-map-recent'
function getRecent(): SearchResult[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}
function saveRecent(p: SearchResult) {
  const prev = getRecent().filter(r => r.id !== p.id)
  localStorage.setItem(RECENT_KEY, JSON.stringify([p, ...prev].slice(0, 8)))
}

function trafficInfo(count: number, delay?: number) {
  const extra = delay ? Math.round(delay / 60) : 0
  if (count === 0 && extra === 0) return { text: 'Clear roads', color: 'text-green-400' }
  if (count <= 2 && extra < 5)   return { text: extra > 0 ? `+${extra} min` : 'Light traffic', color: 'text-yellow-400' }
  if (count <= 5 && extra < 15)  return { text: `Moderate · +${extra} min`, color: 'text-orange-400' }
  return { text: `Heavy · +${extra} min`, color: 'text-red-400' }
}

function rideShare(distM: number, durS: number) {
  const km = distM / 1000; const min = durS / 60
  const uber = 2.0 + km * 1.5 + min * 0.25
  const lyft = 1.5 + km * 1.2 + min * 0.22
  return { uber: `$${uber.toFixed(0)}–$${(uber * 1.3).toFixed(0)}`, lyft: `$${lyft.toFixed(0)}–$${(lyft * 1.3).toFixed(0)}` }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AltTab({ route, selected, onClick }: { route: Route; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl text-center text-xs transition-all ${
        selected ? 'bg-white text-black' : 'bg-white/8 text-gray-400 hover:bg-white/12 hover:text-white'
      }`}
    >
      <span className="font-semibold truncate w-full text-center">{route.label}</span>
      <span className={`font-bold mt-0.5 ${selected ? 'text-black' : 'text-white'}`}>{formatDuration(route.duration)}</span>
      <span className="opacity-60 text-[10px]">{formatDistance(route.distance)}</span>
    </button>
  )
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────

interface Msg { role: 'user' | 'assistant'; content: string }

function AIChat() {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || streaming) return
    setInput('')
    const newMsgs = [...messages, { role: 'user' as const, content: text }]
    setMessages([...newMsgs, { role: 'assistant', content: '' }])
    setStreaming(true)

    const store = useMapStore.getState()
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMsgs,
          context: {
            route: store.route ? {
              origin: store.origin?.name ?? 'Unknown',
              destination: store.destination?.name ?? 'Unknown',
              distance: formatDistance(store.route.distance),
              duration: formatDuration(store.route.duration),
              mode: store.route.mode,
            } : null,
            incidents: store.incidents.slice(0, 5).map(i => `${i.type} on ${i.roadName ?? 'road'}`),
            location: store.userLocation
              ? `${store.userLocation[0].toFixed(4)}, ${store.userLocation[1].toFixed(4)}`
              : null,
          },
        }),
      })
      const reader = res.body!.getReader()
      const dec = new TextDecoder()
      let text2 = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        for (const line of dec.decode(value, { stream: true }).split('\n')) {
          if (!line.startsWith('data: ')) continue
          const p = line.slice(6)
          if (p === '[DONE]') break
          try { text2 += JSON.parse(p).text } catch { /* */ }
          setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content: text2 }; return u })
        }
      }
    } catch {
      setMessages(prev => { const u = [...prev]; u[u.length - 1] = { role: 'assistant', content: 'Connection error. Check ANTHROPIC_API_KEY.' }; return u })
    } finally { setStreaming(false) }
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto p-3 space-y-2 sidebar-scroll min-h-0">
        {messages.length === 0 && (
          <div className="space-y-1.5">
            {['What\'s traffic like?', 'Gas stations nearby?', 'Fastest route?'].map(q => (
              <button key={q} onClick={() => setInput(q)}
                className="w-full text-left px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-gray-300 transition-colors">
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[88%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
              m.role === 'user' ? 'bg-white text-black rounded-br-sm' : 'bg-white/8 text-gray-200 rounded-bl-sm'
            }`}>
              {m.content || (streaming && i === messages.length - 1
                ? <Loader2 size={12} className="animate-spin text-gray-400" />
                : null)}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex items-center gap-2 px-3 py-2 border-t border-white/8 flex-shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Ask about your route…"
          className="flex-1 bg-transparent text-xs text-white placeholder-gray-500 outline-none"
        />
        <button onClick={send} disabled={!input.trim() || streaming}
          className="icon-btn w-8 h-8 disabled:opacity-30 flex-shrink-0">
          <Send size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Main sidebar ─────────────────────────────────────────────────────────────

export default function DesktopSidebar() {
  const {
    origin, destination, waypoints, route, routeAlternatives, selectedRouteIndex,
    transportMode, setTransportMode,
    incidents, clearRoute, setSearchingFor, setShowWaypointManager,
    shareSessionId, setIsSharing, setShareSessionId, userLocation,
    savedPlaces, savePlace, removeSavedPlace,
    searchQuery, setSearchQuery, searchResults, setSearchResults, isSearching,
    showAIAssistant, setShowAIAssistant,
    heatmapVisible, setHeatmapVisible,
    showLayerPicker, setShowLayerPicker,
    viewMode, setViewMode,
    mapStyle, setMapStyle,
  } = useMapStore()

  const { search } = useSearch()
  const { selectAlternative, fetchRoute } = useDirections()
  const { locate } = useGeolocation()
  const [stepsOpen, setStepsOpen] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [recent, setRecent] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useVoiceNavigation(voiceOn)

  useEffect(() => { if (searchOpen) setRecent(getRecent()) }, [searchOpen])

  const handleSearchFocus = () => { setSearchOpen(true); setRecent(getRecent()) }
  const handleSearchChange = (v: string) => { setSearchQuery(v); search(v) }

  const handleSelect = (place: SearchResult) => {
    saveRecent(place)
    setSearchQuery('')
    setSearchResults([])
    setSearchOpen(false)
    setDestination(place)
  }

  // Need setDestination from store
  const setDestination = useMapStore(s => s.setDestination)

  const traffic = route ? trafficInfo(incidents.length, route.trafficDelay) : null
  const estimates = route?.mode === 'driving' ? rideShare(route.distance, route.duration) : null
  const isDestSaved = destination ? savedPlaces.some(p => p.id === destination.id) : false

  const startSharing = async () => {
    if (!userLocation) return
    const id = Math.random().toString(36).slice(2, 10)
    await fetch(`/api/share/${id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat: userLocation[0], lon: userLocation[1], name: 'My Location' }),
    })
    setShareSessionId(id); setIsSharing(true)
    navigator.clipboard.writeText(`${window.location.origin}?share=${id}`)
    useMapStore.getState().setToast({ message: 'Live link copied!', type: 'success' })
  }

  const searchItems = searchQuery.trim() ? searchResults : recent

  return (
    <aside className="hidden lg:flex flex-col w-[340px] xl:w-[380px] h-full glass-solid flex-shrink-0 z-[600]">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-3 border-b border-white/8 flex-shrink-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
            <MapPin size={14} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">Traffic Map</span>
          <div className="flex-1" />
          {/* 2D / 3D toggle */}
          <button
            onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
            className={`icon-btn w-8 h-8 text-[10px] font-bold flex-col gap-0 ${viewMode === '3d' ? 'bg-white text-black' : ''}`}
            title={viewMode === '3d' ? 'Switch to 2D' : 'Switch to 3D globe'}
          >
            {viewMode === '3d' ? <MapIcon size={13} /> : <Globe size={13} />}
          </button>
          <button
            onClick={locate}
            className="icon-btn w-8 h-8 bg-white text-black hover:bg-gray-100"
            title="My location"
          >
            <Navigation size={14} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-white/8 rounded-xl px-3 py-2.5 border border-white/8">
            <Search size={15} className="text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={e => handleSearchChange(e.target.value)}
              onFocus={handleSearchFocus}
              placeholder="Search places, addresses…"
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
            />
            {isSearching && <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin flex-shrink-0" />}
            {searchQuery && !isSearching && (
              <button onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchOpen(false) }}>
                <X size={13} className="text-gray-500" />
              </button>
            )}
          </div>

          {/* Search dropdown */}
          {searchOpen && (searchItems.length > 0 || !searchQuery) && (
            <div className="absolute top-full left-0 right-0 mt-1 glass rounded-xl overflow-hidden z-10 shadow-2xl max-h-64 overflow-y-auto sidebar-scroll">
              {!searchQuery && savedPlaces.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wider">Saved</div>
                  {savedPlaces.slice(0, 2).map(r => (
                    <button key={r.id} onClick={() => handleSelect(r)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors">
                      <Bookmark size={13} className="text-yellow-400 flex-shrink-0" />
                      <span className="text-sm text-white truncate">{r.name}</span>
                    </button>
                  ))}
                </>
              )}
              {!searchQuery && recent.length > 0 && (
                <div className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wider">Recent</div>
              )}
              {searchItems.map(r => (
                <button key={r.id} onClick={() => handleSelect(r)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-colors">
                  {searchQuery ? <MapPin size={13} className="text-gray-400 flex-shrink-0" /> : <Clock size={13} className="text-gray-400 flex-shrink-0" />}
                  <div className="text-left min-w-0">
                    <div className="text-sm text-white truncate">{r.name}</div>
                    <div className="text-[11px] text-gray-500 truncate">{r.displayName.split(',').slice(1, 3).join(',').trim()}</div>
                  </div>
                </button>
              ))}
              {searchQuery && !isSearching && searchItems.length === 0 && (
                <div className="px-3 py-4 text-xs text-gray-500 text-center">No results for &ldquo;{searchQuery}&rdquo;</div>
              )}
            </div>
          )}
        </div>

        {/* Transport mode */}
        <div className="flex gap-1.5 mt-2.5">
          {MODES.map(({ key, icon, label }) => (
            <button key={key}
              onClick={() => { setTransportMode(key); if (route) fetchRoute() }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all
                ${transportMode === key ? 'bg-white text-black' : 'bg-white/8 text-gray-400 hover:text-white'}`}>
              {icon}{label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable body ─────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto sidebar-scroll min-h-0">

        {/* No route — where-to prompt */}
        {!route && (
          <div className="p-4">
            {origin && (
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                <span className="text-xs text-gray-400 truncate">{origin.name}</span>
              </div>
            )}
            <button
              onClick={() => setSearchingFor('destination')}
              className="w-full flex items-center gap-3 bg-white/8 hover:bg-white/12 transition-colors rounded-xl px-4 py-3.5 mb-3"
            >
              <Search size={16} className="text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-400">Where to?</span>
            </button>

            {/* Quick categories */}
            <div className="flex flex-wrap gap-2">
              {['Restaurant', 'Hospital', 'Fuel', 'Hotel', 'ATM', 'Parking'].map(cat => (
                <button key={cat}
                  onClick={() => { setSearchingFor('destination'); useMapStore.getState().setSearchQuery(cat) }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 text-gray-300 text-xs hover:bg-white/15 transition-colors">
                  <MapPin size={10} />{cat}
                </button>
              ))}
            </div>

            {/* Saved places */}
            {savedPlaces.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider px-1 mb-2">Saved places</p>
                {savedPlaces.map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-1 py-2 hover:bg-white/5 rounded-xl transition-colors">
                    <Bookmark size={13} className="text-yellow-400 flex-shrink-0" />
                    <button className="flex-1 text-left" onClick={() => setDestination(p)}>
                      <div className="text-sm text-white truncate">{p.name}</div>
                    </button>
                    <button onClick={() => removeSavedPlace(p.id)} className="icon-btn w-6 h-6 flex-shrink-0">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active route */}
        {route && (
          <div>
            {/* Route header */}
            <div className="px-4 py-3 border-b border-white/8">
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5 truncate">
                <span className="truncate max-w-[80px]">{origin?.name ?? 'My Location'}</span>
                {waypoints.map(wp => (
                  <span key={wp.id} className="flex items-center gap-1">
                    <ArrowRight size={9} />
                    <span className="truncate max-w-[50px]">{wp.name}</span>
                  </span>
                ))}
                <ArrowRight size={9} className="flex-shrink-0" />
                <span className="font-medium text-white truncate">{destination?.name}</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-white">{formatDuration(route.duration)}</span>
                    <span className="text-sm text-gray-400">{formatDistance(route.distance)}</span>
                  </div>
                  {traffic && (
                    <div className={`flex items-center gap-1 text-xs font-medium mt-0.5 ${traffic.color}`}>
                      {incidents.length > 0 && <TriangleAlert size={10} />}
                      {traffic.text}
                    </div>
                  )}
                  {estimates && (
                    <div className="flex gap-3 mt-1">
                      <span className="text-[11px] text-gray-500">Uber ~{estimates.uber}</span>
                      <span className="text-[11px] text-gray-500">Lyft ~{estimates.lyft}</span>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-1.5 flex-shrink-0">
                  <button onClick={() => setShowWaypointManager(true)} className="icon-btn w-8 h-8" title="Add stops">
                    <Plus size={13} />
                  </button>
                  <button
                    onClick={() => setVoiceOn(!voiceOn)}
                    className={`icon-btn w-8 h-8 ${voiceOn ? 'text-blue-400 bg-blue-500/15' : ''}`}
                    title="Voice navigation"
                  >
                    {voiceOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
                  </button>
                  {destination && (
                    <button
                      onClick={() => isDestSaved ? removeSavedPlace(destination.id) : savePlace(destination)}
                      className={`icon-btn w-8 h-8 ${isDestSaved ? 'text-yellow-400 bg-yellow-500/15' : ''}`}
                    >
                      <Bookmark size={13} />
                    </button>
                  )}
                  <button
                    onClick={shareSessionId
                      ? () => { setIsSharing(false); setShareSessionId(null); useMapStore.getState().setToast({ message: 'Sharing stopped', type: 'info' }) }
                      : startSharing}
                    className={`icon-btn w-8 h-8 ${shareSessionId ? 'text-green-400 bg-green-500/15' : ''}`}
                    title="Share location"
                  >
                    <Share2 size={13} />
                  </button>
                  <button onClick={clearRoute} className="icon-btn w-8 h-8" title="Clear route">
                    <X size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Alternatives */}
            {routeAlternatives.length > 1 && (
              <div className="flex gap-1.5 px-4 py-2.5 border-b border-white/8">
                {routeAlternatives.map((alt, i) => (
                  <AltTab key={i} route={alt} selected={selectedRouteIndex === i} onClick={() => selectAlternative(i)} />
                ))}
              </div>
            )}

            {/* Change destination */}
            <button
              onClick={() => setSearchingFor('destination')}
              className="w-full flex items-center gap-2 px-4 py-2.5 border-b border-white/8 text-xs text-gray-400 hover:bg-white/5 transition-colors"
            >
              <Search size={12} />Change destination
            </button>

            {/* Turn-by-turn */}
            <button
              onClick={() => setStepsOpen(!stepsOpen)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <span className="text-xs font-medium text-gray-300">Turn-by-turn · {route.steps.length} steps</span>
              {stepsOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
            </button>
            {stepsOpen && (
              <div className="border-t border-white/8">
                {route.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-2.5 border-b border-white/5 last:border-0">
                    <span className="text-gray-400 text-sm w-4 text-center flex-shrink-0 mt-0.5">
                      {MANEUVER_ICONS[step.maneuver] ?? '→'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-white">{step.instruction}</div>
                      {step.name && <div className="text-[10px] text-gray-500 mt-0.5">{step.name}</div>}
                    </div>
                    <div className="text-[10px] text-gray-500 flex-shrink-0">{formatDistance(step.distance)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map controls section */}
        <div className="px-4 py-3 border-t border-white/8 mt-auto">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2.5">Map Options</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setHeatmapVisible(!heatmapVisible)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs transition-colors ${
                heatmapVisible ? 'bg-orange-500/20 text-orange-300' : 'bg-white/8 text-gray-400 hover:text-white'
              }`}
            >
              <Flame size={12} />Heatmap
            </button>
            {['dark', 'satellite', 'street', 'terrain'].map(s => (
              <button key={s}
                onClick={() => setMapStyle(s as 'dark' | 'satellite' | 'street' | 'terrain')}
                className={`px-3 py-1.5 rounded-xl text-xs transition-colors capitalize ${
                  mapStyle === s ? 'bg-white text-black' : 'bg-white/8 text-gray-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── AI Assistant ────────────────────────────────────── */}
      {showAIAssistant && (
        <div className="border-t border-white/8 flex flex-col flex-shrink-0" style={{ height: '280px' }}>
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/8 flex-shrink-0">
            <Bot size={14} className="text-violet-400" />
            <span className="text-xs font-medium text-white">AI Assistant</span>
            <span className="text-[10px] text-gray-500 flex-1">Claude</span>
            <button onClick={() => setShowAIAssistant(false)} className="icon-btn w-6 h-6"><X size={11} /></button>
          </div>
          <AIChat />
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-white/8 flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setShowAIAssistant(!showAIAssistant)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs transition-colors ${
            showAIAssistant ? 'bg-violet-500/20 text-violet-300' : 'bg-white/8 text-gray-400 hover:text-white'
          }`}
        >
          <Bot size={13} />AI Assistant
        </button>
      </div>
    </aside>
  )
}
