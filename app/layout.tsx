import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sentinel Command',
  description: 'Multi-Agent Emergency Response System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased text-gray-100 font-[Outfit]">
        {children}
      </body>
    </html>
  )
}
