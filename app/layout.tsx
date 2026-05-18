import './globals.css'
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Sentinel Command',
  description: 'Multi-Agent AI Emergency Response System',
  manifest: '/manifest.json',
  themeColor: '#02040a',
  appleWebApp: {
    capable: true,
    title: 'Sentinel',
    statusBarStyle: 'black-translucent',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body className="antialiased text-gray-100 font-[Outfit]">
          {children}
          <Toaster
            theme="dark"
            position="bottom-left"
            toastOptions={{
              style: {
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#e2e8f0',
                fontFamily: 'ui-monospace, monospace',
                fontSize: '13px',
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  )
}
