'use client'

import { useState } from 'react'
import { Flame, Car, HeartPulse, Siren, AlertTriangle, CheckCircle2, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSentinel } from '@/app/store/sentinel'
import { api } from '@/app/lib/api'
import type { Incident } from '@/app/types'

const STATUS_STYLE: Record<string, string> = {
  active:     'text-red-400    border-red-500/25    bg-red-500/10',
  responding: 'text-amber-400  border-amber-500/25  bg-amber-500/10',
  dispatched: 'text-blue-400   border-blue-500/25   bg-blue-500/10',
  resolved:   'text-emerald-400 border-emerald-500/25 bg-emerald-500/10',
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  fire:     <Flame      className="w-5 h-5 text-orange-400" />,
  accident: <Car        className="w-5 h-5 text-yellow-400" />,
  medical:  <HeartPulse className="w-5 h-5 text-pink-400"   />,
  crime:    <Siren      className="w-5 h-5 text-red-400"    />,
  police:   <Siren      className="w-5 h-5 text-blue-400"   />,
}

function IncidentCard({ incident, onResolve, resolving }: {
  incident: Incident
  onResolve: (id: number) => void
  resolving: boolean
}) {
  const statusStyle = STATUS_STYLE[incident.status] ?? 'text-slate-400 border-slate-700/25 bg-slate-700/10'
  const icon = TYPE_ICON[incident.type] ?? <AlertTriangle className="w-5 h-5 text-slate-400" />

  return (
    <div className="glass-card rounded-xl border border-white/5 overflow-hidden group">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-900/60 border border-white/5 flex items-center justify-center shrink-0">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm font-bold text-white capitalize">{incident.type}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${statusStyle}`}>
                {incident.status}
              </span>
            </div>
            <p className="text-[12px] text-slate-400 leading-snug line-clamp-2">{incident.description}</p>
            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-600 font-mono">
              <span>#{incident.id}</span>
              <span>📍 {incident.location?.lat.toFixed(3)}, {incident.location?.lon.toFixed(3)}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => onResolve(incident.id)}
        disabled={resolving}
        className="w-full border-t border-white/5 py-2.5 text-[11px] font-mono font-bold uppercase tracking-widest text-slate-600 hover:text-white hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
      >
        {resolving
          ? <><span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> Resolving</>
          : 'Resolve Situation'
        }
      </button>
    </div>
  )
}

export default function IncidentPanel() {
  const incidents    = useSentinel((s) => s.incidents)
  const refresh      = useSentinel((s) => s.refresh)
  const [resolving, setResolving]       = useState<number | null>(null)
  const [resolvingAll, setResolvingAll] = useState(false)

  const active = incidents.filter((i) => i.status !== 'resolved')

  const resolveAll = async () => {
    if (active.length === 0) return
    setResolvingAll(true)
    try {
      await Promise.allSettled(active.map((i) => api.incidents.resolve(i.id)))
      await refresh()
      toast.success(`${active.length} incident${active.length > 1 ? 's' : ''} resolved`, {
        description: 'All units returning to patrol',
      })
    } catch (e) {
      toast.error('Failed to resolve all', { description: String(e) })
    } finally {
      setResolvingAll(false)
    }
  }

  const resolveIncident = async (id: number) => {
    setResolving(id)
    try {
      await api.incidents.resolve(id)
      await refresh()
      toast.success(`Incident #${id} resolved`, { description: 'Unit returning to patrol' })
    } catch (e) {
      toast.error('Failed to resolve', { description: String(e) })
    } finally {
      setResolving(null)
    }
  }

  return (
    <div className="glass-panel rounded-xl h-full flex flex-col border border-slate-800/50">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-800/50">
        <div className="relative">
          <Siren className="w-4 h-4 text-amber-500" />
          {active.length > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-ping" />
          )}
        </div>
        <span className="text-sm font-bold text-white tracking-wider uppercase font-mono">Incidents</span>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
          active.length > 0
            ? 'text-red-400 border-red-500/25 bg-red-500/10'
            : 'text-slate-600 border-slate-800 bg-transparent'
        }`}>
          {active.length}
        </span>

        {/* Resolve all button — always visible when there are active incidents */}
        {active.length > 0 && (
          <button
            onClick={resolveAll}
            disabled={resolvingAll}
            title="Resolve all active incidents"
            className="ml-auto flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1.5 rounded-lg border border-red-500/25 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all disabled:opacity-40 uppercase tracking-wider"
          >
            {resolvingAll
              ? <><Loader2 className="w-3 h-3 animate-spin" /> Clearing</>
              : <><Trash2 className="w-3 h-3" /> Clear All</>
            }
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {active.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-600">
            <CheckCircle2 className="w-10 h-10 mb-2 text-slate-800" />
            <span className="text-sm font-mono">Sector clear</span>
          </div>
        ) : (
          active.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onResolve={resolveIncident}
              resolving={resolving === incident.id}
            />
          ))
        )}
      </div>
    </div>
  )
}
