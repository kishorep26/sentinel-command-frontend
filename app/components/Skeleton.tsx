export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="glass-card rounded-xl p-5 animate-pulse space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-slate-700/60 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-700/60 rounded w-3/4" />
          <div className="h-3 bg-slate-700/40 rounded w-1/2" />
        </div>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-2 bg-slate-700/40 rounded" style={{ width: `${70 + (i % 3) * 10}%` }} />
      ))}
    </div>
  )
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} rows={2} />
      ))}
    </div>
  )
}
