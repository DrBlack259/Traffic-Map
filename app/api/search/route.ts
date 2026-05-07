import { NextRequest, NextResponse } from 'next/server'
import { parseNominatimResult } from '@/lib/api/nominatim'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json([])

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=6&addressdetails=1`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'TrafficMapApp/1.0' },
    next: { revalidate: 30 },
  })
  if (!res.ok) return NextResponse.json([], { status: 502 })

  const data = await res.json()
  return NextResponse.json(data.map(parseNominatimResult))
}
