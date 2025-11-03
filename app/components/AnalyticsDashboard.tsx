'use client'

import { useState, useEffect } from 'react';

interface Stats {
  total_incidents: number;
  active_incidents: number;
  resolved_incidents: number;
  total_agents: number;
  active_agents: number;
  average_response_time: number;
  average_efficiency: number;
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats>({
    total_incidents: 0,
    active_incidents: 0,
    resolved_incidents: 0,
    total_agents: 0,
    active_agents: 0,
    average_response_time: 0,
    average_efficiency: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/stats`);
        setStats(await response.json());
      } catch (error) {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border-2 border-white/10 rounded-2xl p-6 shadow-2xl">
      <h2 className="text-2xl font-black text-white mb-6">📊 Analytics</h2>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="text-xs text-blue-300 mb-1">Total Incidents</div>
            <div className="text-2xl text-blue-200 font-bold">{stats.total_incidents}</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="text-xs text-red-300 mb-1">Active Incidents</div>
            <div className="text-2xl text-red-200 font-bold">{stats.active_incidents}</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="text-xs text-green-300 mb-1">Resolved Incidents</div>
            <div className="text-2xl text-green-200 font-bold">{stats.resolved_incidents}</div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4 text-center">
            <div className="text-xs text-yellow-300 mb-1">Active Agents</div>
            <div className="text-2xl text-yellow-200 font-bold">{stats.active_agents}</div>
          </div>
        </div>
        <div>
          <div className="flex gap-4 mt-4">
            <div>
              <div className="text-xs text-gray-400">Avg Response</div>
              <div className="text-lg text-blue-300">{stats.average_response_time.toFixed(2)} km</div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Avg Efficiency</div>
              <div className="text-lg text-green-300">{stats.average_efficiency.toFixed(2)} %</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
