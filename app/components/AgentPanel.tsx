'use client'

import { useState, useEffect } from 'react';

interface Agent {
  name: string;
  icon: string;
  status: string;
  incident: string | null;
  decision: string;
  responseTime: string;
  efficiency: number;
}

export default function AgentPanel() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/agents`);
        const data = await response.json();
        setAgents(data.filter((a: Agent) => a.status === 'Responding' || a.incident));
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };

    fetchAgents();
    const interval = setInterval(fetchAgents, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    if (status === 'Responding') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    if (status === 'Available') return 'bg-green-500/20 text-green-300 border-green-500/30';
    return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border-2 border-white/10 rounded-2xl p-6 shadow-2xl">
      <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
        🤖 Active Agents ({agents.filter(a => a.incident).length})
      </h2>

      <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
        {agents.filter(a => a.incident).length === 0 ? (
          <div className="text-center text-gray-400 py-8">No active responses</div>
        ) : (
          agents.map((agent, idx) => (
            agent.incident && (
              <div
                key={idx}
                className="group bg-slate-700/30 hover:bg-slate-700/50 border border-white/10 rounded-xl p-5 transition-all hover:shadow-xl"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">{agent.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-white font-bold text-lg">{agent.name}</h3>
                      <span className={`px-3 py-1 ${getStatusColor(agent.status)} rounded-full text-xs font-bold border`}>
                        {agent.status}
                      </span>
                    </div>
                    {agent.incident && (
                      <p className="text-blue-300 text-sm">🎯 {agent.incident}</p>
                    )}
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Efficiency</span>
                    <span className="text-white font-bold">{agent.efficiency}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                      style={{ width: `${agent.efficiency}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-purple-500/20 rounded-lg p-3">
                  <div className="text-purple-300 text-xs font-bold mb-2">💡 AI Decision:</div>
                  <p className="text-gray-300 text-sm leading-relaxed">{agent.decision}</p>
                </div>
              </div>
            )
          ))
        )}
      </div>
    </div>
  );
}
