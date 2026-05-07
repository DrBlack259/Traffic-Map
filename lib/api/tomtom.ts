import type { TrafficIncident } from '@/lib/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseTomTomIncidents(data: any): TrafficIncident[] {
  if (!data?.incidents) return []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.incidents.map((inc: any): TrafficIncident => {
    const props = inc.properties || {}
    const geo = inc.geometry?.coordinates || [0, 0]
    return {
      id: inc.id || String(Math.random()),
      type: props.iconCategory || 'OTHER_NEWS',
      severity: props.magnitudeOfDelay ?? 1,
      description: props.events?.[0]?.description || props.description || 'Traffic incident',
      lat: geo[1],
      lon: geo[0],
      delay: props.delay,
      roadName: props.roadNumbers?.[0] || props.street,
      from: props.from,
      to: props.to,
      startTime: props.startTime,
      endTime: props.endTime,
    }
  })
}
