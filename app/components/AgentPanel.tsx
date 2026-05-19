'use client'

import { Radio, Truck, ShieldCheck, Ambulance, Bot } from 'lucide-react'
import { useSentinel } from '@/app/store/sentinel'
import { SkeletonList } from './Skeleton'
import type { Agent } from '@/app/types'

const STATUS_STYLE: Record<string, string> = {
  available:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  busy:       'bg-red-500/15     text-red-400     border-red-500/25',
  refueling:  'bg-amber-500/15   text-amber-400   border-amber-500/25',
}

const BAR_FUEL  = (v: number) => v < 20 ? 'bg-red-500' : v < 50 ? 'bg-amber-500' : 'bg-emerald-500'
const BAR_STRESS = (v: number) => v > 80 ? 'bg-red-500' : v > 50 ? 'bg-amber-500' : 'bg-blue-500'

function AgentIcon({ type }: { type: string }) {
  const t = type.toLowerCase()
  if (t === 'fire')    return <Truck      className="w-5 h-5 text-orange-400" />
  if (t === 'police')  return <ShieldCheck className="w-5 h-5 text-blue-400"   />
  if (t === 'medical') return <Ambulance  className="w-5 h-5 text-pink-400"   />
  return                      <Bot        className="w-5 h-5 text-slate-400"  />
}

function AgentCard({ agent }: { agent: Agent }) {
  const statusStyle = STATUS_STYLE[agent.status] ?? 'bg-slate-700/20 text-slate-400 border-slate-700/30'
  const isActive = agent.status === 'available'

  return (
    <div className="glass-card rounded-xl p-4 border border-white/5">
      <div className="flex items-center gap-3 mb-3">
        {/* Icon + status dot */}
        <div className="relative">
          <div className="w-9 h-9 rounded-lg bg-slate-900/60 border border-white/5 flex items-center justify-center">
            <AgentIcon type={agent.type} />
          </div>
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${
            isActive ? 'bg-emerald-500' : agent.status === 'busy' ? 'bg-red-500' : 'bg-amber-500'
          }`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-white truncate">{agent.name}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${statusStyle}`}>
              {agent.status}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
            {agent.status_message || `${agent.role.toUpperCase()} UNIT`}
          </p>
        </div>
      </div>

      {/* Fuel + Stress bars */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'FUEL',   val: agent.fuel,   bar: BAR_FUEL(agent.fuel)   },
          { label: 'STRESS', val: agent.stress, bar: BAR_STRESS(agent.stress) },
        ].map(({ label, val, bar }) => (
          <div key={label}>
            <div className="flex justify-between text-[10px] font-mono text-slate-600 mb-1">
              <span>{label}</span><span>{Math.round(val)}%</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${bar} transition-all duration-700`} style={{ width: `${val}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex justify-between mt-3 text-[10px] font-mono text-slate-700 border-t border-white/5 pt-2">
        <span>EFF {Math.round(agent.efficiency)}%</span>
        <span>{agent.successful_responses} completed</span>
      </div>
    </div>
  )
}

export default function AgentPanel() {
  const agents    = useSentinel((s) => s.agents)
  const connected = useSentinel((s) => s.connected)

  return (
    <div className="glass-panel rounded-xl h-full flex flex-col border border-slate-800/50">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-800/50">
        <Radio className="w-4 h-4 text-amber-500 animate-pulse" />
        <span className="text-sm font-bold text-white tracking-wider uppercase font-mono">
          Fleet Status
        </span>
        <span className="ml-auto text-[10px] font-mono text-slate-600 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
          {agents.length} units
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {agents.length === 0
          ? (!connected ? <SkeletonList count={3} /> : (
            <div className="text-center text-slate-600 py-10 font-mono text-sm">No units online</div>
          ))
          : agents.map((agent) => <AgentCard key={agent.id} agent={agent} />)
        }
      </div>
    </div>
  )
}
