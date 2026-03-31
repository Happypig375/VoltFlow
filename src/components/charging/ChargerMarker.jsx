import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { cn } from '@/lib/utils';

const getMarkerIcon = (status) => {
  const colors = {
    available: '#22c55e',
    occupied: '#ef4444',
    offline: '#94a3b8',
  };
  const color = colors[status] || '#94a3b8';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 36px; height: 36px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        display: flex; align-items: center; justify-content: center;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
};

export default function ChargerMarker({ charger, onSelect }) {
  const statusLabels = {
    available: 'Available',
    occupied: 'Occupied',
    offline: 'Offline',
  };

  const statusColors = {
    available: 'text-green-600 bg-green-50',
    occupied: 'text-red-600 bg-red-50',
    offline: 'text-slate-500 bg-slate-50',
  };

  return (
    <Marker
      position={[charger.latitude, charger.longitude]}
      icon={getMarkerIcon(charger.status)}
    >
      <Popup>
        <div className="font-body min-w-[180px]">
          <p className="font-heading font-semibold text-sm">{charger.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{charger.location_description}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", statusColors[charger.status])}>
              {statusLabels[charger.status]}
            </span>
            <span className="text-xs text-slate-500">{charger.power_kw} kW</span>
            <span className="text-xs text-slate-500">{charger.connector_type}</span>
          </div>
          {charger.status === 'available' && (
            <button
              onClick={() => onSelect(charger)}
              className="mt-2 w-full text-xs font-medium bg-primary text-white py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Start Charging
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
}