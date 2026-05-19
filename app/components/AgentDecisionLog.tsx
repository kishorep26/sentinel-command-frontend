'use client'

import { Terminal } from 'lucide-react'
import { useSentinel } from '@/app/store/sentinel'

export default function AgentDecisionLog() {
  const history = useSentinel((s) => s.history)

  return (
    <div className="glass-panel rounded-xl h-full flex flex-col border border-slate-800/50">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-800/50">
        <Terminal className="w-4 h-4 text-amber-500" />
        <span className="text-sm font-bold text-white tracking-wider uppercase font-mono">Dispatch Log</span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-slate-600">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
          LIVE
        </span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-700 py-8">
            <div className="w-5 h-5 border border-slate-700 border-t-amber-600 rounded-full animate-spin mb-2" />
            <span className="text-xs font-mono">Awaiting events...</span>
          </div>
        ) : (
          history.map((entry) => (
            <div key={entry.id} className="flex gap-2.5 text-xs font-mono group hover:bg-white/3 px-2 py-1.5 rounded-lg transition">
              <span className="text-slate-700 shrink-0 pt-0.5">
                {new Date(entry.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className={`font-bold ${entry.agent_id ? 'text-amber-500' : 'text-blue-400'}`}>
                    {entry.agent_id ? `UNIT-${entry.agent_id}` : 'SYS'}
                  </span>
                  <span className="text-[9px] text-slate-700 uppercase tracking-wider border border-slate-800 px-1 py-px rounded">
                    {entry.event_type}
                  </span>
                </div>
                <p className="text-slate-500 leading-snug line-clamp-2">{entry.description}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
