'use client'

import { useSentinel } from '@/app/store/sentinel'

export default function LiveStats() {
  const stats = useSentinel((s) => s.stats)

  return (
    <div className="bg-green-100 p-2 my-2 rounded text-sm flex gap-4">
      <span>🔥 Active: <b>{stats.active_incidents}</b></span>
      <span>✅ Resolved: <b>{stats.resolved_incidents}</b></span>
      <span>🚨 Total: <b>{stats.total_incidents}</b></span>
    </div>
  )
}
