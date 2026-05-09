'use client'
import dynamic from 'next/dynamic'

const Globe3DView = dynamic(() => import('./Globe3DView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0d0d0d]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        <span className="text-xs text-gray-500">Loading 3D globe…</span>
      </div>
    </div>
  ),
})

export default Globe3DView
