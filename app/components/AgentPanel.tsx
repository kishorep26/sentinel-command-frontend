'use client'

import { Radio, Truck, ShieldCheck, Ambulance, Bot, Zap } from 'lucide-react'
import { useSentinel } from '@/app/store/sentinel'
import { SkeletonList } from './Skeleton'

function getBarColor(val: number, isFuel: boolean): string {
  if (isFuel) {
    if (val < 20) return 'bg-red-500'
    if (val < 50) return 'bg-yellow-500'
    return 'bg-emerald-500'
  }
  if (val > 80) return 'bg-red-500'
  if (val > 50) return 'bg-yellow-500'
  return 'bg-blue-500'
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'available': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    case 'busy': return 'bg-red-500/20 text-red-300 border-red-500/30'
    case 'refueling': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }
}

function AgentIcon({ type }: { type: string }) {
  const t = type.toLowerCase()
  if (t.includes('fire')) return <Truck className="w-8 h-8 text-orange-500" />
  if (t.includes('police')) return <ShieldCheck className="w-8 h-8 text-blue-500" />
  if (t.includes('medic')) return <Ambulance className="w-8 h-8 text-pink-500" />
  return <Bot className="w-8 h-8 text-slate-500" />
}

export default function AgentPanel() {
  const agents = useSentinel((s) => s.agents)
  const connected = useSentinel((s) => s.connected)

  return (
    <div className="glass-panel rounded-sm p-6 shadow-2xl h-full flex flex-col border border-slate-800/50">
      <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-3 tracking-wider uppercase border-b border-slate-800 pb-4">
        <Radio className="w-5 h-5 text-amber-600 animate-pulse" /> Active Agents ({agents.length})
      </h2>

      <div className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-2">
        {agents.length === 0 ? (
          !connected
            ? <SkeletonList count={3} />
            : (
              <div className="text-center text-slate-600 py-8 flex flex-col items-center">
                <Radio className="w-8 h-8 mb-2 opacity-50" />
                No agents online
              </div>
            )
        ) : (
          agents.map((agent) => (
            <div
              key={agent.id}
              className={`group glass-card rounded-xl p-5 relative overflow-hidden ${agent.status === 'responding' ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : ''}`}
            >
              <div className="absolute top-0 right-0 p-2 opacity-10">
                <div className="text-[10px] font-mono text-white">ID-{agent.id.toString().padStart(4, '0')}</div>
              </div>

              <div className="flex items-start gap-4 mb-3">
                <div className="relative">
                  <div className="p-2 bg-slate-900/50 rounded-xl border border-white/5">
                    <AgentIcon type={agent.type} />
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${agent.status === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-white font-bold text-lg whitespace-normal break-words pr-2">{agent.name}</h3>
                    <span className={`px-2 py-0.5 ${getStatusColor(agent.status)} rounded text-[10px] uppercase tracking-wider font-bold border`}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 font-mono mb-2">{(agent.role || 'unit').toUpperCase()} UNIT</div>
                  <div className="text-xs text-cyan-200 mb-3 flex items-center gap-2">
                    <Zap className="w-3 h-3 text-cyan-400" />
                    {agent.status_message || 'Awaiting orders...'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {(['fuel', 'stress'] as const).map((metric) => (
                  <div key={metric}>
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1 uppercase font-bold">
                      <span>{metric}</span>
                      <span>{Math.round(agent[metric])}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getBarColor(agent[metric], metric === 'fuel')} transition-all duration-1000`}
                        style={{ width: `${agent[metric]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono border-t border-white/5 pt-3">
                <div>EFF: <span className="text-white">{agent.efficiency}%</span></div>
                <div>RESP: <span className="text-white">{agent.successful_responses}</span></div>
                <div>UPD: <span className="text-gray-400">{new Date(agent.updated_at || Date.now()).toLocaleTimeString()}</span></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
