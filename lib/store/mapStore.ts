import { create } from 'zustand'
import type { SearchResult, Route, TransportMode, MapStyle, TrafficIncident, POI, MeasurePoint } from '@/lib/types'

function loadSaved(): SearchResult[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('traffic-map-saved') ?? '[]') } catch { return [] }
}

interface MapStore {
  center: [number, number]
  zoom: number
  mapStyle: MapStyle

  searchQuery: string
  searchResults: SearchResult[]
  selectedPlace: SearchResult | null
  isSearching: boolean

  origin: SearchResult | null
  destination: SearchResult | null
  waypoints: SearchResult[]
  transportMode: TransportMode
  route: Route | null
  routeAlternatives: Route[]
  selectedRouteIndex: number
  isRoutingLoading: boolean

  trafficFlowVisible: boolean
  trafficIncidentsVisible: boolean
  heatmapVisible: boolean
  incidents: TrafficIncident[]
  incidentsLoading: boolean

  nearbyPlaces: POI[]
  nearbyCategory: string
  userLocation: [number, number] | null
  measureMode: boolean
  measurePoints: MeasurePoint[]

  savedPlaces: SearchResult[]

  // UI flow
  searchingFor: 'destination' | 'origin' | 'waypoint' | null
  showLayerPicker: boolean
  showWaypointManager: boolean
  showAIAssistant: boolean

  // Live location sharing
  shareSessionId: string | null
  isSharing: boolean

  toast: { message: string; type: 'error' | 'success' | 'info' } | null

  // Legacy compat
  activeTab: 'map' | 'directions' | 'traffic' | 'places'
  sidebarOpen: boolean
  directionsOpen: boolean

  // Actions
  setCenter: (center: [number, number]) => void
  setZoom: (zoom: number) => void
  setMapStyle: (style: MapStyle) => void
  setSearchQuery: (q: string) => void
  setSearchResults: (results: SearchResult[]) => void
  setSelectedPlace: (place: SearchResult | null) => void
  setIsSearching: (v: boolean) => void
  setOrigin: (place: SearchResult | null) => void
  setDestination: (place: SearchResult | null) => void
  addWaypoint: (place: SearchResult) => void
  removeWaypoint: (id: string) => void
  setWaypoints: (places: SearchResult[]) => void
  setTransportMode: (mode: TransportMode) => void
  setRoute: (route: Route | null) => void
  setRouteAlternatives: (routes: Route[]) => void
  setSelectedRouteIndex: (i: number) => void
  setIsRoutingLoading: (v: boolean) => void
  setTrafficFlowVisible: (v: boolean) => void
  setTrafficIncidentsVisible: (v: boolean) => void
  setHeatmapVisible: (v: boolean) => void
  setIncidents: (incidents: TrafficIncident[]) => void
  setIncidentsLoading: (v: boolean) => void
  setNearbyPlaces: (places: POI[]) => void
  setNearbyCategory: (cat: string) => void
  setUserLocation: (loc: [number, number] | null) => void
  setMeasureMode: (v: boolean) => void
  addMeasurePoint: (pt: MeasurePoint) => void
  clearMeasurePoints: () => void
  savePlace: (place: SearchResult) => void
  removeSavedPlace: (id: string) => void
  setSearchingFor: (v: 'destination' | 'origin' | 'waypoint' | null) => void
  setShowLayerPicker: (v: boolean) => void
  setShowWaypointManager: (v: boolean) => void
  setShowAIAssistant: (v: boolean) => void
  setShareSessionId: (id: string | null) => void
  setIsSharing: (v: boolean) => void
  setToast: (toast: { message: string; type: 'error' | 'success' | 'info' } | null) => void
  clearRoute: () => void
  setActiveTab: (tab: 'map' | 'directions' | 'traffic' | 'places') => void
  setSidebarOpen: (v: boolean) => void
  setDirectionsOpen: (v: boolean) => void
}

