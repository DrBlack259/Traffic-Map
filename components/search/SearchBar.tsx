'use client'
import { useState, useRef, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'
import { useSearch } from '@/lib/hooks/useSearch'
import type { SearchResult } from '@/lib/types'

const RECENT_KEY = 'traffic-map-recent'

function getRecent(): SearchResult[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') } catch { return [] }
}
function saveRecent(place: SearchResult) {
  const existing = getRecent().filter((r) => r.id !== place.id)
  localStorage.setItem(RECENT_KEY, JSON.stringify([place, ...existing].slice(0, 5)))
}

export default function SearchBar() {
  const { searchQuery, setSearchQuery, searchResults, isSearching, setSelectedPlace, setSearchResults } = useMapStore()
  const { search } = useSearch()
  const [focused, setFocused] = useState(false)
  const [recent, setRecent] = useState<SearchResult[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setRecent(getRecent()) }, [focused])

  const handleChange = (v: string) => {
    setSearchQuery(v)
    search(v)
  }

  const handleSelect = (place: SearchResult) => {
    setSelectedPlace(place)
    setSearchQuery(place.displayName.split(',').slice(0, 2).join(','))
    setSearchResults([])
    setFocused(false)
    saveRecent(place)
    inputRef.current?.blur()
  }

  const handleClear = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedPlace(null)
    inputRef.current?.focus()
  }

  const showDropdown = focused && (searchResults.length > 0 || (!searchQuery && recent.length > 0))
  const items = searchQuery ? searchResults : recent

  return (
    <div className="relative">
      <div className={`flex items-center gap-2 glass rounded-xl px-3 py-2.5 transition-all ${focused ? 'ring-1 ring-white/20' : ''}`}>
        {isSearching ? (
          <Loader2 size={16} className="text-gray-400 flex-shrink-0 animate-spin" />
        ) : (
          <Search size={16} className="text-gray-400 flex-shrink-0" />
        )}
        <input
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder="Search places, addresses…"
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
        />
        {searchQuery && (
          <button onClick={handleClear} className="text-gray-500 hover:text-white">
            <X size={14} />
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute top-full mt-1 left-0 right-0 glass-darker rounded-xl overflow-hidden z-50 shadow-2xl animate-fade-in max-h-72 overflow-y-auto">
          {!searchQuery && <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wide">Recent</div>}
          {items.map((r) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r)}
              className="w-full text-left px-3 py-2.5 hover:bg-white/5 transition-colors flex items-start gap-3"
            >
              <div className="w-7 h-7 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Search size={12} className="text-gray-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm text-white truncate">{r.name}</div>
                <div className="text-xs text-gray-500 truncate">{r.displayName.split(',').slice(1, 3).join(',')}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
