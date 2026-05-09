import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Traffic Map — Live Navigation & Traffic',
  description: 'Real-time traffic map with turn-by-turn directions, live incidents, and satellite view.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Traffic Map',
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0d0d0d',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="h-full bg-[#0d0d0d] text-white overflow-hidden">{children}</body>
    </html>
  )
}
