'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { AlertTriangle, Shield, Clock, RotateCcw, GraduationCap, Siren } from 'lucide-react'
import { toast } from 'sonner'
import { useSentinel } from '@/app/store/sentinel'
import { api } from '@/app/lib/api'

const THREAT: Record<string, { label: string; style: string }> = {
  CRITICAL: { label: 'CRITICAL', style: 'text-red-400   border-red-500/40   bg-red-500/10   animate-pulse' },
  ELEVATED: { label: 'ELEVATED', style: 'text-orange-400 border-orange-500/40 bg-orange-500/10' },
  LOW:      { label: 'LOW',      style: 'text-amber-400  border-amber-500/40  bg-amber-500/10'  },
  SECURE:   { label: 'SECURE',   style: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
}

export default function CommandHeader() {
  const stats    = useSentinel((s) => s.stats)
  const connect  = useSentinel((s) => s.connect)
  const [isResetting, setIsResetting] = useState(false)
  const [clock, setClock] = useState('')

  useEffect(() => {
    connect()
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [connect])

  const level = stats.active_incidents > 5 ? 'CRITICAL'
    : stats.active_incidents > 2 ? 'ELEVATED'
    : stats.active_incidents > 0 ? 'LOW'
    : 'SECURE'
  const threat = THREAT[level]

  const handleReset = async () => {
    if (!confirm('Reset all system data? This cannot be undone.')) return
    setIsResetting(true)
    try {
      await api.admin.reset()
      await new Promise((r) => setTimeout(r, 800))
      window.location.reload()
    } catch (e) {
      toast.error('Reset failed', { description: String(e) })
      setIsResetting(false)
    }
  }

  return (
    <div className="fixed top-0 w-full z-[100] border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
      <div className="flex items-center justify-between px-8 py-4">

        {/* Brand */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-slate-800 to-black border border-slate-700/50 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-amber-500" />
          </div>
          <span className="font-black text-xl tracking-[0.2em] font-mono text-white">
            SENTINEL<span className="text-amber-500">.V4</span>
          </span>
        </Link>

        {/* HUD stats */}
        <div className="flex items-center gap-8">
          {/* Threat */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-mono font-bold text-sm ${threat.style}`}>
            <AlertTriangle className="w-3.5 h-3.5" />
            {threat.label}
          </div>

          {/* Active events */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-600 font-mono uppercase tracking-widest mb-0.5 flex items-center gap-1">
              <Siren className="w-2.5 h-2.5" /> Active
            </span>
            <span className="text-3xl font-black text-white font-mono leading-none">
              {stats.active_incidents.toString().padStart(2, '0')}
            </span>
          </div>

          {/* Units */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-slate-600 font-mono uppercase tracking-widest mb-0.5 flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" /> Available
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-white font-mono leading-none">
                {Math.max(0, stats.total_agents - stats.active_agents)}
              </span>
              <span className="text-sm text-slate-700 font-mono">/{stats.total_agents}</span>
            </div>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold font-mono tracking-widest text-slate-400">
            {clock || '--:--'}
          </span>

          <div className="w-px h-5 bg-slate-800" />

          <Link
            href="/training"
            className="p-2 rounded-lg border border-transparent hover:border-amber-500/30 hover:bg-amber-500/10 transition-all group"
            title="Training Simulator"
          >
            <GraduationCap className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
          </Link>

          <button
            onClick={handleReset}
            disabled={isResetting}
            title="Reset System"
            className="p-2 rounded-lg border border-transparent hover:border-red-500/30 hover:bg-red-500/10 transition-all group disabled:opacity-40"
          >
            <RotateCcw className={`w-4 h-4 text-slate-600 group-hover:text-red-400 transition-colors ${isResetting ? 'animate-spin' : ''}`} />
          </button>

          <UserButton />
        </div>
      </div>
    </div>
  )
}
