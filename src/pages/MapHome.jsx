import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer } from 'react-leaflet';
import ChargerMarker from '@/components/charging/ChargerMarker';
import MapLegend from '@/components/charging/MapLegend';
import { Zap, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import 'leaflet/dist/leaflet.css';

export default function MapHome() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (!u.onboarding_complete) navigate('/onboarding');
    });
  }, [navigate]);

  const { data: chargers = [], isLoading } = useQuery({
    queryKey: ['chargers'],
    queryFn: () => base44.entities.Charger.list(),
  });

  const filteredChargers = chargers.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.location_description?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectCharger = (charger) => {
    navigate(`/charge?chargerId=${charger.id}`);
  };

  // Default center (can be adjusted)
  const center = chargers.length > 0
    ? [chargers[0].latitude, chargers[0].longitude]
    : [37.7749, -122.4194];

  return (
    <div className="h-screen flex flex-col relative">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-[1000] px-4 pt-4 pb-2">
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-lg border border-border p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-heading font-bold text-base">ChargeSmart</h1>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">
                  {chargers.filter(c => c.status === 'available').length} available
                </span>
              </div>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search chargers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 bg-muted/50 border-0 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        {!isLoading && (
          <MapContainer
            center={center}
            zoom={15}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {filteredChargers.map(charger => (
              <ChargerMarker
                key={charger.id}
                charger={charger}
                onSelect={handleSelectCharger}
              />
            ))}
          </MapContainer>
        )}
        {isLoading && (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Legend */}
      <MapLegend />
    </div>
  );
}