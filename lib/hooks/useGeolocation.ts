'use client'
import { useCallback } from 'react'
import { useMapStore } from '@/lib/store/mapStore'

export function useGeolocation() {
  const { setUserLocation, setToast } = useMapStore()

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setToast({ message: 'Geolocation not supported by your browser', type: 'error' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude])
      },
      () => {
        setToast({ message: 'Location access denied', type: 'error' })
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [setUserLocation, setToast])

  return { locate }
}
