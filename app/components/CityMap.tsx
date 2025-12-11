'use client'

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Leaflet components with SSR disabled
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);

// Dynamic import for the controller that uses useMap hook
const MapController = dynamic(() => import('./MapController'), { ssr: false });

// Leaflet icon fix needs to run only on client
const FixLeafletIcon = () => {
  useEffect(() => {
    import('leaflet').then((L) => {
      delete (L.default.Icon.Default.prototype as any)._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });
    });
  }, []);
  return null;
};

interface Incident {
  id: number;
  type: string;
  location: { lat: number; lon: number };
  description: string;
  status: string;
}

// ... imports ...

export default function CityMap() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [riskZones, setRiskZones] = useState<any[]>([]);
  const [showRisk, setShowRisk] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.7128, -74.0060]); // Default fallback

  useEffect(() => {
    setIsMounted(true);
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      // Fetch Incidents
      const incRes = await fetch(`${API_URL}/incidents`);
      const incData = await incRes.json();
      const activeIncidents = incData.filter((i: Incident) => i.status !== 'resolved');
      setIncidents(activeIncidents);

      // If no incidents, center on fleet
      if (activeIncidents.length === 0) {
        const agentsRes = await fetch(`${API_URL}/agents`);
        const agentsData = await agentsRes.json();
        if (agentsData.length > 0) {
          setMapCenter([agentsData[0].lat, agentsData[0].lon]);
        }
      }
    } catch (error) { console.error(error); }
  };

  const toggleRiskZones = async () => {
    if (!showRisk) {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const response = await fetch(`${API_URL}/analytics/prediction`);
        const data = await response.json();
        if (data.status === 'success') {
          setRiskZones(data.zones);
        }
      } catch (e) { console.error(e); }
    }
    setShowRisk(!showRisk);
  }

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'fire': return '#ef4444';
      case 'accident': return '#f59e0b';
      case 'medical': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  if (!isMounted) {
    return <div className="h-[500px] w-full bg-slate-800 rounded-2xl animate-pulse"></div>;
  }

  // Default view is now dynamic mapCenter state

  return (
    <div className="h-full w-full relative z-10">
      <div className="absolute top-5 right-12 z-[9999]">
        <button
          onClick={toggleRiskZones}
          className={`px-6 py-3 rounded-xl font-black text-xs border-2 shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 ${showRisk ? 'bg-red-600 text-white border-red-400 shadow-red-600/50' : 'bg-slate-900/90 backdrop-blur text-blue-400 border-blue-500/30 hover:border-blue-400 hover:text-white shadow-blue-500/20'}`}
        >
          <span className="text-lg">{showRisk ? '🚫' : '🧠'}</span>
          {showRisk ? 'DISABLE NEURAL PREDICTION' : 'ACTIVATE PREDICTIVE MODEL'}
        </button>
      </div>

      <FixLeafletIcon />
      <MapContainer
        center={mapCenter as any}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <MapController incidents={incidents} />

        {/* Risk Zones Overlay */}
        {showRisk && riskZones.map((zone) => (
          <Circle
            key={`zone-${zone.id}`}
            center={[zone.lat, zone.lon]}
            radius={zone.radius}
            pathOptions={{
              color: '#ef4444',
              fillColor: '#ef4444',
              fillOpacity: 0.15,
              dashArray: '10, 10'
            }}
          >
            <Popup>
              <div className="text-xs font-bold text-red-600">
                ⚠️ {zone.label}<br />
                Risk Score: {(zone.risk_score * 100).toFixed(1)}%
              </div>
            </Popup>
          </Circle>
        ))}

        {incidents.map((incident) => (
          <div key={incident.id}>
            <Circle
              center={[incident.location.lat, incident.location.lon]}
              radius={300}
              pathOptions={{
                color: getMarkerColor(incident.type),
                fillColor: getMarkerColor(incident.type),
                fillOpacity: 0.2
              }}
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
        ))}
      </MapContainer>
    </div>
  );
}
