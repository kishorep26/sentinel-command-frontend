'use client'

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface Incident {
  id: number;
  type: string;
  location: { lat: number; lon: number };
  description: string;
  status: string;
}

export default function CityMap() {
  const [incidents, setIncidents] = useState<Incident[]>([]);

  useEffect(() => {
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
    switch(type) {
      case 'fire': return '#ef4444';
      case 'accident': return '#f59e0b';
      case 'medical': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  const centerLat = incidents.length > 0 ? incidents[0].location.lat : 40.7128;
  const centerLon = incidents.length > 0 ? incidents[0].location.lon : -74.0060;

  return (
    <div className="h-[500px] w-full rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
      <MapContainer
        center={[centerLat, centerLon]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
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
