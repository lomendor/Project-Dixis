'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon (broken in bundled environments like Next.js)
const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface ProducerMapProps {
  latitude: number;
  longitude: number;
  name: string;
  region?: string;
}

export default function ProducerMap({ latitude, longitude, name, region }: ProducerMapProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-neutral-200">
      <MapContainer
        center={[latitude, longitude]}
        zoom={11}
        scrollWheelZoom={false}
        className="h-64 sm:h-80 w-full"
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />
        <Marker position={[latitude, longitude]} icon={markerIcon}>
          <Popup>
            <strong>{name}</strong>
            {region && <br />}
            {region && <span className="text-sm text-gray-500">{region}</span>}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
