'use client'

import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'
import { useSentinel } from '@/app/store/sentinel'
import { api } from '@/app/lib/api'

export default function BatmanResponse() {
  const incidents = useSentinel((s) => s.incidents)
  const refresh = useSentinel((s) => s.refresh)
  const activeCount = incidents.filter((i) => i.status !== 'resolved').length

  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<'idle' | 'alert' | 'deploy' | 'resolve'>('idle')
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (activeCount > 8 && !isActive) {
      triggerProtocol()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCount])

  const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

  const triggerProtocol = async () => {
    setIsActive(true)

    setPhase('alert')
    await sleep(2000)

    setPhase('deploy')
    await sleep(2000)

    setPhase('resolve')
    for (let i = 10; i >= 0; i--) {
      setCountdown(i)
      await sleep(1000)
    }

    // Resolve all active incidents via the typed API layer
    const active = incidents.filter((i) => i.status !== 'resolved')
    await Promise.allSettled(active.map((i) => api.incidents.resolve(i.id)))
    await refresh()

    await sleep(2000)
    setIsActive(false)
    setPhase('idle')
    setCountdown(10)
  }

  if (!isActive) return null

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {phase === 'deploy' && (
        <div className="absolute inset-0 bg-yellow-500 animate-pulse opacity-20" />
      )}

      {phase === 'alert' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm pointer-events-auto">
          <div className="text-center animate-pulse">
            <div className="text-red-500 text-8xl font-black mb-4 tracking-widest">⚠️ ALERT ⚠️</div>
            <div className="text-amber-500 text-4xl font-bold uppercase tracking-[0.3em]">System Overwhelmed</div>
            <div className="text-slate-400 text-2xl mt-4 font-mono">Activating Emergency Protocol...</div>
          </div>
        </div>
      )}

      {phase === 'deploy' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/95 backdrop-blur-md pointer-events-auto">
          <div className="text-center">
            <div className="text-9xl mb-6 animate-bounce">🦇</div>
            <div className="text-amber-500 text-6xl font-black uppercase tracking-[0.4em] mb-4 animate-pulse">BATMAN</div>
            <div className="text-slate-300 text-3xl uppercase tracking-widest">To The Rescue</div>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Zap className="w-8 h-8 text-yellow-500 animate-pulse" />
              <span className="text-yellow-500 text-xl font-mono">DEPLOYING...</span>
              <Zap className="w-8 h-8 text-yellow-500 animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {phase === 'resolve' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-black via-slate-900 to-black opacity-95 pointer-events-auto" />

          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-6xl"
              style={{
                top: `${(i * 37) % 100}%`,
                left: '-10%',
                animation: `fly-across ${3 + (i % 3)}s ${(i * 0.3) % 3}s linear infinite`,
              }}
            >
              🦇
            </div>
          ))}

          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <div className="text-center">
              <div className="text-amber-500 text-3xl font-bold uppercase tracking-[0.3em] mb-8">
                Batman Resolving Incidents
              </div>
              <div className="relative">
                <div className="text-[200px] font-black text-amber-600 leading-none animate-pulse">{countdown}</div>
                <div className="absolute inset-0 text-[200px] font-black text-amber-500 blur-xl opacity-50 animate-pulse">{countdown}</div>
              </div>
              <div className="text-slate-400 text-2xl mt-8 font-mono uppercase tracking-widest">Neutralizing Threats...</div>
              <div className="mt-12 w-96 mx-auto">
                <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-amber-900">
                  <div
                    className="h-full bg-gradient-to-r from-amber-600 to-yellow-500 transition-all duration-1000"
                    style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-transparent via-yellow-500 to-transparent opacity-30 animate-pulse" />
          <div className="absolute top-0 right-1/4 w-1 h-full bg-gradient-to-b from-transparent via-yellow-500 to-transparent opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </>
      )}

      <style>{`
        @keyframes fly-across {
          0% { transform: translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateX(120vw) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
