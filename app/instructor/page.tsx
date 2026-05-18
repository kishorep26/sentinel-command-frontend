'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Users, BarChart3, Clock, Target, Activity } from 'lucide-react'
import AppHeader from '@/app/components/AppHeader'
import { training } from '@/app/lib/api'
import type { TrainingSession } from '@/app/types'

export default function InstructorDashboard() {
  const { getToken } = useAuth()
  const [sessions, setSessions] = useState<TrainingSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const token = await getToken()
        setSessions(await training.sessions.all(token ?? undefined))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [getToken])

  const completed = sessions.filter((s) => s.status === 'completed')
  const avgPct = completed.length > 0
    ? Math.round(completed.reduce((sum, s) => sum + (s.max_score > 0 ? (s.score / s.max_score) * 100 : 0), 0) / completed.length)
    : 0
  const uniqueTrainees = new Set(sessions.map((s) => s.trainee_id)).size

  return (
    <div className="min-h-screen">
      <AppHeader />

      <div className="pt-24 pb-16 px-8 max-w-5xl mx-auto">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-mono tracking-widest text-amber-500/80 uppercase">Instructor View</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">Performance Dashboard</h1>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Users    className="w-5 h-5 text-slate-500" />, label: 'Trainees',     value: uniqueTrainees, sub: 'unique accounts' },
            { icon: <BarChart3 className="w-5 h-5 text-slate-500" />, label: 'Sessions',    value: completed.length, sub: 'completed' },
            { icon: <Target   className="w-5 h-5 text-slate-500" />, label: 'Avg Score',   value: `${avgPct}%`, sub: 'across all sessions' },
          ].map(({ icon, label, value, sub }) => (
            <div key={label} className="glass-panel rounded-xl p-5 border border-slate-800/50">
              <div className="flex items-center gap-2 mb-3">{icon}<span className="text-xs text-slate-500 font-mono uppercase tracking-widest">{label}</span></div>
              <div className="text-3xl font-black text-white">{value}</div>
              <div className="text-xs text-slate-600 font-mono mt-1">{sub}</div>
            </div>
          ))}
        </div>

        {/* Session table */}
        <div className="glass-panel rounded-xl border border-slate-800/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/50 flex items-center justify-between">
            <span className="font-bold text-white tracking-wide">Recent Sessions</span>
            <span className="text-xs font-mono text-slate-600">{sessions.length} total</span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-600 font-mono text-sm animate-pulse">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="p-10 text-center text-slate-600 font-mono text-sm">
              No sessions yet — trainees will appear here after completing scenarios.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/30">
              {sessions.map((s) => {
                const pct = s.max_score > 0 ? Math.round((s.score / s.max_score) * 100) : 0
                const accuracy = s.total_dispatches > 0 ? Math.round((s.correct_dispatches / s.total_dispatches) * 100) : 0
                const gradeColor = pct >= 75 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'
                return (
                  <div key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition">
                    <div>
                      <div className="text-sm font-semibold text-white mb-0.5">
                        {s.trainee_name || s.trainee_id.slice(0, 14) + '…'}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {s.scenario_name} · {new Date(s.started_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-xs font-mono">
                      <span className="text-slate-500">{accuracy}% acc</span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" />{(s.avg_response_ms / 1000).toFixed(1)}s
                      </span>
                      <span className={`font-black text-lg ${gradeColor}`}>{pct}%</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-sm border font-mono uppercase tracking-wider ${
                        s.status === 'completed'
                          ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
                          : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                      }`}>{s.status}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
