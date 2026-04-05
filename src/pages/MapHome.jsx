import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { listChargers } from '@/api/entities/charger';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Zap, Search } from 'lucide-react';
import MapLegend, { chargerStatusMeta } from '@/components/charging/MapLegend';
import 'leaflet/dist/leaflet.css';

const chargerLocations = [
  {
    id: 'tower-1-2',
    name: 'Tower 1 & 2',
    latitude: 22.33986727259181,
    longitude: 114.26291080847784,
    chargers: ['T1-35', 'T1-39', 'T1-60', 'T1-63', 'T1-65', 'T1-68'],
  },
  {
    id: 'tower-3-4',
    name: 'Tower 3 & 4',
    latitude: 22.33932227283952,
    longitude: 114.26436472789554,
    chargers: ['T3-21', 'T3-39', 'T3-47', 'T3-54', 'T3-57', 'T3-62'],
  },
  {
    id: 'tower-5-7',
    name: 'Tower 5 to 7',
    latitude: 22.33897487861388,
    longitude: 114.26535483423766,
    chargers: ['T5-48', 'T5-49', 'T5-50', 'T5-51'],
  },
  {
    id: 'tower-8',
    name: 'Tower 8',
    latitude: 22.33442227753281,
    longitude: 114.26570860912722,
    chargers: ['T8-24', 'T8-29'],
  },
  {
    id: 'tower-9',
    name: 'Tower 9',
    latitude: 22.334509052959582,
    longitude: 114.26593649284686,
    chargers: ['T9-39', 'T9-41'],
  },
  {
    id: 'tower-10',
    name: 'Tower 10',
    latitude: 22.334542836169383,
    longitude: 114.26621476442045,
    chargers: ['T10-48', 'T10-51', 'T10-53'],
  },
  {
    id: 'tower-11',
    name: 'Tower 11',
    latitude: 22.334542836169383,
    longitude: 114.26644433846982,
    chargers: ['T11-60', 'T11-63', 'T11-66'],
  },
  {
    id: 'tower-12',
    name: 'Tower 12',
    latitude: 22.334392892927074,
    longitude: 114.2666164684327,
    chargers: ['T12-70'],
  },
  {
    id: 'tower-13',
    name: 'Tower 13',
    latitude: 22.334276863704073,
    longitude: 114.26687718565864,
    chargers: ['T13-77', 'T13-78'],
  },
  {
    id: 'tower-14',
    name: 'Tower 14',
    latitude: 22.33414490878411,
    longitude: 114.26716495844576,
    chargers: ['T14-85'],
  },
  {
    id: 'tower-15',
    name: 'Tower 15',
    latitude: 22.33427723182408,
    longitude: 114.2673784481617,
    chargers: ['T15-91'],
  },
  {
    id: 'tower-16',
    name: 'Tower 16',
    latitude: 22.3340671772981,
    longitude: 114.26752309281522,
    chargers: ['T16-94'],
  },
  {
    id: 'tower-17-19',
    name: 'Tower 17 to 19',
    latitude: 22.333371842599995,
    longitude: 114.26752086510176,
    chargers: ['T17-109', 'T17-113', 'T17-118', 'T17-127', 'T17-133'],
  },
  {
    id: 'block-p',
    name: 'Block P',
    latitude: 22.33896729521354,
    longitude: 114.25826411346323,
    chargers: ['P-1', 'P-4'],
  },
  {
    id: 'block-r',
    name: 'Block R',
    latitude: 22.339248930697117,
    longitude: 114.25818968328404,
    chargers: ['R-1', 'R-6'],
  },
  {
    id: 'block-s',
    name: 'Block S',
    latitude: 22.339457549206568,
    longitude: 114.2585099585977,
    chargers: ['S-1', 'S-4'],
  },
  {
    id: 'apartment',
    name: 'Apartment',
    latitude: 22.339922060815226,
    longitude: 114.25964614393052,
    chargers: ['APT-62', 'APT-72', 'APT-75', 'APT-80', 'APT-82', 'APT-84'],
  },
  {
    id: 'carpark-building',
    name: 'Carpark Building',
    latitude: 22.338719599595834,
    longitude: 114.26302252968912,
    chargers: [
      'LG2-125',
      'LG2-126',
      'LG2-127',
      'LG5-36',
      'LG5-37',
      'LG5-38',
      'LG5-39',
      'LG5-40',
      'LG5-41',
      'LG5-42',
      'LG5-43',
      'LG5-44',
      'LG5-45',
      'LG5-46',
      'LG5-47',
      'LG5-48',
      'LG5-49',
      'LG5-50',
      'LG6-1',
      'LG6-2',
      'LG6-3',
      'LG6-4',
      'LG6-5',
      'LG6-6',
      'LG6-7',
      'LG6-8',
      'LG6-9',
      'LG6-10',
    ],
  },
];

