'use client'

import { useState, useEffect } from 'react';

interface Incident {
  id: number;
  type: string;
  location: {
    lat: number;
    lon: number;
  };
  description: string;
  status: string;
  timestamp: string;
}

export default function IncidentPanel() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resolving, setResolving] = useState<number | null>(null);

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchIncidents = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/incidents`);
      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  const resolveIncident = async (incidentId: number) => {
    setResolving(incidentId);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/incidents/${incidentId}/resolve`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        console.log(`✅ Incident ${incidentId} resolved`);
        await fetchIncidents();
      }
    } catch (error) {
      console.error('Error resolving incident:', error);
    } finally {
      setResolving(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'responding': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'dispatched': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getIncidentIcon = (type: string) => {
    switch(type) {
      case 'fire': return '🔥';
      case 'accident': return '🚗';
      case 'medical': return '🚑';
      case 'crime': return '🚨';
      default: return '⚠️';
    }
  };

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const resolvedIncidents = incidents.filter(i => i.status === 'resolved').length;

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border-2 border-white/10 rounded-2xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          🚨 Active Incidents ({activeIncidents.length})
        </h2>
        <span className="text-sm text-green-400 font-bold">✅ Resolved: {resolvedIncidents}</span>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
        {activeIncidents.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No active incidents</div>
        ) : (
          activeIncidents.map((incident) => (
            <div
              key={incident.id}
              className="group bg-slate-700/30 hover:bg-slate-700/50 border border-white/10 rounded-xl p-4 transition-all hover:shadow-xl"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{getIncidentIcon(incident.type)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-bold text-lg capitalize">{incident.type} - {incident.description}</h3>
                      <p className="text-blue-300 text-sm">📍 {incident.location.lat.toFixed(4)}, {incident.location.lon.toFixed(4)}</p>
                    </div>
                    <span className={`px-3 py-1 ${getStatusColor(incident.status)} rounded-full text-xs font-bold border`}>
                      {incident.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-gray-400 text-xs">🕒 {new Date(incident.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => resolveIncident(incident.id)}
                disabled={resolving === incident.id}
                className="mt-3 w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition text-sm"
              >
                {resolving === incident.id ? '⏳ Resolving...' : '✅ Mark as Resolved'}
              </button>
            </div>
          ))
        )}
      </div>

      <button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-xl transition shadow-lg">
        + View All
      </button>
    </div>
  );
}
