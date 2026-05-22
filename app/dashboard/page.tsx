'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import IncidentPanel from '../components/IncidentPanel'
import AgentPanel from '../components/AgentPanel'
import AgentDecisionLog from '../components/AgentDecisionLog'
import ScenarioEditor from '../components/ScenarioEditor'
import CommandHeader from '../components/CommandHeader'
import BatmanResponse from '../components/BatmanResponse'

const CityMap = dynamic(() => import('../components/CityMap'), { ssr: false })

function CollapseButton({
  side, collapsed, onClick,
}: { side: 'left' | 'right'; collapsed: boolean; onClick: () => void }) {
  const Icon = side === 'left'
    ? collapsed ? ChevronRight : ChevronLeft
    : collapsed ? ChevronLeft  : ChevronRight
  return (
    <button
      onClick={onClick}
      className="absolute top-1/2 -translate-y-1/2 w-5 h-10 bg-slate-900/90 border border-white/10 hover:border-amber-500/30 hover:bg-slate-800 flex items-center justify-center rounded transition-all z-30 group"
      style={{ [side === 'left' ? 'right' : 'left']: '-10px' }}
      title={collapsed ? 'Expand panel' : 'Collapse panel'}
    >
      <Icon className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors" />
    </button>
  )
}

export default function Dashboard() {
  const [leftOpen, setLeftOpen]   = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [logOpen, setLogOpen]     = useState(true)

  return (
    <div className="h-screen w-screen bg-[#02040a] overflow-hidden relative">
      <BatmanResponse />
      <CommandHeader />

      {/* Map layer */}
      <div className="absolute inset-0 z-0" style={{ top: 65 }}>
        <CityMap />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.65)_100%)] pointer-events-none z-[1]" />
      </div>

      {/* Side panels row */}
      <div
        className="absolute inset-x-0 z-10 pointer-events-none flex justify-between items-start px-4 gap-4"
        style={{ top: 73, bottom: logOpen ? 196 : 40 }}
      >
        {/* Left — Incidents */}
        <div className={`relative pointer-events-auto h-full transition-all duration-300 ${leftOpen ? 'w-[360px]' : 'w-0'}`}>
          <div className={`h-full transition-all duration-300 ${leftOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <IncidentPanel />
          </div>
          <CollapseButton side="left" collapsed={!leftOpen} onClick={() => setLeftOpen((v) => !v)} />
        </div>

        {/* Spacer so panels don't squish the map */}
        <div className="flex-1" />

        {/* Right — Agents */}
        <div className={`relative pointer-events-auto h-full transition-all duration-300 ${rightOpen ? 'w-[320px]' : 'w-0'}`}>
          <div className={`h-full transition-all duration-300 ${rightOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <AgentPanel />
          </div>
          <CollapseButton side="right" collapsed={!rightOpen} onClick={() => setRightOpen((v) => !v)} />
        </div>
      </div>

      {/* Bottom — Dispatch log strip */}
      <div className="absolute bottom-0 inset-x-0 z-20 pointer-events-auto">
        {/* Collapse toggle bar */}
        <div className="flex justify-center">
          <button
            onClick={() => setLogOpen((v) => !v)}
            className="flex items-center gap-2 px-4 py-1 bg-slate-950/90 border border-white/10 border-b-0 rounded-t-lg text-[10px] font-mono text-slate-500 hover:text-amber-400 hover:border-amber-500/20 transition-all"
          >
            {logOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            DISPATCH LOG
            {logOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>

        <div className={`transition-all duration-300 overflow-hidden ${logOpen ? 'h-[180px]' : 'h-0'}`}>
          <div className="h-full px-4 pb-3">
            <AgentDecisionLog />
          </div>
        </div>
      </div>

      {/* Deploy incident button */}
      <div className="pointer-events-auto relative z-50">
        <ScenarioEditor />
      </div>
    </div>
  )
}
