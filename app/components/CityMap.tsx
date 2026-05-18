'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import 'leaflet/dist/leaflet.css'
import { BrainCircuit, EyeOff } from 'lucide-react'
import { useSentinel } from '@/app/store/sentinel'
import { api } from '@/app/lib/api'
import type { RiskZone } from '@/app/types'

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false })
const Popup = dynamic(() => import('react-leaflet').then((m) => m.Popup), { ssr: false })
const Circle = dynamic(() => import('react-leaflet').then((m) => m.Circle), { ssr: false })
const MapController = dynamic(() => import('./MapController'), { ssr: false })

const FixLeafletIcon = () => {
  useEffect(() => {
    import('leaflet').then((L) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.default.Icon.Default.prototype as any)._getIconUrl
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })
    })
  }, [])
  return null
}

const MARKER_COLORS: Record<string, string> = {
  fire: '#ef4444',
  accident: '#f59e0b',
  medical: '#3b82f6',
}

export default function CityMap() {
  const incidents = useSentinel((s) => s.incidents)
  const agents = useSentinel((s) => s.agents)
  const [riskZones, setRiskZones] = useState<RiskZone[]>([])
  const [showRisk, setShowRisk] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Deferred so React Compiler doesn't flag setState-in-effect-body
    const t = setTimeout(() => setIsMounted(true), 0)
    return () => clearTimeout(t)
  }, [])

  const activeIncidents = incidents.filter((i) => i.status !== 'resolved')

  const mapCenter: [number, number] = activeIncidents.length > 0
    ? [activeIncidents[0].location.lat, activeIncidents[0].location.lon]
    : agents.length > 0
    ? [agents[0].lat, agents[0].lon]
    : [40.7128, -74.006]

  const toggleRiskZones = async () => {
    if (!showRisk && riskZones.length === 0) {
      try {
        const data = await api.analytics.prediction()
        if (data.status === 'success') setRiskZones(data.zones)
      } catch (e) {
        console.error(e)
      }
    }
    setShowRisk((v) => !v)
  }

  if (!isMounted) {
    return <div className="h-[500px] w-full bg-slate-800 rounded-2xl animate-pulse" />
  }

  return (
    <div className="h-full w-full relative z-10">
      <div className="absolute top-28 left-1/2 -translate-x-1/2 z-[9999]">
        <button
          onClick={toggleRiskZones}
          className={`px-6 py-2 rounded-full font-bold text-xs border shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-3 backdrop-blur-xl ${showRisk ? 'bg-red-500 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'bg-slate-950/80 text-blue-400 border-blue-500/30 hover:border-blue-400 hover:text-white hover:bg-slate-900'}`}
        >
          {showRisk ? <EyeOff className="w-4 h-4" /> : <BrainCircuit className="w-4 h-4" />}
          <span className="tracking-widest">{showRisk ? 'HIDE NEURAL LAYER' : 'ACTIVATE PREDICTION'}</span>
        </button>
      </div>

      <FixLeafletIcon />
      <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        />
        <MapController incidents={activeIncidents} />

        {showRisk && riskZones.map((zone) => (
          <Circle
            key={`zone-${zone.id}`}
            center={[zone.lat, zone.lon]}
            radius={zone.radius}
            pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.15, dashArray: '10, 10' }}
          >
            <Popup>
              <div className="text-xs font-bold text-red-600">
                ⚠️ {zone.label}<br />Risk Score: {(zone.risk_score * 100).toFixed(1)}%
              </div>
            </Popup>
          </Circle>
        ))}

        {activeIncidents.map((incident) => {
          const color = MARKER_COLORS[incident.type] ?? '#6b7280'
          return (
            <div key={incident.id}>
              <Circle
                center={[incident.location.lat, incident.location.lon]}
                radius={300}
                pathOptions={{ color, fillColor: color, fillOpacity: 0.2 }}
              />
              <Marker position={[incident.location.lat, incident.location.lon]}>
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-bold">{incident.type.toUpperCase()}</h3>
                    <p>{incident.description}</p>
                    <p className="text-xs text-gray-600">Status: {incident.status}</p>
                  </div>
                </Popup>
              </Marker>
            </div>
          )
        })}
      </MapContainer>
    </div>
  )
}
