'use client'
import { MapPin, Menu, X } from 'lucide-react'
import { useMapStore } from '@/lib/store/mapStore'

const TABS = [
  { key: 'map', label: 'Live Map' },
  { key: 'directions', label: 'Directions' },
  { key: 'traffic', label: 'Traffic' },
  { key: 'places', label: 'Places' },
] as const

export default function TopNav() {
  const { activeTab, setActiveTab, sidebarOpen, setSidebarOpen } = useMapStore()

  return (
    <header className="h-14 glass border-b border-white/8 flex items-center px-4 gap-4 flex-shrink-0 z-20">
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2">
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
          <MapPin size={16} className="text-white" />
        </div>
        <span className="font-semibold text-sm hidden sm:block">Traffic Map</span>
      </div>

      {/* Tabs */}
      <nav className="flex items-center gap-1 overflow-x-auto flex-1 scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSidebarOpen(true) }}
            className={`nav-pill ${activeTab === tab.key ? 'nav-pill-active' : 'nav-pill-inactive'}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Sidebar toggle */}
      <button
        className="icon-btn ml-auto flex-shrink-0"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        title="Toggle sidebar"
      >
        {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
      </button>
    </header>
  )
}
