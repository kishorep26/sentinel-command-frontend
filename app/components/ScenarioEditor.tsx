'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { api } from '@/app/lib/api'
import { useSentinel } from '@/app/store/sentinel'

interface GeoResult {
  lat: number
  lon: number
  address: string
}

export default function ScenarioEditor() {
  const refresh = useSentinel((s) => s.refresh)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<GeoResult[]>([])
  const [selectedLocation, setSelectedLocation] = useState<GeoResult | null>(null)
  const [formData, setFormData] = useState({
    address: '',
    lat: 40.7128,
    lon: -74.006,
    description: '',
  })

  const searchAddress = async (query: string) => {
    if (query.length < 3) { setSearchResults([]); return }
    setSearching(true)
    try {
      // Call Nominatim directly — avoids backend proxy latency
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`,
        { headers: { 'User-Agent': 'sentinel-command-frontend/2.0' } }
      )
      const data = await res.json()
      setSearchResults(data.map((item: Record<string, string>) => ({
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        address: item.display_name,
      })))
    } catch {
      setSearchResults([{ lat: 40.7128, lon: -74.006, address: '[Fallback] Times Square, NYC' }])
    } finally {
      setSearching(false)
    }
  }

  const selectAddress = (result: GeoResult) => {
    setSelectedLocation(result)
    setFormData({ ...formData, address: result.address.split(',')[0], lat: result.lat, lon: result.lon })
    setSearchResults([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedLocation) { alert('Please select a location from the suggestions'); return }
    setLoading(true)
    try {
      const incidents = await api.incidents.create({
        type: 'auto',
        location: { lat: formData.lat, lon: formData.lon },
        description: formData.description || formData.address,
      })
      const types = incidents.map((i) => i.type.toUpperCase()).join(' + ')
      toast.success(
        incidents.length > 1
          ? `${incidents.length} units deployed — ${types}`
          : `${types} incident deployed`,
        { description: `${incidents.length} unit(s) dispatched to location` },
      )
      setIsOpen(false)
      setFormData({ address: '', lat: 40.7128, lon: -74.006, description: '' })
      setSelectedLocation(null)
      await refresh()
    } catch (error) {
      toast.error('Incident creation failed', { description: error instanceof Error ? error.message : 'Unknown error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-4 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_50px_rgba(168,85,247,0.8)] transition-all transform hover:scale-110 hover:-translate-y-1 font-bold text-lg z-50 border-2 border-white/20 backdrop-blur-md animate-pulse-glow"
      >
        <span className="mr-2">⚡</span> TRIGGER SCENARIO
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel rounded-2xl p-8 max-w-md w-full border-2 border-white/20 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -z-10" />

            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-black text-white flex gap-2 items-center">
                <span className="text-purple-400">🎯</span> Create Incident
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white text-2xl hover:rotate-90 transition-transform">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">
                  Situation Report (REQUIRED)
                </label>
                <p className="text-[10px] text-gray-500 mb-2">
                  Describe the emergency. AI will classify type and assign the nearest available unit.
                </p>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., 'Large structural fire near central plaza', 'Multi-vehicle collision with injuries'..."
                  rows={3}
                  className="w-full bg-slate-900/80 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">
                  📍 Location Target
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value })
                      setSelectedLocation(null)
                      searchAddress(e.target.value)
                    }}
                    placeholder="Search address or landmark..."
                    className="w-full bg-slate-900/80 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-mono text-sm"
                  />

                  {searching && (
                    <div className="absolute right-3 top-3.5">
                      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}

                  {searchResults.length > 0 && !selectedLocation && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/20 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto custom-scrollbar">
                      {searchResults.map((result, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectAddress(result)}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-purple-900/30 hover:text-white border-b border-white/5 last:border-b-0 transition flex flex-col gap-1"
                        >
                          <div className="font-bold">📍 {result.address.split(',')[0]}</div>
                          <div className="text-[10px] text-gray-500 font-mono truncate">{result.address}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {selectedLocation && (
                    <div className="mt-2 text-[10px] bg-emerald-500/10 text-emerald-400 p-2 rounded border border-emerald-500/20 font-mono">
                      ✅ LOCKED: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !selectedLocation || !formData.description.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25 mt-4 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? 'INITIATING...' : '🚀 DEPLOY INCIDENT'}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
