import { NextRequest, NextResponse } from 'next/server'
import { parseNominatimResult } from '@/lib/api/nominatim'

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat')
  const lon = req.nextUrl.searchParams.get('lon')
  if (!lat || !lon) return NextResponse.json(null, { status: 400 })

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'TrafficMapApp/1.0' },
    next: { revalidate: 60 },
  })
  if (!res.ok) return NextResponse.json(null, { status: 502 })

  const data = await res.json()
  if (data.error) return NextResponse.json(null, { status: 404 })
  return NextResponse.json(parseNominatimResult(data))
}
