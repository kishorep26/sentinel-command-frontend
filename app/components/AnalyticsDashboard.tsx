'use client'

import { useState, useEffect } from 'react';

interface Stats {
  total_incidents: number;
  active_incidents: number;
  resolved_incidents: number;
  total_agents: number;
  active_agents: number;
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats>({
    total_incidents: 0,
    active_incidents: 0,
    resolved_incidents: 0,
    total_agents: 0,
    active_agents: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/stats`);
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border-2 border-white/10 rounded-2xl p-6 shadow-2xl">
      <h2 className="text-2xl font-black text-white mb-6">📊 Analytics</h2>

      <div className="space-y-6">
        {/* Response Distribution */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Incident Status</h3>
          <div className="space-y-3">
            {[
              { name: 'Active', count: stats.active_incidents, color: 'from-red-600 to-red-400' },
              { name: 'Resolved', count: stats.resolved_incidents, color: 'from-green-600 to-green-400' },
              { name: 'Total', count: stats.total_incidents, color: 'from-blue-600 to-blue-400' }
            ].map((item) => (
              <div key={item.name} className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">{item.name}</span>
                  <span className="text-green-400 font-bold">{item.count}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${item.color} h-2 rounded-full`}
                    style={{ width: `${(item.count / Math.max(stats.total_incidents, 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Stats */}
        <div>
          <h3 className="text-lg font-bold text-white mb-3">Agent Status</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { type: 'Total', count: stats.total_agents, emoji: '🤖' },
              { type: 'Active', count: stats.active_agents, emoji: '⚡' }
            ].map((item) => (
              <div key={item.type} className="bg-slate-700/50 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">{item.emoji}</div>
                <div className="text-white font-bold text-2xl">{item.count}</div>
                <div className="text-xs text-gray-400">{item.type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
