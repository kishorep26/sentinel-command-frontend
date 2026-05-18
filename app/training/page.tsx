'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { Clock, Zap, ChevronRight, BarChart3, AlertTriangle } from 'lucide-react'
import AppHeader from '@/app/components/AppHeader'
import { training } from '@/app/lib/api'
import type { Scenario } from '@/app/types'

const DIFFICULTY: Record<string, { label: string; color: string; bar: string }> = {
  beginner:     { label: 'Beginner',     color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', bar: 'bg-emerald-500' },
  intermediate: { label: 'Intermediate', color: 'text-amber-400   border-amber-500/30   bg-amber-500/10',   bar: 'bg-amber-500'   },
  advanced:     { label: 'Advanced',     color: 'text-red-400     border-red-500/30     bg-red-500/10',     bar: 'bg-red-500'     },
}

const TYPE_COLORS: Record<string, string> = {
  fire:     'bg-orange-500/20 text-orange-300 border-orange-500/20',
  medical:  'bg-pink-500/20   text-pink-300   border-pink-500/20',
  police:   'bg-blue-500/20   text-blue-300   border-blue-500/20',
  accident: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/20',
}

export default function TrainingHub() {
  const { getToken } = useAuth()
  const router = useRouter()
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [starting, setStarting] = useState<number | null>(null)

  useEffect(() => {
    training.scenarios.list().then(setScenarios).catch(console.error)
  }, [])

  const startSession = async (scenarioId: number) => {
    setStarting(scenarioId)
    try {
      const token = await getToken()
      const session = await training.sessions.start(scenarioId, undefined, token ?? undefined)
      router.push(`/training/session/${session.id}?scenario=${scenarioId}`)
    } catch {
      setStarting(null)
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader />

      <div className="pt-24 pb-16 px-8 max-w-5xl mx-auto">
        {/* Page title */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-[10px] font-mono tracking-widest text-amber-500/80 uppercase">Training Simulator</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">Select Scenario</h1>
          <p className="text-slate-500 text-base leading-relaxed max-w-xl">
            Practice dispatch decisions under pressure. Each scenario scores your speed and unit accuracy in real time.
          </p>
        </div>

        {/* Scenario cards */}
        <div className="space-y-4">
          {scenarios.map((scenario) => {
            const diff = DIFFICULTY[scenario.difficulty] ?? DIFFICULTY.intermediate
            const isStarting = starting === scenario.id
            const typeCount = scenario.events.reduce<Record<string, number>>((acc, e) => {
              acc[e.type] = (acc[e.type] ?? 0) + 1
              return acc
            }, {})
            const maxScore = scenario.events.length * 125

            return (
              <div key={scenario.id} className="glass-panel rounded-xl p-6 border border-slate-800/50 group hover:border-amber-500/20 transition-all duration-300">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    {/* Title + difficulty */}
                    <div className="flex items-center gap-3 mb-3">
                      <h2 className="text-xl font-bold text-white tracking-tight">{scenario.name}</h2>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-sm border tracking-widest uppercase ${diff.color}`}>
                        {diff.label}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">{scenario.description}</p>

                    {/* Stats row */}
                    <div className="flex items-center gap-6 text-xs text-slate-500 font-mono mb-4">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                        {scenario.duration_minutes} MIN
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-slate-600" />
                        {scenario.events.length} INCIDENTS
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-slate-600" />
                        {maxScore} PTS MAX
                      </span>
                    </div>

                    {/* Type pills */}
                    <div className="flex gap-1.5 flex-wrap">
                      {Object.entries(typeCount).map(([type, count]) => (
                        <span key={type} className={`text-[10px] px-2 py-0.5 rounded border font-mono uppercase tracking-wider ${TYPE_COLORS[type] ?? 'bg-slate-700/40 text-slate-400 border-slate-700'}`}>
                          {type} ×{count}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty bar + CTA */}
                  <div className="flex flex-col items-end gap-4 shrink-0">
                    <div className="w-24">
                      <div className="text-[10px] font-mono text-slate-600 mb-1 text-right uppercase tracking-widest">
                        {scenario.difficulty}
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${diff.bar} rounded-full`} style={{
                          width: scenario.difficulty === 'beginner' ? '33%' : scenario.difficulty === 'intermediate' ? '66%' : '100%'
                        }} />
                      </div>
                    </div>
                    <button
                      onClick={() => startSession(scenario.id)}
                      disabled={isStarting}
                      className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-6 py-3 rounded-lg transition-all text-sm uppercase tracking-wider group-hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                    >
                      {isStarting
                        ? <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        : <><span>Launch</span><ChevronRight className="w-4 h-4" /></>
                      }
                    </button>
                  </div>
                </div>
              </div>
            )
          })}

          {scenarios.length === 0 && (
            <div className="glass-panel rounded-xl p-12 text-center border border-slate-800/50">
              <div className="text-slate-600 font-mono animate-pulse text-sm">Loading scenarios...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
