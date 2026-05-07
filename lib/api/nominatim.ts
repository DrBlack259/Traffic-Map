import type { SearchResult } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseNominatimResult(item: any): SearchResult {
  return {
    id: String(item.place_id),
    name: item.name || item.display_name.split(',')[0],
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    type: item.type || item.class || 'place',
    address: item.address
      ? {
          road: item.address.road,
          city: item.address.city || item.address.town || item.address.village,
          country: item.address.country,
          postcode: item.address.postcode,
          state: item.address.state,
        }
      : undefined,
  }
}
