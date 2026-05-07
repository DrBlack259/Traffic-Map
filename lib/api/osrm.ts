import type { Route, TransportMode, RouteStep } from '@/lib/types'

export function parseOSRMResponse(data: Record<string, unknown>, mode: TransportMode): Route {
  const routes = data.routes as Array<{
    geometry: GeoJSON.LineString
    distance: number
    duration: number
    legs: Array<{ steps: Array<Record<string, unknown>> }>
  }>
  const r = routes[0]
  const steps: RouteStep[] = []

  for (const leg of r.legs) {
    for (const step of leg.steps) {
      const maneuver = step.maneuver as { type: string; modifier?: string } | undefined
      steps.push({
        instruction: formatInstruction(maneuver),
        distance: step.distance as number,
        duration: step.duration as number,
        maneuver: maneuver?.type || 'straight',
        name: (step.name as string) || '',
      })
    }
  }

  return { geometry: r.geometry, distance: r.distance, duration: r.duration, steps, mode }
}

function formatInstruction(maneuver?: { type: string; modifier?: string }): string {
  if (!maneuver) return 'Continue'
  const { type, modifier } = maneuver
  const mod = modifier ? ` ${modifier}` : ''
  const map: Record<string, string> = {
    depart: 'Depart',
    arrive: 'Arrive at destination',
    turn: `Turn${mod}`,
    'new name': `Continue${mod}`,
    merge: `Merge${mod}`,
    'on ramp': `Take on-ramp${mod}`,
    'off ramp': `Take off-ramp${mod}`,
    fork: `Keep${mod} at fork`,
    'end of road': `Turn${mod} at end of road`,
    roundabout: `Enter roundabout`,
    rotary: `Enter rotary`,
    continue: `Continue${mod}`,
    notification: 'Continue',
  }
  return map[type] || `Continue${mod}`
}
