'use client'
import { Search, MapPin, Car, PersonStanding, Bike } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'
import type { TransportMode } from '@/lib/types'

const MODES: { key: TransportMode; icon: React.ReactNode; label: string }[] = [
  { key: 'driving',  icon: <Car size={18} />,           label: 'Drive' },
  { key: 'walking',  icon: <PersonStanding size={18} />, label: 'Walk'  },
  { key: 'cycling',  icon: <Bike size={18} />,           label: 'Cycle' },
]

export default function WhereToCard() {
  const { origin, transportMode, setTransportMode, setSearchingFor } = useMapStore()

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[600] px-4 pb-6 animate-slide-up">
      <div className="glass rounded-3xl p-5 shadow-2xl">

        {/* Origin label */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 rounded-full bg-blue-400 flex-shrink-0" />
          <span className="text-sm text-gray-300 truncate">
            {origin?.name ?? 'My Location'}
          </span>
        </div>

        {/* Big "Where to?" button */}
        <button
          onClick={() => setSearchingFor('destination')}
          className="w-full flex items-center gap-3 bg-white/10 hover:bg-white/15 transition-colors rounded-2xl px-4 py-4 mb-4"
        >
          <Search size={18} className="text-gray-400 flex-shrink-0" />
          <span className="text-base text-gray-400 font-medium">Where to?</span>
        </button>

        {/* Transport mode */}
        <div className="flex gap-2">
          {MODES.map(({ key, icon, label }) => (
            <button
              key={key}
              onClick={() => setTransportMode(key)}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all
                ${transportMode === key
                  ? 'bg-white text-black'
                  : 'bg-white/8 text-gray-400 hover:text-white hover:bg-white/12'}`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>

        {/* Quick place chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {['Restaurant', 'Hospital', 'Fuel', 'Hotel', 'ATM'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                useMapStore.getState().setSearchingFor('destination')
                useMapStore.getState().setSearchQuery(cat)
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 text-gray-300 text-xs whitespace-nowrap hover:bg-white/15 transition-colors"
            >
              <MapPin size={11} />
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
