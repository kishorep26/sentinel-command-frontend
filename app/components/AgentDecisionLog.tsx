'use client'

import { useEffect, useState } from 'react';

interface IncidentHistoryEntry {
  id: number;
  incident_id: number;
  agent_id?: number;
  event_type: string; // Renamed from action to match backend
  description: string; // Renamed from detail to match backend
  timestamp: string;
}

export default function AgentDecisionLog() {
  const [history, setHistory] = useState<IncidentHistoryEntry[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/incident-history`);
        const data = await response.json();
        // Ensure array
        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        setHistory([]);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel rounded-sm p-6 shadow-2xl h-full flex flex-col border border-slate-800/50">
      <h2 className="text-xl font-bold text-slate-200 mb-6 flex items-center gap-3 tracking-wider uppercase border-b border-slate-800 pb-4">
        <span className="text-3xl text-amber-600">🧠</span> Neural Log
        <span className="text-xs font-mono text-slate-600 bg-black/30 px-2 py-1 rounded ml-auto border border-slate-800">
          LIVE FEED
        </span>
      </h2>

      <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 pr-2 font-mono text-sm">
        {history.length === 0 ? (
          <div className="text-center text-slate-600 py-12 flex flex-col items-center">
            <div className="animate-spin h-6 w-6 border-2 border-amber-600 border-t-transparent rounded-full mb-3"></div>
            <div>Awaiting Network Traffic...</div>
          </div>
        ) : (
          history.map((entry) => (
            <div key={entry.id} className="glass-card p-3 rounded-sm border-l-2 border-amber-600/50 hover:bg-white/5 transition flex gap-3 text-xs">
              <div className="text-slate-600 min-w-[60px]">
                {new Date(entry.timestamp).toLocaleTimeString([], { hour12: false })}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {entry.agent_id ? (
                    <span className="text-amber-500 font-bold">UNIT-{entry.agent_id}</span>
                  ) : (
                    <span className="text-blue-400 font-bold">SYSTEM</span>
                  )}
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide px-1.5 py-0.5 border border-slate-800 rounded">
                    {entry.event_type}
                  </span>
                </div>
                <div className="text-slate-400 leading-relaxed">
                  {entry.description}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
