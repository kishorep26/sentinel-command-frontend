import AppHeader from '@/app/components/AppHeader'

export default function TrainingLoading() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <div className="pt-24 pb-16 px-8 max-w-5xl mx-auto">
        <div className="mb-10">
          <div className="h-3 w-32 bg-slate-800 rounded animate-pulse mb-3" />
          <div className="h-9 w-56 bg-slate-800 rounded animate-pulse mb-2" />
          <div className="h-4 w-80 bg-slate-800/60 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel rounded-xl p-6 border border-slate-800/50 animate-pulse">
              <div className="flex justify-between">
                <div className="flex-1">
                  <div className="h-6 w-48 bg-slate-800 rounded mb-3" />
                  <div className="h-4 w-96 bg-slate-800/60 rounded mb-4" />
                  <div className="flex gap-4">
                    {[1, 2, 3].map((j) => <div key={j} className="h-3 w-16 bg-slate-800/40 rounded" />)}
                  </div>
                </div>
                <div className="h-10 w-24 bg-slate-800 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
