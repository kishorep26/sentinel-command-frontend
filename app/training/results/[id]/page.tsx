'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { RotateCcw, Clock, Target, Zap } from 'lucide-react'
import AppHeader from '@/app/components/AppHeader'
import { training } from '@/app/lib/api'
import type { TrainingSession } from '@/app/types'

function Grade({ pct }: { pct: number }) {
  const [label, color] =
    pct >= 90 ? ['S', 'text-amber-400']  :
    pct >= 75 ? ['A', 'text-emerald-400'] :
    pct >= 60 ? ['B', 'text-blue-400']   :
    pct >= 40 ? ['C', 'text-slate-300']  :
                ['D', 'text-red-400']
  return <span className={`font-black text-8xl leading-none ${color}`}>{label}</span>
}

export default function SessionResults() {
  const { id } = useParams<{ id: string }>()
  const { getToken } = useAuth()
  const [session, setSession] = useState<TrainingSession | null>(null)

  useEffect(() => {
    const load = async () => {
      const token = await getToken()
      const sessions = await training.sessions.mine(token ?? undefined)
      setSession(sessions.find((s) => s.id === Number(id)) ?? null)
    }
    load().catch(console.error)
  }, [id, getToken])

  if (!session) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-slate-600 font-mono text-sm animate-pulse">Loading results...</div>
        </div>
      </div>
    )
  }

  const pct = session.max_score > 0 ? Math.round((session.score / session.max_score) * 100) : 0
  const accuracy = session.total_dispatches > 0
    ? Math.round((session.correct_dispatches / session.total_dispatches) * 100) : 0
  const barColor = pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div className="min-h-screen">
      <AppHeader />

      <div className="pt-28 pb-16 px-8 max-w-2xl mx-auto">
        {/* Grade */}
        <div className="glass-panel rounded-xl p-8 border border-slate-800/50 mb-5 text-center">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">Session Complete</div>
          <Grade pct={pct} />
          <div className="text-slate-500 text-sm font-mono mt-2">{session.scenario_name}</div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-400 font-mono text-sm">Score</span>
              <span className="font-black text-xl text-white">
                {session.score} <span className="text-slate-600 font-normal text-sm">/ {session.max_score}</span>
              </span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${barColor} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
            </div>
            <div className="text-right text-xs font-mono text-slate-500 mt-1">{pct}%</div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: <Target className="w-4 h-4" />, label: 'Accuracy',     value: `${accuracy}%` },
            { icon: <Clock  className="w-4 h-4" />, label: 'Avg Response', value: `${(session.avg_response_ms / 1000).toFixed(1)}s` },
            { icon: <Zap    className="w-4 h-4" />, label: 'Dispatches',   value: `${session.correct_dispatches}/${session.total_dispatches}` },
          ].map(({ icon, label, value }) => (
            <div key={label} className="glass-card rounded-xl p-4 text-center border border-slate-800/30">
              <div className="text-slate-500 flex justify-center mb-2">{icon}</div>
              <div className="text-xl font-black text-white">{value}</div>
              <div className="text-[10px] text-slate-600 font-mono uppercase tracking-wider mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Breakdown */}
        {session.event_results.length > 0 && (
          <div className="glass-panel rounded-xl border border-slate-800/50 mb-6 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-800/50">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Event Breakdown</span>
            </div>
            <div className="divide-y divide-slate-800/50">
              {session.event_results.map((r, i) => {
                const correct = r.incident_type === r.expected_type
                return (
                  <div key={i} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span className={`font-mono flex items-center gap-2 ${correct ? 'text-emerald-400' : 'text-red-400'}`}>
                      {correct ? '✅' : '❌'} Incident {r.event_index + 1}
                      {!correct && (
                        <span className="text-slate-600 text-xs">
                          expected {r.expected_type}, sent {r.incident_type}
                        </span>
                      )}
                    </span>
                    <span className="text-slate-500 font-mono text-xs">{(r.response_time_ms / 1000).toFixed(1)}s</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/training"
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 rounded-lg transition text-sm uppercase tracking-wider"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </Link>
          <Link
            href="/training"
            className="flex-1 flex items-center justify-center gap-2 glass-card border border-slate-700/50 hover:border-slate-600 text-slate-300 hover:text-white font-bold py-3 rounded-lg transition text-sm"
          >
            All Scenarios
          </Link>
        </div>
      </div>
    </div>
  )
}
