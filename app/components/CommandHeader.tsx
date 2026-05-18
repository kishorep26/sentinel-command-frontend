'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Activity, AlertTriangle, Shield, Clock, Layers, LogOut, Wifi, WifiOff, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'
import { useSentinel } from '@/app/store/sentinel'
import { api } from '@/app/lib/api'

export default function CommandHeader() {
  const stats = useSentinel((s) => s.stats)
  const connected = useSentinel((s) => s.connected)
  const connect = useSentinel((s) => s.connect)
  const [isResetting, setIsResetting] = useState(false)
  const [prevConnected, setPrevConnected] = useState<boolean | null>(null)
  const [clock, setClock] = useState('')  // empty on SSR, set on client

  useEffect(() => {
    connect()
    const tick = () => setClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [connect])

  useEffect(() => {
    if (prevConnected === null) { setPrevConnected(connected); return }
    if (connected && !prevConnected) toast.success('Live feed connected', { description: 'Real-time updates active' })
    if (!connected && prevConnected) toast.warning('Live feed disconnected', { description: 'Reconnecting...' })
    setPrevConnected(connected)
  }, [connected]) // eslint-disable-line react-hooks/exhaustive-deps

  const threatLevel = (() => {
    if (stats.active_incidents > 5) return 'CRITICAL'
    if (stats.active_incidents > 2) return 'ELEVATED'
    if (stats.active_incidents === 0) return 'SECURE'
    return 'LOW'
  })()

  const threatColor = {
    CRITICAL: 'text-red-500 bg-red-500/10 border-red-500/50 animate-pulse',
    ELEVATED: 'text-orange-400 bg-orange-400/10 border-orange-400/50',
    SECURE: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/50',
    LOW: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/50',
  }[threatLevel]

  const handleReset = async () => {
    if (!confirm('⚠️ INITIATE PROTOCOL ZERO: Wipe all system data?')) return
    setIsResetting(true)
    try {
      await api.admin.reset()
      await new Promise((r) => setTimeout(r, 1000))
      window.location.reload()
    } catch (e) {
      alert('Protocol Failed: ' + e)
      setIsResetting(false)
    }
  }

  return (
    <div className="flex items-center justify-between bg-slate-950/90 backdrop-blur-xl border-b border-white/10 px-8 py-4 fixed top-0 w-full z-[100] shadow-2xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-black border border-slate-700/50 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <Shield className="w-6 h-6 text-slate-400" />
        </div>
        <div>
          <h1 className="text-white font-black text-2xl tracking-[0.25em] font-mono">
            SENTINEL<span className="text-amber-500">.V4</span>
          </h1>
          <div className="flex items-center gap-2">
            <Activity className="w-3 h-3 text-amber-500 animate-pulse" />
            <span className="text-[10px] text-amber-500/80 font-mono tracking-widest uppercase">
              NETWORK ONLINE
            </span>
            <span className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${connected ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-red-400 border-red-500/30 bg-red-500/10'}`}>
              {connected ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
              {connected ? 'LIVE' : 'POLLING'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-12">
        <div className={`px-8 py-2 rounded-sm border-l-2 font-mono font-bold flex flex-col items-center justify-center bg-black/40 ${threatColor}`}>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-3 h-3" />
            <span className="text-[10px] opacity-70 tracking-[0.2em] uppercase">Threat Level</span>
          </div>
          <span className="text-lg tracking-widest">{threatLevel}</span>
        </div>

        <div className="flex flex-col items-center justify-center group">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-3 h-3 text-slate-500 group-hover:text-amber-500 transition-colors" />
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Active Events</span>
          </div>
          <span className="text-3xl font-black text-slate-200 font-mono leading-none">
            {stats.active_incidents.toString().padStart(2, '0')}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center group">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-3 h-3 text-slate-500 group-hover:text-blue-500 transition-colors" />
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Units Available</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-200 font-mono leading-none">
              {Math.max(0, stats.total_agents - stats.active_agents)}
            </span>
            <span className="text-sm text-slate-600 font-mono">/ {stats.total_agents}</span>
          </div>
        </div>
      </div>

      <div className="text-right flex flex-col items-end">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-white">
            <Clock className="w-4 h-4 text-slate-600" />
            <span className="text-2xl font-bold font-mono tracking-widest text-slate-300">
              {clock || '--:--'}
            </span>
          </div>
          <Link
            href="/training"
            className="p-2 hover:bg-amber-500/10 rounded-sm transition-colors group border border-transparent hover:border-amber-500/30"
            title="Training Simulator"
          >
            <GraduationCap className="w-5 h-5 text-slate-600 group-hover:text-amber-400 transition-colors" />
          </Link>
          <button
            onClick={handleReset}
            disabled={isResetting}
            className={`p-2 hover:bg-red-900/40 rounded-sm transition-colors group mr-2 border border-transparent hover:border-red-900 ${isResetting ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Hard Reset System"
          >
            <Layers className={`w-5 h-5 text-slate-600 group-hover:text-red-500 transition-colors ${isResetting ? 'animate-spin' : ''}`} />
          </button>
          <Link href="/" className="p-2 hover:bg-slate-800 rounded-sm transition-colors group" title="Disconnect System">
            <LogOut className="w-5 h-5 text-slate-600 group-hover:text-slate-300 transition-colors" />
          </Link>
        </div>
        <div className="text-[10px] text-slate-600 font-mono mt-1 flex items-center gap-2 uppercase tracking-widest">
          <span className="w-1.5 h-1.5 bg-emerald-900 rounded-full animate-pulse shadow-[0_0_5px_#059669]"></span>
          SECURE • {clock ? (Intl.DateTimeFormat().resolvedOptions().timeZone.split('/')[1]?.toUpperCase() || 'UNKNOWN') : '...'}
        </div>
      </div>
    </div>
  )
}