export const useMapStore = create<MapStore>((set) => ({
  center: [48.8566, 2.3522],
  zoom: 13,
  mapStyle: 'dark',

  searchQuery: '',
  searchResults: [],
  selectedPlace: null,
  isSearching: false,

  origin: null,
  destination: null,
  waypoints: [],
  transportMode: 'driving',
  route: null,
  routeAlternatives: [],
  selectedRouteIndex: 0,
  isRoutingLoading: false,

  trafficFlowVisible: true,
  trafficIncidentsVisible: true,
  heatmapVisible: false,
  incidents: [],
  incidentsLoading: false,

  nearbyPlaces: [],
  nearbyCategory: '',
  userLocation: null,
  measureMode: false,
  measurePoints: [],

  savedPlaces: [],

  searchingFor: null,
  showLayerPicker: false,
  showWaypointManager: false,
  showAIAssistant: false,

  shareSessionId: null,
  isSharing: false,

  toast: null,

  activeTab: 'map',
  sidebarOpen: false,
  directionsOpen: false,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setMapStyle: (mapStyle) => set({ mapStyle }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setSelectedPlace: (selectedPlace) => set({ selectedPlace }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  addWaypoint: (place) => set((s) => ({ waypoints: [...s.waypoints, place] })),
  removeWaypoint: (id) => set((s) => ({ waypoints: s.waypoints.filter(w => w.id !== id) })),
  setWaypoints: (waypoints) => set({ waypoints }),
  setTransportMode: (transportMode) => set({ transportMode }),
  setRoute: (route) => set({ route }),
  setRouteAlternatives: (routeAlternatives) => set({ routeAlternatives }),
  setSelectedRouteIndex: (selectedRouteIndex) => set({ selectedRouteIndex }),
  setIsRoutingLoading: (isRoutingLoading) => set({ isRoutingLoading }),
  setTrafficFlowVisible: (trafficFlowVisible) => set({ trafficFlowVisible }),
  setTrafficIncidentsVisible: (trafficIncidentsVisible) => set({ trafficIncidentsVisible }),
  setHeatmapVisible: (heatmapVisible) => set({ heatmapVisible }),
  setIncidents: (incidents) => set({ incidents }),
  setIncidentsLoading: (incidentsLoading) => set({ incidentsLoading }),
  setNearbyPlaces: (nearbyPlaces) => set({ nearbyPlaces }),
  setNearbyCategory: (nearbyCategory) => set({ nearbyCategory }),
  setUserLocation: (userLocation) => set({ userLocation }),
  setMeasureMode: (measureMode) => set({ measureMode }),
  addMeasurePoint: (pt) => set((s) => ({ measurePoints: [...s.measurePoints, pt] })),
  clearMeasurePoints: () => set({ measurePoints: [] }),
  savePlace: (place) => set((s) => {
    if (s.savedPlaces.some(p => p.id === place.id)) return {}
    const updated = [place, ...s.savedPlaces].slice(0, 50)
    localStorage.setItem('traffic-map-saved', JSON.stringify(updated))
    return { savedPlaces: updated }
  }),
  removeSavedPlace: (id) => set((s) => {
    const updated = s.savedPlaces.filter(p => p.id !== id)
    localStorage.setItem('traffic-map-saved', JSON.stringify(updated))
    return { savedPlaces: updated }
  }),
  setSearchingFor: (searchingFor) => set({ searchingFor }),
  setShowLayerPicker: (showLayerPicker) => set({ showLayerPicker }),
  setShowWaypointManager: (showWaypointManager) => set({ showWaypointManager }),
  setShowAIAssistant: (showAIAssistant) => set({ showAIAssistant }),
  setShareSessionId: (shareSessionId) => set({ shareSessionId }),
  setIsSharing: (isSharing) => set({ isSharing }),
  setToast: (toast) => set({ toast }),
  clearRoute: () => set({
    route: null, routeAlternatives: [], selectedRouteIndex: 0,
    origin: null, destination: null, waypoints: [],
    searchResults: [], searchQuery: '',
  }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setDirectionsOpen: (directionsOpen) => set({ directionsOpen }),
}))

// Load saved places from localStorage after store is created (client-only)
if (typeof window !== 'undefined') {
  useMapStore.setState({ savedPlaces: loadSaved() })
}
