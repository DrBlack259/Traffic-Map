'use client'
import { useState } from 'react'
import { useMapStore } from '@/lib/store/mapStore'
import Sidebar from '@/components/sidebar/Sidebar'

export default function BottomSheet() {
  const [expanded, setExpanded] = useState(false)
  const { activeTab } = useMapStore()

  if (activeTab === 'map') return null

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-[600]
        glass border-t border-white/10 rounded-t-2xl
        transition-all duration-300 ease-out
        ${expanded ? 'h-[75vh]' : 'h-[40vh]'}
      `}
    >
      {/* Drag handle */}
      <div
        className="flex justify-center pt-3 pb-2 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-10 h-1 bg-white/20 rounded-full" />
      </div>
      <div className="overflow-y-auto h-full pb-8">
        <Sidebar />
      </div>
    </div>
  )
}
