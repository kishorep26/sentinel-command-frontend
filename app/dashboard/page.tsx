'use client'

import dynamic from 'next/dynamic'
import IncidentPanel from '../components/IncidentPanel'
import AgentPanel from '../components/AgentPanel'
import AgentDecisionLog from '../components/AgentDecisionLog'
import ScenarioEditor from '../components/ScenarioEditor'
import CommandHeader from '../components/CommandHeader'
import BatmanResponse from '../components/BatmanResponse'

const CityMap = dynamic(() => import('../components/CityMap'), { ssr: false })

export default function Dashboard() {
  return (
    <div className="h-screen w-screen bg-[#02040a] overflow-hidden relative">
      {/* Batman protocol — reads active incident count from store itself */}
      <BatmanResponse />

      {/* Header HUD — also initialises the Zustand store WebSocket connection */}
      <CommandHeader />

      {/* Full-screen map */}
      <div className="absolute inset-0 z-0 top-[80px]">
        <CityMap />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)] pointer-events-none z-[1]" />
      </div>

      {/* Floating side panels */}
      <div className="absolute inset-0 z-10 pointer-events-none top-[90px] p-6 flex justify-between items-start">
        <div className="w-[400px] h-[calc(100vh-250px)] pointer-events-auto">
          <IncidentPanel />
        </div>
        <div className="w-[350px] h-[calc(100vh-250px)] pointer-events-auto">
          <AgentPanel />
        </div>
      </div>

      {/* Bottom neural log */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[600px] h-[200px] z-20 pointer-events-auto">
        <AgentDecisionLog />
      </div>

      {/* Incident creation button + modal */}
      <div className="pointer-events-auto relative z-50">
        <ScenarioEditor />
      </div>
    </div>
  )
}
