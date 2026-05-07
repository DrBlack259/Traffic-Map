'use client'
import { useMapStore } from '@/lib/store/mapStore'

export default function RoutingLoader() {
  const { isRoutingLoading } = useMapStore()
  if (!isRoutingLoading) return null

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[700] glass rounded-full px-5 py-2.5 flex items-center gap-3 shadow-xl animate-fade-in">
      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      <span className="text-sm text-gray-200">Calculating route…</span>
    </div>
  )
}
