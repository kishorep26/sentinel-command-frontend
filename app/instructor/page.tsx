'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth, UserButton } from '@clerk/nextjs'
import { Shield, Users, BarChart3, Clock, Target } from 'lucide-react'
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
        const data = await training.sessions.all(token ?? undefined)
        setSessions(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [getToken])

  const completed = sessions.filter((s) => s.status === 'completed')
  const avgScore = completed.length > 0
    ? Math.round(completed.reduce((sum, s) => sum + (s.max_score > 0 ? (s.score / s.max_score) * 100 : 0), 0) / completed.length)
    : 0
  const uniqueTrainees = new Set(sessions.map((s) => s.trainee_id)).size

  return (
    <div className="min-h-screen bg-[#02040a] text-white">
      <div className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-500" />
            <span className="font-black tracking-widest font-mono text-lg">SENTINEL<span className="text-amber-500">.TRAIN</span></span>
          </Link>
          <span className="text-xs font-mono text-slate-500 border border-slate-700 px-2 py-0.5 rounded">INSTRUCTOR</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/training" className="text-xs text-slate-400 hover:text-white font-mono tracking-widest uppercase transition">Trainee View</Link>
          <UserButton />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10">
        <h1 className="text-3xl font-black tracking-tight mb-8">Instructor Dashboard</h1>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: <Users className="w-5 h-5" />, label: 'Trainees', value: uniqueTrainees },
            { icon: <BarChart3 className="w-5 h-5" />, label: 'Sessions', value: completed.length },
            { icon: <Target className="w-5 h-5" />, label: 'Avg Score', value: `${avgScore}%` },
          ].map(({ icon, label, value }) => (
            <div key={label} className="glass-panel rounded-xl p-5 border border-slate-800/50">
              <div className="flex items-center gap-2 text-slate-500 mb-2 text-sm">{icon}{label}</div>
              <div className="text-3xl font-black">{value}</div>
            </div>
          ))}
        </div>

        {/* Session table */}
        <div className="glass-panel rounded-xl border border-slate-800/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/50">
            <h2 className="font-bold tracking-wide">Recent Sessions</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-600 font-mono animate-pulse">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="p-8 text-center text-slate-600 font-mono">No sessions yet — trainees will appear here after completing scenarios.</div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {sessions.map((s) => {
                const pct = s.max_score > 0 ? Math.round((s.score / s.max_score) * 100) : 0
                const accuracy = s.total_dispatches > 0 ? Math.round((s.correct_dispatches / s.total_dispatches) * 100) : 0
                return (
                  <div key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/3 transition">
                    <div>
                      <div className="font-semibold text-sm mb-0.5">{s.trainee_name || s.trainee_id.slice(0, 12) + '…'}</div>
                      <div className="text-xs text-slate-500 font-mono">{s.scenario_name} · {new Date(s.started_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center gap-6 text-sm font-mono">
                      <span className="text-slate-400">{accuracy}% accuracy</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        {(s.avg_response_ms / 1000).toFixed(1)}s avg
                      </span>
                      <span className={`font-black text-lg ${pct >= 75 ? 'text-emerald-400' : pct >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                        {pct}%
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded border font-mono uppercase ${
                        s.status === 'completed' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                        'text-amber-400 border-amber-500/30 bg-amber-500/10'
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
