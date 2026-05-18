'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth, UserButton } from '@clerk/nextjs'
import { Shield, Clock, Zap, ChevronRight, BookOpen, BarChart3 } from 'lucide-react'
import { training } from '@/app/lib/api'
import type { Scenario } from '@/app/types'

const DIFFICULTY_STYLE = {
  beginner:     { label: 'Beginner',     color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  intermediate: { label: 'Intermediate', color: 'text-amber-400   border-amber-500/30   bg-amber-500/10'   },
  advanced:     { label: 'Advanced',     color: 'text-red-400     border-red-500/30     bg-red-500/10'     },
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
    } catch (e) {
      console.error(e)
      setStarting(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#02040a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-500" />
            <span className="font-black tracking-widest font-mono text-lg">SENTINEL<span className="text-amber-500">.TRAIN</span></span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/instructor" className="text-xs text-slate-400 hover:text-white font-mono tracking-widest uppercase transition">
            Instructor View
          </Link>
          <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white font-mono tracking-widest uppercase transition">
            Live Dispatch
          </Link>
          <UserButton />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">Training Simulator</h1>
          <p className="text-slate-400 text-lg">Practice dispatch decisions under realistic pressure. Each scenario scores your speed and accuracy.</p>
        </div>

        {/* Scenario grid */}
        <div className="grid gap-6">
          {scenarios.map((scenario) => {
            const diff = DIFFICULTY_STYLE[scenario.difficulty as keyof typeof DIFFICULTY_STYLE] ?? DIFFICULTY_STYLE.intermediate
            const isStarting = starting === scenario.id
            return (
              <div key={scenario.id} className="glass-panel rounded-xl p-6 border border-slate-800/50 hover:border-slate-700/50 transition group">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold">{scenario.name}</h2>
                      <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${diff.color}`}>
                        {diff.label}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-4 leading-relaxed">{scenario.description}</p>

                    <div className="flex items-center gap-6 text-xs text-slate-500 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {scenario.duration_minutes} min
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        {scenario.events.length} incidents
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5" />
                        Max {scenario.events.length * 125} pts
                      </span>
                    </div>

                    {/* Event preview */}
                    <div className="flex gap-1.5 mt-4 flex-wrap">
                      {Array.from(new Set(scenario.events.map((e) => e.type))).map((type) => {
                        const count = scenario.events.filter((e) => e.type === type).length
                        const colors: Record<string, string> = {
                          fire: 'bg-orange-500/20 text-orange-300',
                          medical: 'bg-pink-500/20 text-pink-300',
                          police: 'bg-blue-500/20 text-blue-300',
                          accident: 'bg-yellow-500/20 text-yellow-300',
                        }
                        return (
                          <span key={type} className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase ${colors[type] ?? 'bg-slate-700 text-slate-300'}`}>
                            {type} ×{count}
                          </span>
                        )
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => startSession(scenario.id)}
                    disabled={isStarting}
                    className="ml-6 flex items-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold px-6 py-3 rounded-lg transition-all text-sm uppercase tracking-wider shrink-0 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                  >
                    {isStarting ? (
                      <span className="w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>Start <ChevronRight className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
