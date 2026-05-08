'use client'
import { useEffect, useRef, useState } from 'react'
import { MapPin, X, Navigation, Signal } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'

interface SharedLocation {
  lat: number
  lon: number
  name: string
  speed?: number
  heading?: number
  updatedAt: number
}

interface Props {
  shareId: string
  onClose: () => void
}

export default function LocationShareViewer({ shareId, onClose }: Props) {
  const [location, setLocation] = useState<SharedLocation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const esRef = useRef<EventSource | null>(null)
  const { setCenter, setZoom } = useMapStore()

  useEffect(() => {
    const es = new EventSource(`/api/share/${shareId}`)
    esRef.current = es

    es.onopen = () => setConnected(true)

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data) as SharedLocation & { error?: string }
        if (data.error) {
          setError(data.error === 'session_not_found' ? 'Session not found' : 'Session expired')
          es.close()
          return
        }
        setLocation(data)
        setCenter([data.lat, data.lon])
        setZoom(15)
      } catch {
        // ignore parse errors
      }
    }

    es.onerror = () => {
      setConnected(false)
      setError('Connection lost')
    }

    return () => { es.close() }
  }, [shareId, setCenter, setZoom])

  const secondsAgo = location ? Math.round((Date.now() - location.updatedAt) / 1000) : null

  return (
    <div className="absolute bottom-0 left-0 right-0 z-[600] px-3 pb-5 animate-slide-up">
      <div className="glass rounded-3xl overflow-hidden shadow-2xl">
        <div className="flex items-center gap-3 px-5 py-4">
          {/* Status dot */}
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
            connected ? 'bg-green-400' : 'bg-red-400'
          }`} />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <MapPin size={13} className="text-gray-400 flex-shrink-0" />
              <span className="text-sm font-semibold text-white truncate">
                {location?.name ?? 'Connecting…'}
              </span>
            </div>

            {location && (
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-gray-400">
                  {secondsAgo !== null && secondsAgo < 60
                    ? `Updated ${secondsAgo}s ago`
                    : `${location.lat.toFixed(5)}, ${location.lon.toFixed(5)}`}
                </span>
                {location.speed !== undefined && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Navigation size={10} />
                    {Math.round(location.speed * 3.6)} km/h
                  </span>
                )}
              </div>
            )}

            {error && (
              <span className="text-xs text-red-400 mt-0.5">{error}</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {connected && !error && (
              <Signal size={14} className="text-green-400" />
            )}
            <button onClick={onClose} className="icon-btn w-8 h-8">
              <X size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
