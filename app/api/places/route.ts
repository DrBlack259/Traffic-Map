import { NextRequest, NextResponse } from 'next/server'
import { buildOverpassQuery, parseOverpassResult } from '@/lib/api/overpass'
import type { POICategory } from '@/lib/types'

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat')
  const lon = req.nextUrl.searchParams.get('lon')
  const amenity = req.nextUrl.searchParams.get('amenity') || 'restaurant'
  const radius = req.nextUrl.searchParams.get('radius') || '1000'

  if (!lat || !lon) return NextResponse.json([], { status: 400 })

  const query = buildOverpassQuery(parseFloat(lat), parseFloat(lon), parseInt(radius), amenity)

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
      next: { revalidate: 300 },
    })
    if (!res.ok) return NextResponse.json([])
    const data = await res.json()
    return NextResponse.json(parseOverpassResult(data, amenity as POICategory))
  } catch {
    return NextResponse.json([])
  }
}
