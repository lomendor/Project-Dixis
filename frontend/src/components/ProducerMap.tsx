'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* ── Elegant olive-green pin marker (SVG data URI) ───────────────── */
const pinSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 44" width="32" height="44">
  <defs>
    <filter id="s" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-color="#1b2a1e" flood-opacity="0.25"/>
    </filter>
  </defs>
  <g filter="url(#s)">
    <path d="M16 2C9.4 2 4 7.4 4 14c0 9 12 26 12 26s12-17 12-26c0-6.6-5.4-12-12-12z"
      fill="#2d6a4f" stroke="#fff" stroke-width="1.5"/>
    <circle cx="16" cy="14" r="5" fill="#fff" opacity="0.9"/>
    <circle cx="16" cy="14" r="2.5" fill="#2d6a4f"/>
  </g>
</svg>`;

const markerIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${typeof btoa !== 'undefined' ? btoa(pinSvg) : Buffer.from(pinSvg).toString('base64')}`,
  iconSize: [32, 44],
  iconAnchor: [16, 44],
  popupAnchor: [0, -38],
});

/* ── Component ────────────────────────────────────────────────────── */
interface ProducerMapProps {
  latitude: number;
  longitude: number;
  name: string;
  region?: string;
}

export default function ProducerMap({ latitude, longitude, name, region }: ProducerMapProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
      <style>{`
        .dixis-map .leaflet-popup-content-wrapper {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .dixis-map .leaflet-popup-tip {
          background: #fff;
        }
        .dixis-map .leaflet-popup-content {
          margin: 10px 14px;
          font-family: inherit;
          color: #1b2a1e;
        }
      `}</style>

      <MapContainer
        center={[latitude, longitude]}
        zoom={11}
        scrollWheelZoom={false}
        className="dixis-map h-72 sm:h-80 w-full"
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />
        <Marker position={[latitude, longitude]} icon={markerIcon}>
          <Popup>
            <div className="text-center">
              <strong className="text-sm text-neutral-900">{name}</strong>
              {region && (
                <>
                  <br />
                  <span className="text-xs text-neutral-500">{region}</span>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
