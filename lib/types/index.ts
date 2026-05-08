export interface SearchResult {
  id: string
  name: string
  displayName: string
  lat: number
  lon: number
  type: string
  address?: {
    road?: string
    city?: string
    country?: string
    postcode?: string
    state?: string
  }
}

export interface RouteStep {
  instruction: string
  distance: number
  duration: number
  maneuver: string
  name: string
}

export interface Route {
  geometry: GeoJSON.LineString
  distance: number
  duration: number
  steps: RouteStep[]
  mode: TransportMode
  index?: number          // alternative index
  label?: string          // "Fastest", "Shortest", "Alternative"
  trafficDelay?: number   // extra seconds from traffic
}

export type TransportMode = 'driving' | 'walking' | 'cycling'

export type MapStyle = 'dark' | 'street' | 'satellite' | 'terrain'

export interface TrafficIncident {
  id: string
  type: 'ACCIDENT' | 'FOG' | 'DANGEROUS_CONDITIONS' | 'RAIN' | 'ICE' | 'JAM' | 'LANE_CLOSED' | 'ROAD_CLOSED' | 'ROAD_WORKS' | 'WIND' | 'FLOODING' | 'OTHER_NEWS' | 'BROKEN_DOWN_VEHICLE'
  severity: 1 | 2 | 3 | 4
  description: string
  lat: number
  lon: number
  delay?: number
  roadName?: string
  from?: string
  to?: string
  startTime?: string
  endTime?: string
}

export interface POI {
  id: string
  name: string
  category: POICategory
  lat: number
  lon: number
  distance?: number
  tags?: Record<string, string>
}

export type POICategory =
  | 'restaurant'
  | 'hospital'
  | 'fuel'
  | 'hotel'
  | 'atm'
  | 'parking'
  | 'pharmacy'
  | 'school'
  | 'cafe'
  | 'supermarket'

export interface MeasurePoint {
  lat: number
  lon: number
}

export interface ShareSession {
  id: string
  lat: number
  lon: number
  name: string
  speed?: number
  heading?: number
  updatedAt: number
}
