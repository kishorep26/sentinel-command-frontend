'use client'

import { useSentinel } from '@/app/store/sentinel'

export default function AnalyticsDashboard() {
  const stats = useSentinel((s) => s.stats)

  const cards = [
    { label: 'Total Events', value: stats.total_incidents, color: 'border-blue-500', textColor: 'text-blue-300' },
    { label: 'Active', value: stats.active_incidents, color: 'border-red-500', textColor: 'text-red-300', pulse: true },
    { label: 'Resolved', value: stats.resolved_incidents, color: 'border-emerald-500', textColor: 'text-emerald-300' },
    { label: 'Agents Active', value: stats.active_agents || 0, color: 'border-yellow-500', textColor: 'text-yellow-300' },
  ]

  return (
    <div className="glass-panel rounded-2xl p-6 shadow-2xl h-full">
      <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
        <span className="text-4xl text-purple-400">📊</span> System Analytics
      </h2>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          {cards.map(({ label, value, color, textColor, pulse }) => (
            <div key={label} className={`glass-card rounded-xl p-4 text-center border-l-2 ${color} hover:bg-white/5 transition`}>
              <div className={`text-[10px] ${textColor} mb-1 uppercase tracking-widest font-bold`}>{label}</div>
              <div className={`text-3xl text-white font-black font-[Outfit] ${pulse ? 'animate-pulse' : ''}`}>{value}</div>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-xl p-5 mt-2">
          <div className="flex justify-between items-end mb-2">
            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Network Performance</div>
            <div className="text-xs text-emerald-400 font-mono">OPTIMAL</div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-blue-200 mb-1">
                <span>Avg Response Distance</span>
                <span>{(stats.average_response_time || 0).toFixed(2)} km</span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[75%] rounded-full" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-green-200 mb-1">
                <span>Resolve Rate</span>
                <span>
                  {stats.total_incidents > 0
                    ? ((stats.resolved_incidents / stats.total_incidents) * 100).toFixed(1)
                    : '0.0'} %
                </span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{
                    width: stats.total_incidents > 0
                      ? `${(stats.resolved_incidents / stats.total_incidents) * 100}%`
                      : '0%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
