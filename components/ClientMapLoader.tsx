'use client'
import dynamic from 'next/dynamic'

const MapApp = dynamic(() => import('@/components/MapApp'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-[#0d0d0d] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <p className="text-gray-400 text-sm">Loading Traffic Map…</p>
      </div>
    </div>
  ),
})

export default function ClientMapLoader() {
  return <MapApp />
}
