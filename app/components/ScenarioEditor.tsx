'use client'

import { useState } from 'react';

interface GeoResult {
  lat: number;
  lon: number;
  address: string;
}

export default function ScenarioEditor({ onIncidentCreated }: { onIncidentCreated?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<GeoResult[]>([]);

  const [formData, setFormData] = useState({
    type: 'fire',
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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(
        `${API_URL}/search-address?query=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        throw new Error('Failed to search address');
      }

      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching address:', error);
      setSearchResults([]);
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

      if (onIncidentCreated) {
        onIncidentCreated();
      }
    } catch (error) {
      console.error('Error creating incident:', error);
      alert('Error creating incident. Check console logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 font-bold text-lg z-50"
      >
        ⚡ Trigger Scenario
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-md w-full border-2 border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-white">🎯 Create Incident</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Incident Type */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Incident Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                >
                  {incidentTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Address Search */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  📍 Location
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({...formData, address: e.target.value});
                      searchAddress(e.target.value);
                    }}
                    placeholder="Type address... (e.g., Times Square, NYC)"
                    className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                  />

                  {/* Search Results Dropdown */}
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border-2 border-slate-600 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                      {searchResults.map((result, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => selectAddress(result)}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-slate-700 border-b border-slate-600 last:border-b-0 transition"
                        >
                          <div className="font-semibold text-white">📍 {result.address.split(',')[0]}</div>
                          <div className="text-xs text-gray-500">{result.address.split(',').slice(1, 3).join(',')}</div>
                        </button>
                      ))}
                    </div>
                  )}

                  {searching && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border-2 border-slate-600 rounded-lg p-3 z-50">
                      <span className="text-gray-400 text-sm">🔍 Searching...</span>
                    </div>
                  )}

                  {selectedLocation && (
                    <div className="mt-2 text-xs text-green-400">
                      ✅ Location selected: {selectedLocation.address}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="e.g., Building fire, Multiple injuries"
                  className="w-full bg-slate-700 text-white rounded-lg px-4 py-3 border-2 border-slate-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !selectedLocation}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Creating...' : '🚀 Deploy Incident'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
