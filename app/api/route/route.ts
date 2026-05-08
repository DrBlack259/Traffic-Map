import { NextRequest, NextResponse } from 'next/server'
import { parseOSRMResponse } from '@/lib/api/osrm'
import { routeCache } from '@/lib/cache'
import type { TransportMode } from '@/lib/types'

const PROFILE_MAP: Record<TransportMode, string> = {
  driving: 'driving',
  walking: 'foot',
  cycling: 'bike',
}

function labelAlternatives(routes: ReturnType<typeof parseOSRMResponse>[]) {
  if (routes.length === 0) return routes
  // Sort by duration then label
  const sorted = [...routes].sort((a, b) => a.duration - b.duration)
  return sorted.map((r, i) => ({
    ...r,
    index: i,
    label: i === 0
      ? 'Fastest'
      : routes.findIndex(x => x.distance === Math.min(...routes.map(y => y.distance))) === routes.indexOf(r)
        ? 'Shortest'
        : `Alternative ${i}`,
  }))
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const olat = searchParams.get('olat')
  const olon = searchParams.get('olon')
  const dlat = searchParams.get('dlat')
  const dlon = searchParams.get('dlon')
  const mode = (searchParams.get('mode') || 'driving') as TransportMode
  // Extra waypoints: wp=lat,lon&wp=lat,lon
  const waypoints = searchParams.getAll('wp')

  if (!olat || !olon || !dlat || !dlon) return NextResponse.json(null, { status: 400 })

  const cacheKey = `${olat},${olon};${waypoints.join(';')};${dlat},${dlon}:${mode}`
  const cached = routeCache.get(cacheKey)
  if (cached) return NextResponse.json(cached)

  const profile = PROFILE_MAP[mode] || 'driving'

  // Build coordinate string: origin;[waypoints];destination
  const wpCoords = waypoints.map(wp => {
    const [lat, lon] = wp.split(',')
    return `${lon},${lat}`
  })
  const coords = [`${olon},${olat}`, ...wpCoords, `${dlon},${dlat}`].join(';')

  const url = `https://router.project-osrm.org/route/v1/${profile}/${coords}?alternatives=3&overview=full&geometries=geojson&steps=true`

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return NextResponse.json(null, { status: 502 })

    const data = await res.json()
    if (data.code !== 'Ok') return NextResponse.json({ error: data.message }, { status: 400 })

    // Parse each alternative
    const alternatives = data.routes.map((_: unknown, i: number) =>
      parseOSRMResponse({ routes: [data.routes[i]] }, mode)
    )
    const labeled = labelAlternatives(alternatives)

    routeCache.set(cacheKey, labeled, 300)
    return NextResponse.json(labeled)
  } catch {
    return NextResponse.json(null, { status: 502 })
  }
}
