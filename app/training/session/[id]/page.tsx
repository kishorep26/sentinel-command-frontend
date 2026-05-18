'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { AlertTriangle, CheckCircle2, Clock, Flame, HeartPulse, Car, Siren, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { training } from '@/app/lib/api'
import type { EventResult, Scenario, ScenarioEvent } from '@/app/types'

const UNIT_TYPES = ['fire', 'medical', 'police', 'accident'] as const
type UnitType = typeof UNIT_TYPES[number]

const TYPE_CONFIG: Record<UnitType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  fire:     { label: 'Fire Engine',   icon: <Flame className="w-5 h-5" />,      color: 'text-orange-400', bg: 'bg-orange-500/20 hover:bg-orange-500/40 border-orange-500/30' },
  medical:  { label: 'Ambulance',     icon: <HeartPulse className="w-5 h-5" />, color: 'text-pink-400',   bg: 'bg-pink-500/20   hover:bg-pink-500/40   border-pink-500/30'   },
  police:   { label: 'Police Patrol', icon: <Siren className="w-5 h-5" />,      color: 'text-blue-400',   bg: 'bg-blue-500/20   hover:bg-blue-500/40   border-blue-500/30'   },
  accident: { label: 'Traffic Unit',  icon: <Car className="w-5 h-5" />,        color: 'text-yellow-400', bg: 'bg-yellow-500/20 hover:bg-yellow-500/40 border-yellow-500/30' },
}

interface ActiveEvent {
  event: ScenarioEvent
  index: number
  arrivedAt: number
  dispatched: boolean
  correct: boolean | null
  responseMs: number | null
}

