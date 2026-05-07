'use client'
import { TriangleAlert, Loader2, RefreshCw } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'
import { useTraffic } from '@/lib/hooks/useTraffic'
import type { TrafficIncident } from '@/lib/types'

const TYPE_LABELS: Record<string, string> = {
  ACCIDENT: 'Accident',
  JAM: 'Traffic Jam',
  ROAD_CLOSED: 'Road Closed',
  ROAD_WORKS: 'Road Works',
  LANE_CLOSED: 'Lane Closed',
  FOG: 'Fog',
  RAIN: 'Rain',
  ICE: 'Ice',
  WIND: 'Strong Wind',
  FLOODING: 'Flooding',
  BROKEN_DOWN_VEHICLE: 'Broken Down Vehicle',
  DANGEROUS_CONDITIONS: 'Dangerous Conditions',
  OTHER_NEWS: 'Traffic Event',
}

const SEVERITY_COLORS = ['', 'text-yellow-400', 'text-orange-400', 'text-red-400', 'text-red-600']
const SEVERITY_BG = ['', 'bg-yellow-500/10', 'bg-orange-500/10', 'bg-red-500/10', 'bg-red-900/20']
const SEVERITY_LABELS = ['', 'Minor', 'Moderate', 'Major', 'Severe']

function IncidentCard({ inc }: { inc: TrafficIncident }) {
  return (
    <div className={`rounded-xl p-3 border border-white/8 ${SEVERITY_BG[inc.severity]}`}>
      <div className="flex items-start gap-3">
        <div className={`w-7 h-7 rounded-lg ${SEVERITY_BG[inc.severity]} border border-white/10 flex items-center justify-center flex-shrink-0`}>
          <TriangleAlert size={14} className={SEVERITY_COLORS[inc.severity]} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs font-semibold ${SEVERITY_COLORS[inc.severity]}`}>
              {SEVERITY_LABELS[inc.severity]}
            </span>
            <span className="text-xs text-gray-500">·</span>
            <span className="text-xs text-gray-400">{TYPE_LABELS[inc.type] || 'Incident'}</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">{inc.description}</p>
          {inc.roadName && <p className="text-xs text-gray-500 mt-1">{inc.roadName}</p>}
          {inc.delay && (
            <p className="text-xs text-amber-400 mt-1">+{Math.round(inc.delay / 60)} min delay</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TrafficPanel() {
  const { incidents, incidentsLoading, trafficFlowVisible, setTrafficFlowVisible, trafficIncidentsVisible, setTrafficIncidentsVisible } = useMapStore()
  const { fetchIncidents } = useTraffic()

  const sorted = [...incidents].sort((a, b) => b.severity - a.severity)

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-white/8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Live Traffic</h2>
          <button onClick={() => fetchIncidents()} className="icon-btn w-8 h-8" title="Refresh">
            <RefreshCw size={13} className={incidentsLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Layer toggles */}
        <div className="flex gap-2">
          <button
            onClick={() => setTrafficFlowVisible(!trafficFlowVisible)}
            className={`flex-1 text-xs py-1.5 rounded-lg transition-all ${trafficFlowVisible ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'glass text-gray-400'}`}
          >
            Flow Overlay
          </button>
          <button
            onClick={() => setTrafficIncidentsVisible(!trafficIncidentsVisible)}
            className={`flex-1 text-xs py-1.5 rounded-lg transition-all ${trafficIncidentsVisible ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'glass text-gray-400'}`}
          >
            Incidents
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {incidentsLoading && (
          <div className="flex items-center justify-center py-8 gap-2 text-gray-400">
            <Loader2 size={16} className="animate-spin" />
            <span className="text-sm">Loading incidents…</span>
          </div>
        )}

        {!incidentsLoading && sorted.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm space-y-2">
            <TriangleAlert size={24} className="mx-auto text-gray-600" />
            <p>No incidents in this area</p>
            <p className="text-xs text-gray-600">Add your TomTom API key in .env.local to enable live data</p>
          </div>
        )}

        {sorted.map((inc) => (
          <IncidentCard key={inc.id} inc={inc} />
        ))}
      </div>
    </div>
  )
}
