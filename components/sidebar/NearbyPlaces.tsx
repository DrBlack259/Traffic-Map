'use client'
import { useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'
import type { POICategory } from '@/lib/types'

const CATEGORIES: { key: string; label: string; emoji: string; amenity: string }[] = [
  { key: 'restaurant', label: 'Food', emoji: '🍽', amenity: 'restaurant' },
  { key: 'cafe', label: 'Café', emoji: '☕', amenity: 'cafe' },
  { key: 'hospital', label: 'Health', emoji: '🏥', amenity: 'hospital' },
  { key: 'fuel', label: 'Fuel', emoji: '⛽', amenity: 'fuel' },
  { key: 'hotel', label: 'Hotel', emoji: '🏨', amenity: 'hotel' },
  { key: 'atm', label: 'ATM', emoji: '🏧', amenity: 'atm' },
  { key: 'parking', label: 'Parking', emoji: '🅿', amenity: 'parking' },
  { key: 'pharmacy', label: 'Pharmacy', emoji: '💊', amenity: 'pharmacy' },
]

export default function NearbyPlaces() {
  const { center, nearbyPlaces, setNearbyPlaces, nearbyCategory, setNearbyCategory, setToast } = useMapStore()
  const [loading, setLoading] = useState(false)

  const fetchPlaces = async (amenity: string) => {
    setNearbyCategory(amenity)
    setLoading(true)
    try {
      const res = await fetch(`/api/places?lat=${center[0]}&lon=${center[1]}&amenity=${amenity}&radius=1500`)
      const data = await res.json()
      setNearbyPlaces(data)
    } catch {
      setToast({ message: 'Could not load nearby places', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/8">
        <h2 className="text-sm font-semibold mb-3">Nearby Places</h2>
        <div className="grid grid-cols-4 gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => fetchPlaces(cat.amenity)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs transition-all
                ${nearbyCategory === cat.amenity ? 'bg-white/15 text-white' : 'glass text-gray-400 hover:text-white hover:bg-white/8'}`}
            >
              <span className="text-lg">{cat.emoji}</span>
              <span className="text-[10px]">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {loading && (
          <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Searching…</span>
          </div>
        )}

        {!loading && nearbyPlaces.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            <MapPin size={24} className="mx-auto text-gray-600 mb-2" />
            <p>Select a category to find<br />nearby places</p>
          </div>
        )}

        {!loading && nearbyPlaces.map((poi) => (
          <button
            key={poi.id}
            onClick={() => useMapStore.getState().setSelectedPlace({
              id: poi.id, name: poi.name, displayName: poi.name,
              lat: poi.lat, lon: poi.lon, type: poi.category,
            })}
            className="w-full text-left glass rounded-xl px-3 py-2.5 hover:bg-white/8 transition-colors flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center flex-shrink-0 text-sm">
              {CATEGORIES.find((c) => c.key === poi.category)?.emoji || '📍'}
            </div>
            <div className="min-w-0">
              <div className="text-sm text-white truncate">{poi.name}</div>
              <div className="text-xs text-gray-500 capitalize">{poi.category}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
