import { NextRequest, NextResponse } from 'next/server'
import { parseNominatimResult } from '@/lib/api/nominatim'
import { reverseCache } from '@/lib/cache'

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat')
  const lon = req.nextUrl.searchParams.get('lon')
  if (!lat || !lon) return NextResponse.json(null, { status: 400 })

  // Round to ~11m precision for cache hits
  const key = `${parseFloat(lat).toFixed(4)},${parseFloat(lon).toFixed(4)}`
  const cached = reverseCache.get(key)
  if (cached) return NextResponse.json(cached)

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'TrafficMapApp/1.0' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return NextResponse.json(null, { status: 502 })

    const data = await res.json()
    if (data.error) return NextResponse.json(null, { status: 404 })

    const result = parseNominatimResult(data)
    reverseCache.set(key, result, 600)
    return NextResponse.json(result)
  } catch {
    return NextResponse.json(null)
  }
}