const viewportPadding = {
  topLeft: [24, 132],
  bottomRight: [24, 32],
};

function normalizeChargerKey(value) {
  return String(value || '').trim().toLowerCase();
}

/**
 * @param {string} chargerId
 */
function getChargerPrefix(chargerId) {
  const value = String(chargerId || '').trim();
  if (!value) return 'Other';

  const [prefix] = value.split('-');
  return prefix || 'Other';
}

/**
 * @param {Array<{ id: string, status: 'available' | 'occupied' | 'offline', record: any }>} chargers
 */
function groupChargersByPrefix(chargers) {
  return chargers.reduce((groups, charger) => {
    const prefix = getChargerPrefix(charger.id);
    const currentGroup = groups[groups.length - 1];

    if (currentGroup && currentGroup.prefix === prefix) {
      currentGroup.chargers.push(charger);
      return groups;
    }

    groups.push({
      prefix,
      chargers: [charger],
    });

    return groups;
  }, []);
}

/**
 * @param {string} chargerId
 */
function estimateChargerChipWidth(chargerId) {
  const minWidth = 56;
  const maxWidth = 120;
  const estimated = 26 + String(chargerId || '').length * 7;

  return Math.max(minWidth, Math.min(maxWidth, estimated));
}

/**
 * @param {Array<{ id: string }>} chargers
 * @param {number} availableWidth
 */
function estimateChipRows(chargers, availableWidth) {
  if (!chargers.length || availableWidth <= 0) return 1;

  const chipGap = 6;
  let rows = 1;
  let rowWidth = 0;

  chargers.forEach((charger) => {
    const chipWidth = estimateChargerChipWidth(charger.id);
    const nextWidth = rowWidth === 0 ? chipWidth : rowWidth + chipGap + chipWidth;

    if (nextWidth > availableWidth) {
      rows += 1;
      rowWidth = chipWidth;
      return;
    }

    rowWidth = nextWidth;
  });

  return rows;
}

/**
 * @param {Array<{ chargers: Array<{ id: string }> }>} locations
 * @param {import('leaflet').Map} map
 */
function getLargestPopupEstimate(locations, map) {
  const mapWidth = map.getContainer().clientWidth;
  const popupWidth = Math.max(220, Math.min(280, mapWidth - 32));
  const usableChipWidth = Math.max(160, popupWidth - 24);

  let maxPopupHeight = 180;

  locations.forEach((location) => {
    const groups = groupChargersByPrefix(location.chargers);
    const baseHeight = 62;
    const chipsTopMargin = 12;
    const chipRowHeight = 24;
    const chipRowGap = 6;
    const interGroupGap = 8;
    const separatorHeight = 9;
    const popupVerticalPadding = 16;

    const chipsHeight = groups.reduce((height, group, index) => {
      const rows = estimateChipRows(group.chargers, usableChipWidth);
      const groupRowsHeight = rows * chipRowHeight + (rows - 1) * chipRowGap;
      const separatorSpace = index === 0 ? 0 : separatorHeight;
      const groupGap = index === groups.length - 1 ? 0 : interGroupGap;

      return height + separatorSpace + groupRowsHeight + groupGap;
    }, 0);

    const estimatedPopupHeight = baseHeight + chipsTopMargin + chipsHeight + popupVerticalPadding;
    maxPopupHeight = Math.max(maxPopupHeight, estimatedPopupHeight);
  });

  return {
    popupWidth,
    popupHeight: Math.ceil(maxPopupHeight),
  };
}

