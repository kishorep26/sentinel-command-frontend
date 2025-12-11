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

export default function CityMap() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchIncidents = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_URL}/incidents`);
      const data = await response.json();
      setIncidents(data.filter((i: Incident) => i.status !== 'resolved'));
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'fire': return '#ef4444';
      case 'accident': return '#f59e0b';
      case 'medical': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const centerLat = incidents.length > 0 ? incidents[0].location.lat : 40.7128;
  const centerLon = incidents.length > 0 ? incidents[0].location.lon : -74.0060;

  if (!isMounted) {
    return <div className="h-[500px] w-full bg-slate-800 rounded-2xl animate-pulse"></div>;
  }

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl relative z-10">
      <FixLeafletIcon />
      <MapContainer
        center={[centerLat, centerLon]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

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
