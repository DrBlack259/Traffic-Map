'use client'
import { useMapStore } from '@/lib/store/mapStore'
import SearchBar from '@/components/search/SearchBar'
import DirectionsPanel from '@/components/directions/DirectionsPanel'
import TrafficPanel from './TrafficPanel'
import NearbyPlaces from './NearbyPlaces'
import PlaceCard from './PlaceCard'

export default function Sidebar() {
  const { activeTab, selectedPlace } = useMapStore()

  return (
    <div className="flex flex-col h-full">
      {activeTab === 'map' && (
        <div className="flex flex-col gap-3 p-4 overflow-y-auto">
          <SearchBar />
          {selectedPlace && <PlaceCard />}
          {!selectedPlace && (
            <div className="text-center py-8 text-gray-500 text-sm">
              <p>Search for a place or click the map</p>
            </div>
          )}
        </div>
      )}
      {activeTab === 'directions' && <DirectionsPanel />}
      {activeTab === 'traffic' && <TrafficPanel />}
      {activeTab === 'places' && <NearbyPlaces />}
    </div>
  )
}
