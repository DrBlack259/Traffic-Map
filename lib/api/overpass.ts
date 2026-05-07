import type { POI, POICategory } from '@/lib/types'

export const AMENITY_MAP: Record<string, POICategory> = {
  restaurant: 'restaurant',
  fast_food: 'restaurant',
  cafe: 'cafe',
  hospital: 'hospital',
  clinic: 'hospital',
  fuel: 'fuel',
  hotel: 'hotel',
  motel: 'hotel',
  guest_house: 'hotel',
  atm: 'atm',
  bank: 'atm',
  parking: 'parking',
  pharmacy: 'pharmacy',
  school: 'school',
  university: 'school',
  supermarket: 'supermarket',
}

export function buildOverpassQuery(lat: number, lon: number, radius: number, amenity: string): string {
  return `[out:json][timeout:10];
(
  node(around:${radius},${lat},${lon})[amenity=${amenity}];
  way(around:${radius},${lat},${lon})[amenity=${amenity}];
);
out center 20;`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseOverpassResult(data: any, category: POICategory): POI[] {
  if (!data?.elements) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.elements.map((el: any): POI => ({
    id: String(el.id),
    name: el.tags?.name || el.tags?.amenity || category,
    category,
    lat: el.lat ?? el.center?.lat ?? 0,
    lon: el.lon ?? el.center?.lon ?? 0,
    tags: el.tags,
  }))
}
