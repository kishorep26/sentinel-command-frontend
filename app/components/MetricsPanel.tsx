'use client'

import { useSentinel } from '@/app/store/sentinel'

interface MetricCardProps {
  label: string
  value: string | number
  subtext: string
  color: string
}

function MetricCard({ label, value, subtext, color }: MetricCardProps) {
  return (
    <div className={`glass-card p-6 rounded-2xl border-l-4 ${color} hover:translate-y-[-2px]`}>
      <div className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">{label}</div>
      <div className="text-4xl font-black text-white mb-1 font-[Outfit]">{value}</div>
      <div className="text-xs text-gray-500 font-mono">{subtext}</div>
    </div>
  )
}

export default function MetricsPanel() {
  const stats = useSentinel((s) => s.stats)

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <MetricCard label="Total Incidents" value={stats.total_incidents} subtext="All time events" color="border-blue-500" />
      <MetricCard label="Active Now" value={stats.active_incidents} subtext="Requires attention" color="border-red-500 animate-pulse-glow" />
      <MetricCard label="Resolved" value={stats.resolved_incidents} subtext="Successfully closed" color="border-emerald-500" />
      <MetricCard
        label="Avg Response"
        value={`${(stats.average_response_time || 0).toFixed(2)}km`}
        subtext="Distance to target"
        color="border-purple-500"
      />
      <MetricCard label="Total Agents" value={stats.total_agents} subtext="Fleet strength" color="border-cyan-500" />
    </div>
  )
}