/**
 * @param {typeof chargerLocations} locations
 * @param {number} [paddingFactor=0]
 * @returns {[[number, number], [number, number]]}
 */
function getBounds(locations, paddingFactor = 0) {
  const latitudes = locations.map(location => location.latitude);
  const longitudes = locations.map(location => location.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudePadding = Math.max((maxLatitude - minLatitude) * paddingFactor, 0.00018);
  const longitudePadding = Math.max((maxLongitude - minLongitude) * paddingFactor, 0.00018);

  return [
    [minLatitude - latitudePadding, minLongitude - longitudePadding],
    [maxLatitude + latitudePadding, maxLongitude + longitudePadding],
  ];
}

/**
 * @param {import('leaflet').Map} map
 * @param {[[number, number], [number, number]]} areaBounds
 * @param {{ top: number, right: number, bottom: number, left: number }} padding
 */
function getPixelExpandedBounds(map, areaBounds, padding) {
  const zoom = map.getZoom();
  const bounds = L.latLngBounds(areaBounds);
  const northWest = map.project(bounds.getNorthWest(), zoom);
  const southEast = map.project(bounds.getSouthEast(), zoom);
  const expandedNorthWest = northWest.subtract(L.point(padding.left, padding.top));
  const expandedSouthEast = southEast.add(L.point(padding.right, padding.bottom));

  return L.latLngBounds(
    map.unproject(expandedNorthWest, zoom),
    map.unproject(expandedSouthEast, zoom)
  );
}

/**
 * @param {import('leaflet').Map} map
 * @param {import('leaflet').Popup} popup
 */
function keepPopupFullyVisible(map, popup) {
  const popupElement = popup.getElement();
  const mapElement = map.getContainer();

  if (!popupElement || !mapElement) return;

  const popupRect = popupElement.getBoundingClientRect();
  const mapRect = mapElement.getBoundingClientRect();
  const viewportMargin = {
    top: 20,
    right: 16,
    bottom: 16,
    left: 16,
  };

  let deltaX = 0;
  let deltaY = 0;

  const leftOverflow = mapRect.left + viewportMargin.left - popupRect.left;
  const rightOverflow = popupRect.right - (mapRect.right - viewportMargin.right);
  const topOverflow = mapRect.top + viewportMargin.top - popupRect.top;
  const bottomOverflow = popupRect.bottom - (mapRect.bottom - viewportMargin.bottom);

  if (leftOverflow > 0) {
    deltaX = -leftOverflow;
  } else if (rightOverflow > 0) {
    deltaX = rightOverflow;
  }

  if (topOverflow > 0) {
    deltaY = -topOverflow;
  } else if (bottomOverflow > 0) {
    deltaY = bottomOverflow;
  }

  if (deltaX !== 0 || deltaY !== 0) {
    map.panBy([deltaX, deltaY], { animate: true, duration: 0.25 });
  }
}

/**
 * @param {{
 *   locations: typeof chargerLocations,
 *   areaBounds: [[number, number], [number, number]],
 *   onPopupVisibilityChange: (isVisible: boolean) => void
 * }} props
 */
function MapViewportController({ locations, areaBounds, onPopupVisibilityChange }) {
  const map = useMap();

  useEffect(() => {
    const updateViewportConstraints = () => {
      const zoomPadding = L.point(40, 164);
      const areaBoundsLiteral = L.latLngBounds(areaBounds);
      const computedMinZoom = Math.max(map.getBoundsZoom(areaBoundsLiteral, false, zoomPadding) - 1, 14);
      const { popupWidth, popupHeight } = getLargestPopupEstimate(locations, map);

      const dynamicPadding = {
        top: Math.ceil(viewportPadding.topLeft[1] + popupHeight + 24),
        right: Math.ceil(popupWidth / 2 + 36),
        bottom: Math.ceil(viewportPadding.bottomRight[1] + Math.max(120, popupHeight * 0.35)),
        left: Math.ceil(popupWidth / 2 + 36),
      };

      const computedMaxBounds = getPixelExpandedBounds(map, areaBounds, {
        top: dynamicPadding.top,
        right: dynamicPadding.right,
        bottom: dynamicPadding.bottom,
        left: dynamicPadding.left,
      });

      map.setMinZoom(computedMinZoom);
      map.setMaxBounds(computedMaxBounds);
    };

    updateViewportConstraints();

    const handlePopupOpen = (event) => {
      onPopupVisibilityChange(true);

      requestAnimationFrame(() => {
        keepPopupFullyVisible(map, event.popup);
      });
    };

    const handlePopupClose = () => {
      onPopupVisibilityChange(false);
    };

    map.on('zoomend', updateViewportConstraints);
    map.on('resize', updateViewportConstraints);
    map.on('popupopen', handlePopupOpen);
    map.on('popupclose', handlePopupClose);

    return () => {
      map.off('zoomend', updateViewportConstraints);
      map.off('resize', updateViewportConstraints);
      map.off('popupopen', handlePopupOpen);
      map.off('popupclose', handlePopupClose);
    };
  }, [areaBounds, locations, map, onPopupVisibilityChange]);

  useEffect(() => {
    if (!locations.length) return;

    map.fitBounds(getBounds(locations, 0.04), {
      paddingTopLeft: viewportPadding.topLeft,
      paddingBottomRight: viewportPadding.bottomRight,
      maxZoom: 18,
    });
  }, [locations, map]);

  return null;
}

export default function MapHome() {
  const navigate = useNavigate();
  const { user } = /** @type {{ user: any }} */ (useAuth());
  const [search, setSearch] = useState('');
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const { data: chargers = [] } = useQuery({
    queryKey: ['chargers'],
    queryFn: listChargers,
  });

  /** @param {import('react').ChangeEvent<HTMLInputElement>} event */
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  useEffect(() => {
    if (user && !user.onboarding_complete) navigate('/onboarding');
  }, [user, navigate]);

  const chargersByKey = useMemo(() => {
    const map = new Map();

    chargers.forEach((charger) => {
      map.set(normalizeChargerKey(charger.id), charger);
      map.set(normalizeChargerKey(charger.name), charger);
    });

    return map;
  }, [chargers]);

  const searchTerm = search.trim().toLowerCase();
  const locationSummaries = useMemo(() => {
    return chargerLocations.map((location) => {
      const chargersAtLocation = location.chargers.map((chargerId) => {
        const chargerRecord = chargersByKey.get(normalizeChargerKey(chargerId));
        const status = chargerRecord?.status || 'offline';

        return {
          id: chargerId,
          status,
          record: chargerRecord || null,
        };
      });

      const statusCounts = chargersAtLocation.reduce((counts, charger) => {
        counts[charger.status] = (counts[charger.status] || 0) + 1;
        return counts;
      }, { available: 0, occupied: 0, offline: 0 });

      let markerStatus = 'offline';
      if (statusCounts.available > 0) {
        markerStatus = 'available';
      } else if (statusCounts.occupied > 0) {
        markerStatus = 'occupied';
      }

      return {
        ...location,
        chargers: chargersAtLocation,
        markerStatus,
        statusCounts,
      };
    });
  }, [chargersByKey]);

  const filteredLocations = useMemo(() => {
    return locationSummaries.filter(location => {
      if (!searchTerm) return true;

      return location.name.toLowerCase().includes(searchTerm) ||
        location.chargers.some(charger => charger.id.toLowerCase().includes(searchTerm));
    });
  }, [locationSummaries, searchTerm]);

  const totalChargers = useMemo(() => {
    return locationSummaries.reduce((sum, location) => sum + location.chargers.length, 0);
  }, [locationSummaries]);

  const statusTotals = useMemo(() => {
    return locationSummaries.reduce((totals, location) => {
      totals.available += location.statusCounts.available;
      totals.occupied += location.statusCounts.occupied;
      totals.offline += location.statusCounts.offline;
      return totals;
    }, { available: 0, occupied: 0, offline: 0 });
  }, [locationSummaries]);

  const areaBounds = useMemo(() => getBounds(chargerLocations, 0.08), []);

  /** @param {string} chargerId */
  const handleSelectCharger = (chargerId) => {
    navigate(`/charge?chargerId=${encodeURIComponent(chargerId)}`);
  };

  return (
    <div className="h-full overflow-hidden flex flex-col relative">
      {/* Header overlay */}
      <div className={`absolute top-0 left-0 right-0 z-[1000] px-4 pt-4 pb-2 transition-all duration-200 ${isPopupOpen ? 'pointer-events-none -translate-y-3 opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="bg-card/95 backdrop-blur-xl rounded-2xl shadow-lg border border-border p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <h1 className="font-heading font-bold text-base">ChargeSmart</h1>
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">{filteredLocations.length} locations</span>
                <span className="text-muted-foreground/60">•</span>
                <span className="text-muted-foreground">{statusTotals.available} available</span>
                <span className="text-muted-foreground/60">•</span>
                <span className="text-muted-foreground">{totalChargers} smart chargers</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              placeholder="Search towers, blocks, or charger IDs..."
              value={search}
              onChange={handleSearchChange}
              className="flex h-9 w-full rounded-md border-0 bg-muted/50 pl-9 pr-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="flex-1">
        <MapContainer
          center={[22.3368, 114.2638]}
          zoom={16}
          className="h-full w-full"
          zoomControl={false}
          minZoom={14}
        >
          <MapViewportController
            locations={filteredLocations}
            areaBounds={areaBounds}
            onPopupVisibilityChange={setIsPopupOpen}
          />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          {filteredLocations.map(location => (
            <CircleMarker
              key={location.id}
              center={[location.latitude, location.longitude]}
              radius={10}
              pathOptions={{
                color: '#ffffff',
                weight: 3,
                fillColor: chargerStatusMeta[location.markerStatus].markerColor,
                fillOpacity: 0.9,
              }}
            >
              <Tooltip direction="top" offset={[0, -8]} opacity={1}>
                <span className="font-medium text-xs">{location.name}</span>
              </Tooltip>
              <Popup
                autoPan={false}
                autoPanPaddingTopLeft={viewportPadding.topLeft}
                autoPanPaddingBottomRight={viewportPadding.bottomRight}
              >
                <div className="font-body min-w-[220px] max-w-[280px]">
                  <p className="font-heading font-semibold text-sm">{location.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {location.chargers.length} smart charger{location.chargers.length === 1 ? '' : 's'}
                  </p>
                  <div className="mt-3 space-y-2">
                    {groupChargersByPrefix(location.chargers).map((group, groupIndex) => (
                      <div key={`${location.id}-${group.prefix}-${groupIndex}`}>
                        {groupIndex > 0 && <div className="mb-2 border-t border-border/70" />}
                        <div className="flex flex-wrap gap-1.5">
                          {group.chargers.map((charger) => (
                            <button
                              key={charger.id}
                              type="button"
                              onClick={() => charger.status === 'available' && handleSelectCharger(charger.id)}
                              disabled={charger.status !== 'available'}
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium transition-colors',
                                chargerStatusMeta[charger.status].chipClassName,
                                charger.status === 'available'
                                  ? 'hover:border-primary hover:bg-primary hover:text-primary-foreground'
                                  : 'cursor-not-allowed opacity-80'
                              )}
                            >
                              <span className={cn('h-2 w-2 rounded-full', chargerStatusMeta[charger.status].dotClassName)} />
                              <span>{charger.id}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {filteredLocations.length === 0 && (
          <div className="absolute inset-x-4 top-28 z-[1000] rounded-2xl border border-border bg-card/95 p-4 text-sm text-muted-foreground shadow-lg backdrop-blur-xl">
            No matching locations found for the current search.
          </div>
        )}
      </div>

      <MapLegend />
    </div>
  );
}