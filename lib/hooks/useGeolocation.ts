'use client'
import { useCallback } from 'react'
import { useMapStore } from '@/lib/store/mapStore'

export function useGeolocation() {
  const { setUserLocation, setOrigin, setSearchingFor, setToast } = useMapStore()

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setToast({ message: 'Geolocation not supported by your browser', type: 'error' })
      return
    }

    setToast({ message: 'Finding your location…', type: 'info' })

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords
        setUserLocation([lat, lon])

        // Reverse geocode to get a human-readable name for origin
        try {
          const res = await fetch(`/api/reverse?lat=${lat}&lon=${lon}`)
          const place = res.ok ? await res.json() : null
          setOrigin(place ?? {
            id: 'user-location',
            name: 'My Location',
            displayName: 'Current Location',
            lat,
            lon,
            type: 'location',
          })
        } catch {
          setOrigin({
            id: 'user-location',
            name: 'My Location',
            displayName: 'Current Location',
            lat,
            lon,
            type: 'location',
          })
        }

        // Automatically open destination search
        setSearchingFor('destination')
        setToast(null)
      },
      (err) => {
        const msg = err.code === 1
          ? 'Location access denied. Please allow location in your browser.'
          : 'Could not get your location. Try again.'
        setToast({ message: msg, type: 'error' })
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 }
    )
  }, [setUserLocation, setOrigin, setSearchingFor, setToast])

  return { locate }
}
