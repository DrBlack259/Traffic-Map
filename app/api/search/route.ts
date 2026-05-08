import { NextRequest, NextResponse } from 'next/server'
import { parseNominatimResult } from '@/lib/api/nominatim'
import { searchCache } from '@/lib/cache'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json([])

  const key = q.toLowerCase().trim()
  const cached = searchCache.get(key)
  if (cached) return NextResponse.json(cached)

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'TrafficMapApp/1.0' },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return NextResponse.json([], { status: 502 })

    const data = await res.json()
    const results = data.map(parseNominatimResult)
    searchCache.set(key, results, 30)
    return NextResponse.json(results)
  } catch {
    return NextResponse.json([])
  }
}
