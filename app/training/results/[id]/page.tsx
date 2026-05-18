'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { Shield, RotateCcw, Trophy, Clock, Target, Zap } from 'lucide-react'
import { training } from '@/app/lib/api'
import type { TrainingSession } from '@/app/types'

function GradeLabel({ pct }: { pct: number }) {
  if (pct >= 90) return <span className="text-emerald-400 font-black text-5xl">S</span>
  if (pct >= 75) return <span className="text-amber-400  font-black text-5xl">A</span>
  if (pct >= 60) return <span className="text-blue-400   font-black text-5xl">B</span>
  if (pct >= 40) return <span className="text-slate-300  font-black text-5xl">C</span>
  return             <span className="text-red-400    font-black text-5xl">D</span>
}

export default function SessionResults() {
  const { id } = useParams<{ id: string }>()
  const { getToken } = useAuth()
  const router = useRouter()
  const [session, setSession] = useState<TrainingSession | null>(null)

  useEffect(() => {
    const load = async () => {
      const token = await getToken()
      const sessions = await training.sessions.mine(token ?? undefined)
      const s = sessions.find((s) => s.id === Number(id))
      if (s) setSession(s)
    }
    load().catch(console.error)
  }, [id, getToken])

  if (!session) {
    return (
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <div className="text-slate-500 font-mono animate-pulse">Loading results...</div>
      </div>
    )
  }

  const pct = session.max_score > 0 ? Math.round((session.score / session.max_score) * 100) : 0
  const accuracy = session.total_dispatches > 0
    ? Math.round((session.correct_dispatches / session.total_dispatches) * 100) : 0

  return (
    <div className="min-h-screen bg-[#02040a] text-white">
      <div className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <Link href="/training" className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-500" />
          <span className="font-black tracking-widest font-mono">SENTINEL<span className="text-amber-500">.TRAIN</span></span>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-8 py-16 text-center">
        {/* Grade */}
        <div className="mb-2 text-xs font-mono text-slate-500 uppercase tracking-widest">Session Complete</div>
        <div className="mb-1"><GradeLabel pct={pct} /></div>
        <div className="text-slate-400 text-sm font-mono mb-8">{session.scenario_name}</div>

        {/* Score bar */}
        <div className="glass-panel rounded-xl p-6 mb-6 text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-400 font-mono text-sm">Score</span>
            <span className="font-black text-2xl">{session.score} <span className="text-slate-500 text-base font-normal">/ {session.max_score}</span></span>
          </div>
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="text-right text-xs font-mono text-slate-500 mt-1">{pct}%</div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Target className="w-5 h-5" />, label: 'Accuracy', value: `${accuracy}%` },
            { icon: <Clock className="w-5 h-5" />,  label: 'Avg Response', value: `${(session.avg_response_ms / 1000).toFixed(1)}s` },
            { icon: <Zap className="w-5 h-5" />,    label: 'Dispatches', value: `${session.correct_dispatches}/${session.total_dispatches}` },
          ].map(({ icon, label, value }) => (
            <div key={label} className="glass-card rounded-xl p-4 text-center">
              <div className="text-slate-500 flex justify-center mb-2">{icon}</div>
              <div className="text-xl font-black">{value}</div>
              <div className="text-xs text-slate-500 font-mono uppercase tracking-wider mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Event breakdown */}
        {session.event_results.length > 0 && (
          <div className="glass-panel rounded-xl p-5 mb-8 text-left">
            <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Event Breakdown</h3>
            <div className="space-y-2">
              {session.event_results.map((r, i) => (
                <div key={i} className={`flex items-center justify-between text-sm py-1.5 border-b border-white/5 ${r.incident_type === r.expected_type ? 'text-emerald-300' : 'text-red-300'}`}>
                  <span className="font-mono">
                    {r.incident_type === r.expected_type ? '✅' : '❌'} Incident {r.event_index + 1}
                    {r.incident_type !== r.expected_type && <span className="text-slate-500 ml-2 text-xs">expected {r.expected_type}, sent {r.incident_type}</span>}
                  </span>
                  <span className="text-slate-500 font-mono text-xs">{(r.response_time_ms / 1000).toFixed(1)}s</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Link href="/training" className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition uppercase tracking-wider text-sm">
            <RotateCcw className="w-4 h-4" /> Try Again
          </Link>
          <Link href="/training" className="flex items-center gap-2 px-6 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-bold rounded-lg transition text-sm">
            All Scenarios
          </Link>
        </div>
      </div>
    </div>
  )
}
