'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@clerk/nextjs'
import { AlertTriangle, CheckCircle2, Clock, Flame, HeartPulse, Car, Siren, Shield, Radio } from 'lucide-react'
import { toast } from 'sonner'
import { training } from '@/app/lib/api'
import type { EventResult, Scenario, ScenarioEvent } from '@/app/types'

const UNIT_TYPES = ['fire', 'medical', 'police', 'accident'] as const
type UnitType = typeof UNIT_TYPES[number]

const TYPE_CONFIG: Record<UnitType, { label: string; icon: React.ReactNode; color: string; border: string; glow: string }> = {
  fire:     { label: 'Fire Engine',   icon: <Flame      className="w-4 h-4" />, color: 'text-orange-400', border: 'border-orange-500/30 hover:border-orange-400 bg-orange-500/10 hover:bg-orange-500/20', glow: 'hover:shadow-[0_0_15px_rgba(249,115,22,0.25)]' },
  medical:  { label: 'Ambulance',     icon: <HeartPulse className="w-4 h-4" />, color: 'text-pink-400',   border: 'border-pink-500/30   hover:border-pink-400   bg-pink-500/10   hover:bg-pink-500/20',   glow: 'hover:shadow-[0_0_15px_rgba(236,72,153,0.25)]'  },
  police:   { label: 'Police Patrol', icon: <Siren      className="w-4 h-4" />, color: 'text-blue-400',   border: 'border-blue-500/30   hover:border-blue-400   bg-blue-500/10   hover:bg-blue-500/20',   glow: 'hover:shadow-[0_0_15px_rgba(59,130,246,0.25)]'  },
  accident: { label: 'Traffic Unit',  icon: <Car        className="w-4 h-4" />, color: 'text-yellow-400', border: 'border-yellow-500/30 hover:border-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/20', glow: 'hover:shadow-[0_0_15px_rgba(234,179,8,0.25)]'   },
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
  const [nowMs, setNowMs] = useState(0)

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
          setActiveEvents((prev) => [...prev, { event, index, arrivedAt: Date.now(), dispatched: false, correct: null, responseMs: null }])
          toast.warning(`📡 ${event.type.toUpperCase()} — Incoming`, { description: event.description.slice(0, 55) + '…', duration: 4000 })
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
      const result: EventResult = { event_index: eventIndex, incident_type: chosenType, expected_type: event.event.type, response_time_ms: responseMs }
      resultsRef.current = [...resultsRef.current, result]
      if (correct) toast.success(`✅ Correct dispatch`, { description: `${TYPE_CONFIG[chosenType].label} · ${(responseMs / 1000).toFixed(1)}s`, duration: 2500 })
      else toast.error(`❌ Wrong unit`, { description: `Needed ${event.event.type.toUpperCase()} · sent ${chosenType.toUpperCase()}`, duration: 3000 })
      return prev.map((e) => e.index === eventIndex ? { ...e, dispatched: true, correct, responseMs } : e)
    })
  }

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const totalSecs = (scenario?.duration_minutes ?? 0) * 60
  const remaining = Math.max(0, totalSecs - elapsed)
  const progress = totalSecs > 0 ? Math.min((elapsed / totalSecs) * 100, 100) : 0
  const pending = activeEvents.filter((e) => !e.dispatched)
  const resolved = activeEvents.filter((e) => e.dispatched)
  const urgency = remaining < 60

  if (!scenario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600 font-mono text-sm animate-pulse flex items-center gap-2">
          <Radio className="w-4 h-4" /> Initialising scenario...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Session header */}
      <div className="fixed top-0 w-full z-[100] border-b border-white/10 bg-slate-950/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-8 py-3">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-amber-500" />
            <span className="font-mono font-bold tracking-wider text-white text-sm">{scenario.name}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-sm font-mono uppercase border tracking-widest ${
              scenario.difficulty === 'advanced'     ? 'text-red-400     border-red-500/30     bg-red-500/10'     :
              scenario.difficulty === 'beginner'     ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
                                                       'text-amber-400   border-amber-500/30   bg-amber-500/10'
            }`}>{scenario.difficulty}</span>
          </div>

          <div className="flex items-center gap-8 font-mono text-sm">
            <span className="text-slate-500">
              Correct: <span className="text-emerald-400 font-bold">{resolved.filter((e) => e.correct).length}</span>
              <span className="text-slate-700">/{resolved.length}</span>
            </span>
            <span className={`flex items-center gap-2 font-black text-xl tracking-wider ${urgency ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
              <Clock className="w-4 h-4" />
              {fmt(remaining)}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-slate-900">
          <div
            className={`h-full transition-all duration-1000 ${urgency ? 'bg-red-500' : 'bg-amber-500'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 pt-[57px] overflow-hidden">
        {/* Incident queue */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-5">
              <span className={`w-2 h-2 rounded-full ${pending.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`} />
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                {pending.length > 0 ? `${pending.length} incident${pending.length > 1 ? 's' : ''} awaiting dispatch` : 'Standby — awaiting calls'}
              </span>
            </div>

            {pending.length === 0 && (
              <div className="glass-panel rounded-xl p-14 text-center border border-slate-800/50">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-slate-700" />
                <div className="text-slate-600 font-mono text-sm">All clear — awaiting next incident</div>
              </div>
            )}

            <div className="space-y-4">
              {pending.map(({ event, index, arrivedAt }) => {
                const waitSecs = nowMs > 0 ? Math.floor((nowMs - arrivedAt) / 1000) : 0
                return (
                  <div key={index} className="glass-panel rounded-xl border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.08)] overflow-hidden">
                    <div className="px-5 py-4 border-b border-red-500/10">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Incident #{index + 1}</span>
                            <span className="text-[10px] font-mono text-red-400/70">{waitSecs}s ago</span>
                          </div>
                          <p className="text-white text-sm font-medium leading-relaxed">{event.description}</p>
                          <p className="text-slate-600 text-xs font-mono mt-1">
                            📍 {event.lat.toFixed(4)}, {event.lon.toFixed(4)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="px-5 py-4">
                      <div className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-3">Dispatch unit:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {UNIT_TYPES.map((type) => {
                          const cfg = TYPE_CONFIG[type]
                          return (
                            <button
                              key={type}
                              onClick={() => dispatch(index, type)}
                              className={`flex items-center gap-2.5 px-4 py-3 rounded-lg border font-bold text-sm transition-all ${cfg.color} ${cfg.border} ${cfg.glow}`}
                            >
                              {cfg.icon} {cfg.label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Log sidebar */}
        <div className="w-64 border-l border-white/10 flex flex-col">
          <div className="px-5 py-4 border-b border-white/10">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Dispatch Log</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {resolved.length === 0 && (
              <div className="text-slate-700 font-mono text-xs text-center pt-6">No dispatches yet</div>
            )}
            {[...resolved].reverse().map(({ event, index, correct, responseMs }) => (
              <div key={index} className={`glass-card rounded-lg p-3 border text-xs font-mono ${
                correct ? 'border-emerald-500/20 text-emerald-300' : 'border-red-500/20 text-red-300'
              }`}>
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  {correct ? '✅' : '❌'} {event.type.toUpperCase()}
                </div>
                <div className="text-slate-500">{(responseMs! / 1000).toFixed(1)}s · #{index + 1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
