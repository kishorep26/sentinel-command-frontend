'use client'

import { useState, useEffect } from 'react';

interface Agent {
  id: number;
  name: string;
  icon: string;
  status: string;
  current_incident: string | null;
  decision: string | null;
  response_time: number;
  efficiency: number;
  total_responses: number;
  successful_responses: number;
  updated_at?: string;
}

export default function AgentPanel() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/agents`);
        const data = await response.json();
        setAgents(data);
      } catch (error) {
        setAgents([]);
      }
    };

    fetchAgents();
    const interval = setInterval(fetchAgents, 3500);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    if (!status) return '';
    if (status.toLowerCase() === 'responding') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    if (status.toLowerCase() === 'available') return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (status.toLowerCase() === 'busy') return 'bg-red-500/20 text-red-300 border-red-500/30';
    return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border-2 border-white/10 rounded-2xl p-6 shadow-2xl">
      <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
        🤖 All Agents ({agents.length})
      </h2>

      <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
        {agents.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No registered agents</div>
        ) : (
          agents.map(agent => (
            <div
              key={agent.id}
              className={`group bg-slate-700/30 hover:bg-slate-700/50 border border-white/10 rounded-xl p-5 transition-all hover:shadow-xl ${
                agent.status.toLowerCase() === 'responding' ? 'border-yellow-500/70' : ''
              }`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="text-4xl">{agent.icon}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-white font-bold text-lg">{agent.name}</h3>
                      {agent.current_incident ? (
                        <p className="text-blue-300 text-xs">
                          Responding to Incident <b>#{agent.current_incident}</b>
                        </p>
                      ) : (
                        <p className="text-gray-400 text-xs">Idle</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 ${getStatusColor(agent.status)} rounded-full text-xs font-bold border`}>
                      {agent.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <span className="text-purple-400">Efficiency: <b className="text-white">{agent.efficiency ?? "--"}%</b></span>
                    <span className="text-cyan-400">Responses: <b className="text-white">{agent.total_responses ?? "--"}</b></span>
                    <span className="text-green-300">Success: <b className="text-white">{agent.successful_responses ?? "--"}</b></span>
                    <span className="text-yellow-200">Avg Res. Dist: <b className="text-white">{agent.response_time?.toFixed(2)}</b> km</span>
                    {agent.updated_at && (
                      <span className="text-gray-400">
                        Last Update: {new Date(agent.updated_at).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-gray-200">
                <div className="bg-slate-900/50 border border-purple-500/20 rounded-lg p-3 mb-1">
                  <div className="text-purple-300 text-xs font-bold mb-1">📝 Last Decision/Action:</div>
                  <div className="text-gray-100 text-sm">{agent.decision || "--"}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
