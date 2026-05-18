'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { Activity, Shield } from 'lucide-react'

const NAV = [
  { href: '/dashboard', label: 'LIVE DISPATCH' },
  { href: '/training',  label: 'TRAINING'      },
  { href: '/instructor', label: 'INSTRUCTOR'   },
]

export default function AppHeader() {
  const path = usePathname()

  return (
    <div className="fixed top-0 w-full z-[100] border-b border-white/10 bg-slate-950/90 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-black border border-slate-700/50 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-amber-500" />
          </div>
          <span className="font-black text-xl tracking-[0.2em] font-mono text-white">
            SENTINEL<span className="text-amber-500">.V4</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV.map(({ href, label }) => {
            const active = path.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 text-[11px] font-mono tracking-widest rounded transition-all ${
                  active
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
            <span className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">Online</span>
          </div>
          <UserButton />
        </div>
      </div>
    </div>
  )
}
