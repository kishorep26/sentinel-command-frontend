'use client';

import MetricsPanel from '../components/MetricsPanel';
import IncidentPanel from '../components/IncidentPanel';
import AgentPanel from '../components/AgentPanel';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import CityMap from '../components/CityMap';
import AgentDecisionLog from '../components/AgentDecisionLog';
import ScenarioEditor from '../components/ScenarioEditor';
import IncidentClassifier from '../components/IncidentClassifier';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950">
      <div className="container mx-auto p-6 space-y-6">
        {/* Top Metrics Panel */}
        <div>
          <MetricsPanel />
        </div>

        {/* Main Map UI */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur border-2 border-white/10 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            🗺️ Live City Map
          </h2>
          <CityMap />
        </div>

        {/* Panels Grid: Incidents (left), Agents (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IncidentPanel />
          <AgentPanel />
        </div>

        {/* Analytics and Decisions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AgentDecisionLog />
          <AnalyticsDashboard />
        </div>

        {/* AI Classifier (optional) */}
        {
        <div>
          <IncidentClassifier />
        </div>
        }

        {/* Scenario/Simulation Control */}
        <ScenarioEditor />
      </div>
    </div>
  );
}
