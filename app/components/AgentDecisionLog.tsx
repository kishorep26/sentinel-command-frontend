'use client'

import { useState, useEffect } from 'react';

interface Agent {
  name: string;
  icon: string;
  incident: string | null;
  decision: string;
}

export default function AgentDecisionLog() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/agents`);
        const data = await response.json();
        setAgents(data.filter((a: Agent) => a.incident && a.incident.length > 0));
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };

    fetchAgents();
    const interval = setInterval(fetchAgents, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border-2 border-white/10 rounded-2xl p-6 shadow-2xl">
      <h2 className="text-2xl font-black text-white mb-6">🧠 Decision Log ({agents.length})</h2>
      <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
        {agents.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No active decisions</div>
        ) : (
          agents.map((agent, i) => (
            <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{agent.icon}</span>
                  <div>
                    <h3 className="font-bold text-white">{agent.name}</h3>
                    <p className="text-xs text-gray-400">Active Response</p>
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <span className="text-sm text-blue-300 font-bold">Incident:</span>
                <p className="text-sm text-gray-300">{agent.incident}</p>
              </div>

              <div className="bg-blue-900/30 p-2 rounded mb-2">
                <span className="text-sm text-yellow-300 font-bold">Decision:</span>
                <p className="text-sm text-gray-200">{agent.decision}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
