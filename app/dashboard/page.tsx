'use client'

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import MetricsPanel from '../components/MetricsPanel';
import IncidentPanel from '../components/IncidentPanel';
import AgentPanel from '../components/AgentPanel';
import ScenarioEditor from '../components/ScenarioEditor';
import AgentDecisionLog from '../components/AgentDecisionLog';
import AnalyticsDashboard from '../components/AnalyticsDashboard';

const CityMap = dynamic(() => import('../components/CityMap'), { ssr: false });

export default function Dashboard() {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleIncidentCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
      <div className="container mx-auto p-6 space-y-6">
        {/* Top Bar */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur border-2 border-white/10 rounded-2xl p-6 shadow-2xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/')}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white font-semibold transition flex items-center gap-2"
            >
              ← Home
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                🏙️
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Smart City Command</h1>
                <p className="text-blue-300 text-sm">Multi-Agent AI System</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-500/30">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </div>
            <span className="text-green-300 font-semibold text-sm">All Systems Online</span>
          </div>
        </div>

        {/* Metrics */}
        <MetricsPanel key={`metrics-${refreshKey}`} />

        {/* Map */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border-2 border-white/10 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            🗺️ Live City Map
          </h2>
          <CityMap key={`map-${refreshKey}`} />
        </div>

        {/* Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncidentPanel key={`incidents-${refreshKey}`} />
          <AgentPanel key={`agents-${refreshKey}`} />
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AgentDecisionLog key={`decisions-${refreshKey}`} />
          <AnalyticsDashboard key={`analytics-${refreshKey}`} />
        </div>

        <ScenarioEditor onIncidentCreated={handleIncidentCreated} />
      </div>
    </div>
  );
}
