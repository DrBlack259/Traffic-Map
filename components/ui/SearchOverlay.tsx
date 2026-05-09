'use client'
import { useRef, useEffect, useState } from 'react'
import { ArrowLeft, Search, X, MapPin, Clock, Navigation, Bookmark } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'
import { useSearch } from '@/lib/hooks/useSearch'
import type { SearchResult } from '@/lib/types'

const RECENT_KEY = 'traffic-map-recent'
function getRecent(): SearchResult[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}
function saveRecent(place: SearchResult) {
  const existing = getRecent().filter((r) => r.id !== place.id)
  localStorage.setItem(RECENT_KEY, JSON.stringify([place, ...existing].slice(0, 8)))
}

export default function SearchOverlay() {
  const {
    searchingFor, setSearchingFor,
    searchQuery, setSearchQuery,
    searchResults, setSearchResults,
    isSearching,
    setDestination, setOrigin,
    userLocation, origin,
    savedPlaces,
  } = useMapStore()

  const { search } = useSearch()
  const inputRef = useRef<HTMLInputElement>(null)
  const [recent, setRecent] = useState<SearchResult[]>([])

  useEffect(() => {
    inputRef.current?.focus()
    setRecent(getRecent())
    return () => {
      setSearchQuery('')
      setSearchResults([])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (v: string) => {
    setSearchQuery(v)
    search(v)
  }

  const handleSelect = (place: SearchResult) => {
    saveRecent(place)
    if (searchingFor === 'destination') {
      setDestination(place)
    } else {
      setOrigin(place)
    }
    setSearchingFor(null)
  }

  const handleMyLocation = () => {
    if (!userLocation) return
    const myLoc: SearchResult = origin ?? {
      id: 'user-location',
      name: 'My Location',
      displayName: 'Current Location',
      lat: userLocation[0],
      lon: userLocation[1],
      type: 'location',
    }
    if (searchingFor === 'destination') setDestination(myLoc)
    else setOrigin(myLoc)
    setSearchingFor(null)
  }

  const items = searchQuery.trim() ? searchResults : recent
  const label = searchingFor === 'destination' ? 'Where to?' : 'Choose starting point'

  return (
    <div className="absolute inset-0 z-[800] bg-[#0d0d0d] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-safe pb-3 border-b border-white/8">
        <button
          onClick={() => setSearchingFor(null)}
          className="icon-btn flex-shrink-0"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex-1 flex items-center gap-3 glass rounded-xl px-4 py-3">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            value={searchQuery}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={label}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
          />
          {isSearching && (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          )}
          {searchQuery && !isSearching && (
            <button onClick={() => { setSearchQuery(''); setSearchResults([]) }}>
              <X size={14} className="text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {/* My Location shortcut */}
        {!searchQuery && userLocation && searchingFor === 'destination' && (
          <button
            onClick={handleMyLocation}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors border-b border-white/5"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Navigation size={18} className="text-blue-400" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-white">My Location</div>
              <div className="text-xs text-gray-500">Use your current location</div>
            </div>
          </button>
        )}

        {/* Saved places */}
        {!searchQuery && savedPlaces.length > 0 && (
          <>
            <div className="px-5 py-2 text-xs text-gray-500 uppercase tracking-wider font-medium">
              Saved
            </div>
            {savedPlaces.slice(0, 3).map((r) => (
              <button
                key={r.id}
                onClick={() => handleSelect(r)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-yellow-500/15 flex items-center justify-center flex-shrink-0">
                  <Bookmark size={16} className="text-yellow-400" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-sm font-medium text-white truncate">{r.name}</div>
                  <div className="text-xs text-gray-500 truncate">
                    {r.displayName.split(',').slice(1, 3).join(',').trim()}
                  </div>
                </div>
              </button>
            ))}
          </>
        )}

        {/* Section header */}
        {!searchQuery && recent.length > 0 && (
          <div className="px-5 py-2 text-xs text-gray-500 uppercase tracking-wider font-medium">
            Recent
          </div>
        )}

        {/* Place results */}
        {items.map((r) => (
          <button
            key={r.id}
            onClick={() => handleSelect(r)}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-white/8 flex items-center justify-center flex-shrink-0">
              {!searchQuery
                ? <Clock size={16} className="text-gray-400" />
                : <MapPin size={16} className="text-gray-400" />
              }
            </div>
            <div className="text-left min-w-0">
              <div className="text-sm font-medium text-white truncate">{r.name}</div>
              <div className="text-xs text-gray-500 truncate">
                {r.displayName.split(',').slice(1, 3).join(',').trim()}
              </div>
            </div>
          </button>
        ))}

        {searchQuery && !isSearching && items.length === 0 && (
          <div className="text-center py-16 text-gray-500 text-sm">
            No results for &ldquo;{searchQuery}&rdquo;
          </div>
        )}
      </div>
    </div>
  )
}
