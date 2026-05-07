'use client'
import { Search, Menu } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'

export default function FloatingSearchBar() {
  const { route, destination, setSearchingFor, setShowLayerPicker, showLayerPicker } = useMapStore()

  // Hide when route card is showing — route card has its own header
  if (route) return null

  const label = destination?.name ?? 'Where are you going?'
  const isPlaceholder = !destination

  return (
    <div className="absolute top-4 left-4 right-4 z-[600] flex items-center gap-2">
      <button
        onClick={() => setSearchingFor('destination')}
        className="flex-1 flex items-center gap-3 glass rounded-2xl px-4 py-3.5 shadow-2xl"
      >
        <Search size={18} className="text-gray-400 flex-shrink-0" />
        <span className={`flex-1 text-left text-sm ${isPlaceholder ? 'text-gray-500' : 'text-white font-medium'}`}>
          {label}
        </span>
      </button>

      <button
        onClick={() => setShowLayerPicker(!showLayerPicker)}
        className="icon-btn w-12 h-12 rounded-2xl shadow-2xl flex-shrink-0"
        title="Map layers"
      >
        <Menu size={18} />
      </button>
    </div>
  )
}
