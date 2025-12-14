'use client'

import { useState } from 'react';

interface GeoResult {
  lat: number;
  lon: number;
  address: string;
}

export default function ScenarioEditor({ refreshAction }: { refreshAction?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);

  const [formData, setFormData] = useState({
    type: 'auto',
    address: '',
    lat: 40.7128,
    lon: -74.0060,
    description: ''
  });

  const [selectedLocation, setSelectedLocation] = useState<GeoResult | null>(null);

  const incidentTypes = [
    { value: 'fire', label: '🔥 Fire' },
    { value: 'accident', label: '🚗 Accident' },
    { value: 'medical', label: '🚑 Medical' },
    { value: 'crime', label: '🚨 Crime' }
  ];

  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      // Direct client-side call to Nominatim to avoid backend timeouts/proxy issues
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5`
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();

      const results = data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        address: item.display_name
      }));

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching address:', error);
      // Fallback only on hard error
      setSearchResults([
        {
          lat: 40.7128,
          lon: -74.0060,
          address: '[Offline Fallback] Times Square, NYC'
        }
      ]);
    } finally {
      setSearching(false);
    }
  };


  const selectAddress = (result: GeoResult) => {
    setSelectedLocation(result);
    setFormData({
      ...formData,
      address: result.address.split(',')[0],
      lat: result.lat,
      lon: result.lon
    });
    setSearchResults([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLocation) {
      alert('Please select a location from the suggestions');
      return;
    }

    setLoading(true);

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      const incidentData = {
        type: formData.type,
        location: {
          lat: formData.lat,
          lon: formData.lon
        },
        description: formData.description || formData.address,
        status: 'active'
      };

      console.log('Sending incident:', incidentData);

      const response = await fetch(`${API_URL}/incidents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(incidentData)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Incident created:', result);

      setIsOpen(false);
      setFormData({ type: 'fire', address: '', lat: 40.7128, lon: -74.0060, description: '' });
      setSelectedLocation(null);

      if (refreshAction) {
        refreshAction();
      }
    } catch (error: any) {
      console.error('Error creating incident:', error);
      // Detailed debug error
      const targetUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      alert(`Connection Failed!\n\nTarget: ${targetUrl}\nError: ${error.message}\n\nPlease check: \n1. verify NEXT_PUBLIC_API_URL in Vercel\n2. verify Backend is running`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-8 py-4 rounded-full shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:shadow-[0_0_50px_rgba(168,85,247,0.8)] transition-all transform hover:scale-110 hover:-translate-y-1 font-bold text-lg z-50 border-2 border-white/20 backdrop-blur-md animate-pulse-glow"
      >
        <span className="mr-2">⚡</span> TRIGGER SCENARIO
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="glass-panel rounded-2xl p-8 max-w-md w-full border-2 border-white/20 shadow-2xl relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -z-10"></div>

            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-black text-white flex gap-2 items-center">
                <span className="text-purple-400">🎯</span> Create Incident
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-2xl hover:rotate-90 transition-transform"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-blue-300 uppercase tracking-widest mb-2">
                  Situation Report (REQUIRED)
                </label>
                <div className="text-[10px] text-gray-500 mb-2">
                  Describe the emergency clearly. The AI will analyze the text to classify the incident type (Fire, Medical, Police) and assign appropriate units.
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., 'Large structural fire detected near central plaza', 'Multi-vehicle collision with injuries', 'Armed robbery in progress'..."
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
                      setFormData({ ...formData, address: e.target.value });
                      setSelectedLocation(null); // Unlock if user edits
                      searchAddress(e.target.value);
                    }}
                    placeholder="Search coordinates..."
                    className="w-full bg-slate-900/80 text-white rounded-xl px-4 py-3 border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-mono text-sm"
                  />

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

                  {searching && (
                    <div className="absolute right-3 top-3.5">
                      <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}

                  {selectedLocation && (
                    <div className="mt-2 text-[10px] bg-emerald-500/10 text-emerald-400 p-2 rounded border border-emerald-500/20 font-mono">
                      ✅ LOCKED: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lon.toFixed(4)}
                    </div>
                  )}
                </div>
              </div>

              {/* Description field moved up to replace Type selector */}

              <button
                type="submit"
                disabled={loading || !selectedLocation}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-4 rounded-xl hover:from-purple-500 hover:to-pink-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/25 mt-4 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? 'INITIATING...' : '🚀 DEPLOY INCIDENT'}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
