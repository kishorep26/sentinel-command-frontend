import AppHeader from '@/app/components/AppHeader'

export default function InstructorLoading() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <div className="pt-24 pb-16 px-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="h-3 w-28 bg-slate-800 rounded animate-pulse mb-3" />
          <div className="h-9 w-64 bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-panel rounded-xl p-5 border border-slate-800/50 animate-pulse">
              <div className="h-3 w-20 bg-slate-800 rounded mb-3" />
              <div className="h-8 w-16 bg-slate-800 rounded" />
            </div>
          ))}
        </div>
        <div className="glass-panel rounded-xl border border-slate-800/50 overflow-hidden animate-pulse">
          <div className="px-6 py-4 border-b border-slate-800/50"><div className="h-5 w-32 bg-slate-800 rounded" /></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="px-6 py-4 flex justify-between border-b border-slate-800/30">
              <div><div className="h-4 w-40 bg-slate-800 rounded mb-2" /><div className="h-3 w-56 bg-slate-800/60 rounded" /></div>
              <div className="flex gap-4 items-center">
                {[1, 2, 3].map((j) => <div key={j} className="h-4 w-12 bg-slate-800/60 rounded" />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
