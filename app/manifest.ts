import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Traffic Map — Live Navigation',
    short_name: 'Traffic Map',
    description: 'Real-time traffic, turn-by-turn navigation, and live location sharing',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#0d0d0d',
    theme_color: '#0d0d0d',
    categories: ['navigation', 'travel', 'utilities'],
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Navigate Home',
        short_name: 'Home',
        url: '/?action=home',
        description: 'Get directions to home',
      },
      {
        name: 'Check Traffic',
        short_name: 'Traffic',
        url: '/?action=traffic',
        description: 'View live traffic conditions',
      },
    ],
  }
}
