'use client'

import { useState, useEffect } from 'react';
import { Flame, Car, HeartPulse, Siren, AlertTriangle, BellOff, CheckCircle2 } from 'lucide-react';

interface Incident {
  id: number;
  type: string;
  location: { lat: number; lon: number };
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
        await fetchIncidents();
      }
    } catch (error) {
      console.error('Error resolving incident:', error);
    } finally {
      setResolving(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'responding': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'dispatched': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'resolved': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getIncidentIcon = (type: string) => {
    switch (type) {
      case 'fire': return <Flame className="w-8 h-8 text-orange-500" />;
      case 'accident': return <Car className="w-8 h-8 text-yellow-500" />;
      case 'medical': return <HeartPulse className="w-8 h-8 text-pink-500" />;
      case 'crime': return <Siren className="w-8 h-8 text-red-500" />;
      default: return <AlertTriangle className="w-8 h-8 text-gray-400" />;
    }
  };

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');

  return (
    <div className="glass-panel rounded-sm p-6 shadow-2xl h-full flex flex-col border border-slate-800/50">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-slate-200 flex items-center gap-3 tracking-wider uppercase">
          <div className="relative">
            <Siren className="w-5 h-5 text-amber-600" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
            </span>
          </div>
          Active Incidents ({activeIncidents.length})
        </h2>
      </div>

      <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2">
        {activeIncidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-600">
            <CheckCircle2 className="w-12 h-12 mb-2 text-emerald-900/50" />
            <div className="font-bold text-lg">No Active Threats</div>
            <div className="text-xs mt-1 text-emerald-900/70 font-mono">SECTOR SECURE</div>
          </div>
        ) : (
          activeIncidents.map((incident) => (
            <div
              key={incident.id}
              className="group glass-card hover:bg-white/5 rounded-xl p-4 transition-all hover:shadow-lg hover:border-red-500/30 relative overflow-hidden"
            >
              {/* Warning tape effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-5 pointer-events-none bg-[repeating-linear-gradient(45deg,#000,#000_10px,#ecc94b_10px,#ecc94b_20px)]"></div>

              <div className="flex items-start gap-4 relative z-10">
                <div className="p-2 bg-slate-900/50 rounded-lg">{getIncidentIcon(incident.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="pr-2">
                      <h3 className="text-white font-bold text-lg capitalize whitespace-normal break-words leading-tight">
                        {incident.type}
                      </h3>
                      <p className="text-gray-300 text-sm mt-0.5 whitespace-normal break-words">{incident.description}</p>
                    </div>
                    <span className={`px-2 py-0.5 ${getStatusColor(incident.status)} rounded text-[10px] uppercase font-bold border shrink-0`}>
                      {incident.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                    <span>ID: #{incident.id}</span>
                    <span>📍 {(incident.location?.lat || 0).toFixed(4)}, {(incident.location?.lon || 0).toFixed(4)}</span>
                    <span>🕒 {new Date(incident.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => resolveIncident(incident.id)}
                disabled={resolving === incident.id}
                className="mt-3 w-full bg-gradient-to-r from-red-900/40 to-red-800/40 hover:from-emerald-600 hover:to-emerald-700 border border-red-500/20 hover:border-emerald-400 text-gray-300 hover:text-white font-bold py-2 rounded-lg transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2"
              >
                {resolving === incident.id ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
                    Processing...
                  </>
                ) : 'Resolve Situation'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