export default function TrainingSession() {
  const { id } = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const scenarioId = searchParams.get('scenario')
  const router = useRouter()
  const { getToken } = useAuth()

  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [activeEvents, setActiveEvents] = useState<ActiveEvent[]>([])
  const [nowMs, setNowMs] = useState(0) // updated every second, safe to use in render

  // initialised in useEffect — avoids Date.now() in render
  const startTimeRef = useRef<number>(0)
  const firedRef = useRef<Set<number>>(new Set())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const eventTimersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const resultsRef = useRef<EventResult[]>([])

  const endSession = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    const timers = eventTimersRef.current
    timers.forEach(clearTimeout)
    try {
      const token = await getToken()
      await training.sessions.complete(Number(id), resultsRef.current, token ?? undefined)
      router.push(`/training/results/${id}`)
    } catch {
      router.push('/training')
    }
  }, [id, getToken, router])

  useEffect(() => {
    if (!scenarioId) return
    startTimeRef.current = Date.now()

    training.scenarios.get(Number(scenarioId)).then((s) => {
      setScenario(s)

      s.events.forEach((event, index) => {
        const t = setTimeout(() => {
          if (firedRef.current.has(index)) return
          firedRef.current.add(index)
          setActiveEvents((prev) => [...prev, {
            event, index,
            arrivedAt: Date.now(),
            dispatched: false, correct: null, responseMs: null,
          }])
          toast.info(`📡 Incoming: ${event.type.toUpperCase()}`, { description: event.description.slice(0, 60) })
        }, event.at_seconds * 1000)
        eventTimersRef.current.push(t)
      })

      const endT = setTimeout(() => endSession(), s.duration_minutes * 60 * 1000)
      eventTimersRef.current.push(endT)
    })

    timerRef.current = setInterval(() => {
      const now = Date.now()
      setElapsed(Math.floor((now - startTimeRef.current) / 1000))
      setNowMs(now)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      const timers = eventTimersRef.current
      timers.forEach(clearTimeout)
    }
  }, [scenarioId, endSession])

  const dispatch = (eventIndex: number, chosenType: UnitType) => {
    setActiveEvents((prev) => {
      const event = prev.find((e) => e.index === eventIndex)
      if (!event || event.dispatched) return prev

      const responseMs = Date.now() - event.arrivedAt
      const correct = chosenType === event.event.type
      const result: EventResult = {
        event_index: eventIndex,
        incident_type: chosenType,
        expected_type: event.event.type,
        response_time_ms: responseMs,
      }
      resultsRef.current = [...resultsRef.current, result]

      if (correct) toast.success(`✅ Correct — ${(responseMs / 1000).toFixed(1)}s`, { duration: 2000 })
      else toast.error(`❌ Wrong unit — needed ${event.event.type.toUpperCase()}`, { duration: 2500 })

      return prev.map((e) =>
        e.index === eventIndex ? { ...e, dispatched: true, correct, responseMs } : e
      )
    })
  }

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const totalSecs = (scenario?.duration_minutes ?? 0) * 60
  const progress = totalSecs > 0 ? Math.min((elapsed / totalSecs) * 100, 100) : 0
  const pending = activeEvents.filter((e) => !e.dispatched)
  const resolved = activeEvents.filter((e) => e.dispatched)

  if (!scenario) {
    return (
      <div className="min-h-screen bg-[#02040a] flex items-center justify-center">
        <div className="text-slate-500 font-mono animate-pulse">Initialising scenario...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#02040a] text-white flex flex-col">
      <div className="border-b border-white/10 px-8 py-3 flex items-center justify-between bg-slate-950/80 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <Shield className="w-5 h-5 text-amber-500" />
          <span className="font-mono font-bold tracking-wider">{scenario.name}</span>
          <span className={`text-[11px] px-2 py-0.5 rounded font-mono uppercase border ${
            scenario.difficulty === 'advanced'     ? 'text-red-400     border-red-500/30     bg-red-500/10'     :
            scenario.difficulty === 'beginner'     ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                                                     'text-amber-400   border-amber-500/30   bg-amber-500/10'
          }`}>{scenario.difficulty}</span>
        </div>
        <div className="flex items-center gap-6 font-mono text-sm">
          <span className="text-slate-400">Correct: <span className="text-emerald-400 font-bold">{resolved.filter((e) => e.correct).length}/{resolved.length}</span></span>
          <span className="flex items-center gap-1.5 text-amber-400 font-bold text-lg">
            <Clock className="w-4 h-4" />
            {fmt(Math.max(0, totalSecs - elapsed))}
          </span>
        </div>
      </div>

      <div className="h-1 bg-slate-800">
        <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Active Incidents Requiring Dispatch ({pending.length})
            </h2>

            {pending.length === 0 && (
              <div className="text-slate-600 text-center py-16 font-mono">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-900/50" />
                Awaiting incoming calls...
              </div>
            )}

            <div className="space-y-4">
              {pending.map(({ event, index, arrivedAt }) => {
                const waitSecs = Math.floor((nowMs - arrivedAt) / 1000)
                return (
                  <div key={index} className="glass-panel rounded-xl p-5 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                    <div className="flex items-start gap-3 mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
                      <div className="flex-1">
                        <div className="text-xs font-mono text-slate-500 mb-1">
                          INCIDENT #{index + 1} · {waitSecs}s ago
                        </div>
                        <p className="text-white font-medium leading-relaxed">{event.description}</p>
                        <div className="text-xs text-slate-500 font-mono mt-1">
                          📍 {event.lat.toFixed(4)}, {event.lon.toFixed(4)}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-mono text-slate-500 mb-3 uppercase tracking-wider">Select unit to dispatch:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {UNIT_TYPES.map((type) => {
                        const cfg = TYPE_CONFIG[type]
                        return (
                          <button
                            key={type}
                            onClick={() => dispatch(index, type)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-lg border font-bold text-sm transition-all ${cfg.bg} ${cfg.color}`}
                          >
                            {cfg.icon}{cfg.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="w-72 border-l border-white/10 p-4 overflow-y-auto">
          <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Dispatch Log</h2>
          <div className="space-y-2">
            {[...resolved].reverse().map(({ event, index, correct, responseMs }) => (
              <div key={index} className={`p-3 rounded-lg text-xs font-mono border ${
                correct ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'
              }`}>
                <div className="font-bold mb-0.5">{correct ? '✅' : '❌'} {event.type.toUpperCase()}</div>
                <div className="text-slate-500">{(responseMs! / 1000).toFixed(1)}s response</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
