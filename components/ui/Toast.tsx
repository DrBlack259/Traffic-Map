'use client'
import { useEffect } from 'react'
import { X, CircleAlert, CircleCheck, Info } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'

export default function Toast() {
  const { toast, setToast } = useMapStore()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast, setToast])

  if (!toast) return null

  const icons = {
    error: <CircleAlert size={16} className="text-red-400 flex-shrink-0" />,
    success: <CircleCheck size={16} className="text-green-400 flex-shrink-0" />,
    info: <Info size={16} className="text-blue-400 flex-shrink-0" />,
  }

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in">
      <div className="glass-darker rounded-xl px-4 py-3 flex items-center gap-3 max-w-sm shadow-2xl">
        {icons[toast.type]}
        <span className="text-sm text-gray-200">{toast.message}</span>
        <button onClick={() => setToast(null)} className="text-gray-500 hover:text-white ml-1">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
