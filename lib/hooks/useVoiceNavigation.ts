'use client'
import { useEffect, useRef } from 'react'
import { useMapStore } from '@/lib/store/mapStore'

// Haversine distance in metres
function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
  const utt = new SpeechSynthesisUtterance(text)
  utt.rate = 1.0
  utt.volume = 1.0
  window.speechSynthesis.speak(utt)
}

export function useVoiceNavigation(enabled: boolean) {
  const { route, userLocation } = useMapStore()
  const spokenRef = useRef<Set<number>>(new Set())
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    // Reset spoken steps when route changes
    spokenRef.current = new Set()
  }, [route])

  useEffect(() => {
    if (!enabled || !route) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      return
    }

    if (!navigator.geolocation) return

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        const steps = route.steps

        for (let i = 0; i < steps.length; i++) {
          if (spokenRef.current.has(i)) continue

          // Steps don't carry coordinate directly — use route geometry sampling
          // Approximate: speak when ~150m before expected maneuver position
          // Since OSRM steps don't give waypoint coords we trigger on time/distance
          // Simple approach: trigger step i when user has covered i/(steps.length) of total distance
          // A better proxy: find closest point on geometry and check progress
          // For now trigger each step at most once as user approaches destination
          const progress = i / steps.length
          const totalDist = route.distance
          const stepsTraversed = estimateProgress(lat, lon, route, userLocation)
          if (stepsTraversed >= progress - 0.02 && stepsTraversed < progress + 0.05) {
            spokenRef.current.add(i)
            const text = steps[i].instruction
            speak(text)
            break
          }
        }

        // Final "You have arrived" announcement
        if (steps.length > 0 && !spokenRef.current.has(-1)) {
          const dest = route.geometry.coordinates[route.geometry.coordinates.length - 1]
          const dist = haversineM(lat, lon, dest[1], dest[0])
          if (dist < 50) {
            spokenRef.current.add(-1)
            speak('You have arrived at your destination.')
          }
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 3000 }
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [enabled, route, userLocation])
}

function estimateProgress(
  lat: number,
  lon: number,
  route: ReturnType<typeof useMapStore.getState>['route'],
  startLoc: [number, number] | null
): number {
  if (!route || !startLoc) return 0
  const coords = route.geometry.coordinates
  let minDist = Infinity
  let closestIdx = 0
  for (let i = 0; i < coords.length; i++) {
    const d = haversineM(lat, lon, coords[i][1], coords[i][0])
    if (d < minDist) { minDist = d; closestIdx = i }
  }
  return closestIdx / (coords.length - 1)
}
