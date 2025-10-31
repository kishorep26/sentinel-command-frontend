import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Smart City AI',
  description: 'Multi-Agent Emergency Response',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
