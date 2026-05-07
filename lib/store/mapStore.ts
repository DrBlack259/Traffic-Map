import { create } from 'zustand'
import type { SearchResult, Route, TransportMode, MapStyle, TrafficIncident, POI, MeasurePoint } from '@/lib/types'

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
  transportMode: TransportMode
  route: Route | null
  directionsOpen: boolean
  isRoutingLoading: boolean

  trafficFlowVisible: boolean
  trafficIncidentsVisible: boolean
  incidents: TrafficIncident[]
  incidentsLoading: boolean

  sidebarOpen: boolean
  activeTab: 'map' | 'directions' | 'traffic' | 'places'
  nearbyPlaces: POI[]
  nearbyCategory: string
  userLocation: [number, number] | null
  measureMode: boolean
  measurePoints: MeasurePoint[]

  toast: { message: string; type: 'error' | 'success' | 'info' } | null

  setCenter: (center: [number, number]) => void
  setZoom: (zoom: number) => void
  setMapStyle: (style: MapStyle) => void
  setSearchQuery: (q: string) => void
  setSearchResults: (results: SearchResult[]) => void
  setSelectedPlace: (place: SearchResult | null) => void
  setIsSearching: (v: boolean) => void
  setOrigin: (place: SearchResult | null) => void
  setDestination: (place: SearchResult | null) => void
  setTransportMode: (mode: TransportMode) => void
  setRoute: (route: Route | null) => void
  setDirectionsOpen: (open: boolean) => void
  setIsRoutingLoading: (v: boolean) => void
  setTrafficFlowVisible: (v: boolean) => void
  setTrafficIncidentsVisible: (v: boolean) => void
  setIncidents: (incidents: TrafficIncident[]) => void
  setIncidentsLoading: (v: boolean) => void
  setSidebarOpen: (open: boolean) => void
  setActiveTab: (tab: 'map' | 'directions' | 'traffic' | 'places') => void
  setNearbyPlaces: (places: POI[]) => void
  setNearbyCategory: (cat: string) => void
  setUserLocation: (loc: [number, number] | null) => void
  setMeasureMode: (v: boolean) => void
  addMeasurePoint: (pt: MeasurePoint) => void
  clearMeasurePoints: () => void
  setToast: (toast: { message: string; type: 'error' | 'success' | 'info' } | null) => void
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
  transportMode: 'driving',
  route: null,
  directionsOpen: false,
  isRoutingLoading: false,

  trafficFlowVisible: true,
  trafficIncidentsVisible: true,
  incidents: [],
  incidentsLoading: false,

  sidebarOpen: true,
  activeTab: 'map',
  nearbyPlaces: [],
  nearbyCategory: '',
  userLocation: null,
  measureMode: false,
  measurePoints: [],

  toast: null,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),
  setMapStyle: (mapStyle) => set({ mapStyle }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSearchResults: (searchResults) => set({ searchResults }),
  setSelectedPlace: (selectedPlace) => set({ selectedPlace }),
  setIsSearching: (isSearching) => set({ isSearching }),
  setOrigin: (origin) => set({ origin }),
  setDestination: (destination) => set({ destination }),
  setTransportMode: (transportMode) => set({ transportMode }),
  setRoute: (route) => set({ route }),
  setDirectionsOpen: (directionsOpen) => set({ directionsOpen }),
  setIsRoutingLoading: (isRoutingLoading) => set({ isRoutingLoading }),
  setTrafficFlowVisible: (trafficFlowVisible) => set({ trafficFlowVisible }),
  setTrafficIncidentsVisible: (trafficIncidentsVisible) => set({ trafficIncidentsVisible }),
  setIncidents: (incidents) => set({ incidents }),
  setIncidentsLoading: (incidentsLoading) => set({ incidentsLoading }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setActiveTab: (activeTab) => set({ activeTab }),
  setNearbyPlaces: (nearbyPlaces) => set({ nearbyPlaces }),
  setNearbyCategory: (nearbyCategory) => set({ nearbyCategory }),
  setUserLocation: (userLocation) => set({ userLocation }),
  setMeasureMode: (measureMode) => set({ measureMode }),
  addMeasurePoint: (pt) => set((s) => ({ measurePoints: [...s.measurePoints, pt] })),
  clearMeasurePoints: () => set({ measurePoints: [] }),
  setToast: (toast) => set({ toast }),
}))
