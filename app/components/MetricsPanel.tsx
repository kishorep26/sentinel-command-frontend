'use client'

import { useState, useEffect } from 'react';

export default function MetricsPanel() {
  const [metrics, setMetrics] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    avgResponse: '2.3min',
    efficiency: 94
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/stats`);
        const data = await response.json();

        setMetrics({
          total: data.total_incidents,
          active: data.active_incidents,
          resolved: data.resolved_incidents,
          avgResponse: '2.3min',
          efficiency: 94
        });
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 border-2 border-blue-400/50 rounded-2xl p-6 shadow-2xl">
        <div className="text-blue-200 text-sm font-bold mb-2">📊 Total</div>
        <div className="text-5xl font-black text-white mb-1">{metrics.total}</div>
        <div className="text-xs text-blue-300">All incidents</div>
      </div>

      <div className="bg-gradient-to-br from-red-700 to-red-900 border-2 border-red-400/50 rounded-2xl p-6 shadow-2xl">
        <div className="text-red-200 text-sm font-bold mb-2">🚨 Active</div>
        <div className="text-5xl font-black text-white mb-1 animate-pulse">{metrics.active}</div>
        <div className="text-xs text-red-300">Now responding</div>
      </div>

      <div className="bg-gradient-to-br from-green-700 to-green-900 border-2 border-green-400/50 rounded-2xl p-6 shadow-2xl">
        <div className="text-green-200 text-sm font-bold mb-2">✅ Resolved</div>
        <div className="text-5xl font-black text-white mb-1">{metrics.resolved}</div>
        <div className="text-xs text-green-300">Today</div>
      </div>

      <div className="bg-gradient-to-br from-purple-700 to-purple-900 border-2 border-purple-400/50 rounded-2xl p-6 shadow-2xl">
        <div className="text-purple-200 text-sm font-bold mb-2">⚡ Response</div>
        <div className="text-4xl font-black text-white mb-1">{metrics.avgResponse}</div>
        <div className="text-xs text-purple-300">Avg time</div>
      </div>

      <div className="bg-gradient-to-br from-cyan-700 to-cyan-900 border-2 border-cyan-400/50 rounded-2xl p-6 shadow-2xl">
        <div className="text-cyan-200 text-sm font-bold mb-2">🤖 AI Efficiency</div>
        <div className="text-5xl font-black text-white mb-1">{metrics.efficiency}%</div>
        <div className="text-xs text-cyan-300">Optimal</div>
      </div>
    </div>
  );
}
