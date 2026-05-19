'use client'

import { useState } from 'react'
import { Plus, MapPin, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/app/lib/api'
import { useSentinel } from '@/app/store/sentinel'

interface GeoResult { lat: number; lon: number; address: string }

export default function ScenarioEditor() {
  const refresh = useSentinel((s) => s.refresh)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<GeoResult[]>([])
  const [selected, setSelected] = useState<GeoResult | null>(null)
  const [form, setForm] = useState({ address: '', lat: 40.7128, lon: -74.006, description: '' })

  const searchAddress = async (q: string) => {
    if (q.length < 3) { setResults([]); return }
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=5`,
        { headers: { 'User-Agent': 'sentinel-command-frontend/2.0' } }
      )
      setResults((await res.json()).map((r: Record<string, string>) => ({
        lat: parseFloat(r.lat), lon: parseFloat(r.lon), address: r.display_name,
      })))
    } catch {
      setResults([{ lat: 40.7128, lon: -74.006, address: '[Fallback] Times Square, NYC' }])
    } finally {
      setSearching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    setLoading(true)
    try {
      const incidents = await api.incidents.create({
        type: 'auto',
        location: { lat: form.lat, lon: form.lon },
        description: form.description || form.address,
      })
      const types = incidents.map((i) => i.type.toUpperCase()).join(' + ')
      toast.success(incidents.length > 1 ? `${incidents.length} units deployed` : `${types} unit deployed`, {
        description: `${incidents.length} unit(s) dispatched to location`,
      })
      setIsOpen(false)
      setForm({ address: '', lat: 40.7128, lon: -74.006, description: '' })
      setSelected(null)
      await refresh()
    } catch (e) {
      toast.error('Failed to create incident', { description: e instanceof Error ? e.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-black px-6 py-3.5 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.35)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] transition-all text-sm uppercase tracking-widest font-mono"
      >
        <Plus className="w-4 h-4" />
        Deploy Incident
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="glass-panel rounded-2xl w-full max-w-md border border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 className="font-black text-white tracking-tight">Deploy Incident</h2>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">AI classifies type and dispatches units</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Description */}
              <div>
                <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                  Situation Report <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the emergency — AI will classify type and dispatch appropriate units..."
                  rows={3}
                  required
                  className="w-full bg-slate-900/80 text-white text-sm rounded-xl px-4 py-3 border border-white/10 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition resize-none placeholder:text-slate-600"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                  <MapPin className="w-3 h-3 inline mr-1" />Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => {
                      setForm({ ...form, address: e.target.value })
                      setSelected(null)
                      searchAddress(e.target.value)
                    }}
                    placeholder="Search address or landmark..."
                    className="w-full bg-slate-900/80 text-white text-sm rounded-xl px-4 py-3 border border-white/10 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition font-mono placeholder:text-slate-600"
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-3.5 w-4 h-4 text-amber-500 animate-spin" />
                  )}
                  {results.length > 0 && !selected && (
                    <div className="absolute top-full left-0 right-0 mt-1 glass-panel rounded-xl border border-white/10 shadow-2xl z-50 max-h-52 overflow-y-auto custom-scrollbar">
                      {results.map((r, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSelected(r)
                            setForm({ ...form, address: r.address.split(',')[0], lat: r.lat, lon: r.lon })
                            setResults([])
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 border-b border-white/5 last:border-0 transition"
                        >
                          <div className="text-white font-medium truncate">{r.address.split(',')[0]}</div>
                          <div className="text-[10px] text-slate-600 font-mono truncate mt-0.5">{r.address}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  {selected && (
                    <div className="mt-1.5 text-[11px] bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-mono flex items-center gap-1.5">
                      <span className="text-emerald-500">✓</span>
                      {selected.lat.toFixed(4)}, {selected.lon.toFixed(4)}
                      <button type="button" onClick={() => { setSelected(null); setForm({ ...form, address: '' }) }} className="ml-auto text-slate-600 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !selected || !form.description.trim()}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black py-3.5 rounded-xl transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Initiating...</>
                  : 'Deploy Incident'
                }
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
