import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Traffic Map — Live Navigation & Traffic',
  description: 'Real-time traffic, navigation, and map with live incidents',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0d0d0d] text-white antialiased overflow-hidden">{children}</body>
    </html>
  )
}
