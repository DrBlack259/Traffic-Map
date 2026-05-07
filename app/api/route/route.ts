import { NextRequest, NextResponse } from 'next/server'
import { parseOSRMResponse } from '@/lib/api/osrm'
import type { TransportMode } from '@/lib/types'

const PROFILE_MAP: Record<TransportMode, string> = {
  driving: 'driving',
  walking: 'foot',
  cycling: 'bike',
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const olat = searchParams.get('olat')
  const olon = searchParams.get('olon')
  const dlat = searchParams.get('dlat')
  const dlon = searchParams.get('dlon')
  const mode = (searchParams.get('mode') || 'driving') as TransportMode

  if (!olat || !olon || !dlat || !dlon) return NextResponse.json(null, { status: 400 })

  const profile = PROFILE_MAP[mode] || 'driving'
  const url = `https://router.project-osrm.org/route/v1/${profile}/${olon},${olat};${dlon},${dlat}?overview=full&geometries=geojson&steps=true`

  const res = await fetch(url, { next: { revalidate: 0 } })
  if (!res.ok) return NextResponse.json(null, { status: 502 })

  const data = await res.json()
  if (data.code !== 'Ok') return NextResponse.json({ error: data.message }, { status: 400 })

  return NextResponse.json(parseOSRMResponse(data, mode))
}
