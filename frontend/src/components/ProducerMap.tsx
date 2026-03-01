'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* ── Medieval shield marker (SVG data URI) ────────────────────────── */
const shieldSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52" width="40" height="52">
  <defs>
    <filter id="ds" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="1" dy="2" stdDeviation="1.5" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <g filter="url(#ds)">
    <path d="M20 2 C12 2 4 4 4 12 L4 28 C4 36 20 48 20 48 C20 48 36 36 36 28 L36 12 C36 4 28 2 20 2Z"
      fill="#7B2D26" stroke="#C9A84C" stroke-width="2"/>
    <path d="M20 8 C15 8 10 9.5 10 14 L10 25 C10 30 20 39 20 39 C20 39 30 30 30 25 L30 14 C30 9.5 25 8 20 8Z"
      fill="#922B21" stroke="#C9A84C" stroke-width="1" opacity="0.6"/>
    <circle cx="20" cy="20" r="5" fill="#C9A84C" opacity="0.9"/>
    <circle cx="20" cy="20" r="2.5" fill="#7B2D26"/>
  </g>
</svg>`;

const markerIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${typeof btoa !== 'undefined' ? btoa(shieldSvg) : Buffer.from(shieldSvg).toString('base64')}`,
  iconSize: [36, 46],
  iconAnchor: [18, 46],
  popupAnchor: [0, -40],
});

/* ── Compass rose (SVG) ───────────────────────────────────────────── */
function CompassRose() {
  return (
    <div className="absolute bottom-3 right-3 z-[1000] pointer-events-none opacity-60">
      <svg width="56" height="56" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(50,50)">
          {/* Main points */}
          <polygon points="0,-42 4,-12 -4,-12" fill="#7B2D26" />
          <polygon points="0,42 4,12 -4,12" fill="#C9A84C" />
          <polygon points="-42,0 -12,4 -12,-4" fill="#C9A84C" />
          <polygon points="42,0 12,4 12,-4" fill="#C9A84C" />
          {/* Diagonal points */}
          <polygon points="0,-42 2,-12 -2,-12" fill="#922B21" opacity="0.5" transform="rotate(45)" />
          <polygon points="0,42 2,12 -2,12" fill="#C9A84C" opacity="0.5" transform="rotate(45)" />
          <polygon points="-42,0 -12,2 -12,-2" fill="#C9A84C" opacity="0.5" transform="rotate(45)" />
          <polygon points="42,0 12,2 12,-2" fill="#C9A84C" opacity="0.5" transform="rotate(45)" />
          {/* Center */}
          <circle r="5" fill="#C9A84C" />
          <circle r="2.5" fill="#7B2D26" />
          {/* N label */}
          <text y="-44" textAnchor="middle" fill="#7B2D26" fontSize="11" fontFamily="serif" fontWeight="bold">N</text>
        </g>
      </svg>
    </div>
  );
}

/* ── Component ────────────────────────────────────────────────────── */
interface ProducerMapProps {
  latitude: number;
  longitude: number;
  name: string;
  region?: string;
}

export default function ProducerMap({ latitude, longitude, name, region }: ProducerMapProps) {
  return (
    <div className="relative rounded-lg overflow-hidden" style={{
      border: '3px solid #C9A84C',
      boxShadow: 'inset 0 0 30px rgba(101, 67, 33, 0.25), 0 4px 12px rgba(0,0,0,0.2)',
    }}>
      {/* Parchment vignette overlay */}
      <div className="absolute inset-0 z-[999] pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(101, 67, 33, 0.15) 100%)',
      }} />

      {/* Decorative corner flourishes */}
      <div className="absolute top-1.5 left-1.5 z-[999] pointer-events-none text-[#C9A84C] opacity-50 text-lg leading-none select-none" style={{ fontFamily: 'serif' }}>&#10050;</div>
      <div className="absolute top-1.5 right-1.5 z-[999] pointer-events-none text-[#C9A84C] opacity-50 text-lg leading-none select-none" style={{ fontFamily: 'serif' }}>&#10050;</div>
      <div className="absolute bottom-1.5 left-1.5 z-[999] pointer-events-none text-[#C9A84C] opacity-50 text-lg leading-none select-none" style={{ fontFamily: 'serif' }}>&#10050;</div>

      <CompassRose />

      <style>{`
        .medieval-map .leaflet-tile-pane {
          filter: sepia(0.4) saturate(0.55) brightness(0.92) contrast(1.1) hue-rotate(-8deg);
        }
        .medieval-map .leaflet-popup-content-wrapper {
          background: #F5E6C8;
          border: 2px solid #C9A84C;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(101, 67, 33, 0.3);
        }
        .medieval-map .leaflet-popup-tip {
          background: #F5E6C8;
          border-bottom: 2px solid #C9A84C;
          border-right: 2px solid #C9A84C;
        }
        .medieval-map .leaflet-popup-content {
          font-family: 'Georgia', 'Palatino Linotype', 'Book Antiqua', serif;
          color: #3E2723;
        }
      `}</style>

      <MapContainer
        center={[latitude, longitude]}
        zoom={11}
        scrollWheelZoom={false}
        className="medieval-map h-64 sm:h-80 w-full"
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
        />
        <Marker position={[latitude, longitude]} icon={markerIcon}>
          <Popup>
            <div className="text-center py-1">
              <strong className="text-base">{name}</strong>
              {region && (
                <>
                  <br />
                  <span className="text-xs italic opacity-80">{region}</span>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
