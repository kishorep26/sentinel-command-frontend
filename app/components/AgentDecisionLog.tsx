'use client'

import { useEffect, useState } from 'react';

interface IncidentHistoryEntry {
  id: number;
  incident_id: number;
  agent_id?: number;
  action: string;
  detail: string;
  timestamp: string;
}

export default function AgentDecisionLog() {
  const [history, setHistory] = useState<IncidentHistoryEntry[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/incident-history`);
        setHistory(await response.json());
      } catch (error) {
        setHistory([]);
      }
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border-2 border-white/10 rounded-2xl p-6 shadow-2xl">
      <h2 className="text-2xl font-black text-white mb-6">🧠 Decision Log ({history.length})</h2>
      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        {history.length === 0
          ? <div className="text-center text-gray-400 py-8">No recent logs</div>
          : history.map((entry) => (
            <div key={entry.id} className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
              <div className="flex gap-2 items-center mb-1">
                <span className="font-bold text-blue-300 text-xs">{entry.action}</span>
                <span className="text-gray-400 text-xs">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                {!!entry.agent_id && <span className="text-xs text-green-400">Agent {entry.agent_id}</span>}
                {!!entry.incident_id && <span className="text-xs text-yellow-300">Incident {entry.incident_id}</span>}
              </div>
              <div className="text-gray-100 text-xs">{entry.detail}</div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
