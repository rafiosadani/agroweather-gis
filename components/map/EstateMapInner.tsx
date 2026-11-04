'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Plantation } from '@/types/plantation';
import { WeatherData } from '@/types/weather';
import { Layers, RotateCcw, Trees, LandPlot, Crosshair, MapPin } from 'lucide-react';

interface EstateMapInnerProps {
  plantations: Plantation[];
  weatherMap: Record<string, WeatherData>;
  selectedPlantation: Plantation | null;
  onSelectPlantation: (plantation: Plantation) => void;
  onResetSelection?: () => void;
  focusTrigger?: number;
}

type BasemapType = 'osm' | 'satellite' | 'topo';

export default function EstateMapInner({
  plantations,
  weatherMap,
  selectedPlantation,
  onSelectPlantation,
  onResetSelection,
  focusTrigger,
}: EstateMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<L.Map | null>(null);

  const markersRef = useRef<Record<string, L.Marker>>({});
  const polygonsRef = useRef<Record<string, L.Polygon>>({});
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [currentBasemap, setCurrentBasemap] = useState<BasemapType>('osm');
  const [showZones, setShowZones] = useState<boolean>(true);
  const [cursorCoords, setCursorCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Indonesia overview center
  const DEFAULT_CENTER: [number, number] = [-2.0, 108.5];
  const DEFAULT_ZOOM = 5;

  // 1. Initialize Map Instance and ResizeObserver
  useEffect(() => {
    if (!mapContainerRef.current || map) return;

    const leafletMap = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: 4,
      maxZoom: 18,
      zoomControl: false,
    });

    // Custom zoom control positioned at bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(leafletMap);

    // Initial tile layer (OpenStreetMap Standard - 100% Free & Clean)
    const initialTile = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    ).addTo(leafletMap);

    // Track mouse coordinates over map for real-time GIS HUD
    leafletMap.on('mousemove', (e: L.LeafletMouseEvent) => {
      setCursorCoords({
        lat: Math.round(e.latlng.lat * 10000) / 10000,
        lon: Math.round(e.latlng.lng * 10000) / 10000,
      });
    });

    tileLayerRef.current = initialTile;
    setMap(leafletMap);

    // Ensure Leaflet recalculates dimensions on flex resize
    const resizeObserver = new ResizeObserver(() => {
      leafletMap.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
      leafletMap.remove();
      setMap(null);
    };
  }, []);

  // 2. Update Basemap Layer
  useEffect(() => {
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let url = '';
    let attribution = '';

    if (currentBasemap === 'satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
    } else if (currentBasemap === 'topo') {
      url = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      attribution = 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)';
    } else {
      url = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
    }

    const newLayer = L.tileLayer(url, {
      attribution,
      maxZoom: 18,
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [map, currentBasemap]);

  // 3. Render and Update Markers and Concession Zone Polygons
  useEffect(() => {
    if (!map) return;

    map.invalidateSize();

    const currentPlantationIds = new Set(plantations.map((p) => p.id));

    // Clean up old markers
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentPlantationIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Clean up old polygons
    Object.keys(polygonsRef.current).forEach((id) => {
      if (!currentPlantationIds.has(id) || !showZones) {
        polygonsRef.current[id].remove();
        delete polygonsRef.current[id];
      }
    });

    plantations.forEach((plantation) => {
      const weather = weatherMap[plantation.id];
      const isSelected = selectedPlantation?.id === plantation.id;
      const temp = weather ? `${Math.round(weather.current.temperature)}°C` : '--°C';
      const rain = weather ? weather.current.precipitation : 0;
      const isRain = rain > 0.5;
      const isGambut = plantation.soilType === 'Lahan Gambut';

      // --- 1. RENDER CONCESSION ZONE BORDER POLYGONS (SOLID GARIS) ---
      if (showZones && plantation.boundaryCoordinates && plantation.boundaryCoordinates.length > 0) {
        let polygon = polygonsRef.current[plantation.id];

        const polygonColor = isSelected
          ? '#10b981' // Bright glowing emerald saat dipilih
          : isGambut
            ? '#d97706' // Amber untuk lahan gambut
            : '#059669'; // Forest emerald untuk tanah mineral

        const polygonOptions: L.PolylineOptions = {
          color: polygonColor,
          weight: isSelected ? 4 : 2,
          opacity: isSelected ? 1.0 : 0.8,
          fillColor: isSelected ? '#10b981' : isGambut ? '#f59e0b' : '#10b981',
          fillOpacity: isSelected ? 0.3 : 0.15,
          dashArray: undefined,
          className: isSelected ? 'selected-estate-polygon' : '',
        };

        if (!polygon) {
          polygon = L.polygon(plantation.boundaryCoordinates, polygonOptions).addTo(map);

          polygon.on('click', () => {
            onSelectPlantation(plantation);
          });

          polygonsRef.current[plantation.id] = polygon;
        } else {
          polygon.setStyle(polygonOptions);
          polygon.setLatLngs(plantation.boundaryCoordinates);
        }

        if (isSelected) {
          polygon.bringToFront();
        }

        // Tooltip ringkas pada batas poligon (tanpa koordinat ganda)
        polygon.bindTooltip(
          `<b>Batas Konsesi: ${plantation.name}</b><br/>Luas: ${plantation.areaHectares.toLocaleString('id-ID')} Ha &bull; ${plantation.soilType}`,
          {
            sticky: true,
            className: 'custom-polygon-tooltip text-xs font-sans p-2 rounded-lg shadow-lg',
          }
        );
      }

      // --- 2. RENDER UNIFIED PIN: FLOATING WEATHER PILL + CENTROID GPS DOT ---
      // (Best practice: 1 elemen terpadu, tidak ada double pin!)
      let dotColor = 'bg-emerald-500';
      let badgeBg = 'bg-slate-900/95 text-white border-emerald-500/50';
      if (isRain) {
        dotColor = 'bg-blue-500 animate-pulse';
        badgeBg = 'bg-slate-900/95 text-sky-300 border-blue-500/50';
      } else if (weather && weather.current.temperature > 33) {
        dotColor = 'bg-amber-500';
        badgeBg = 'bg-slate-900/95 text-amber-300 border-amber-500/50';
      }

      const iconHtml = `
        <div class="group relative cursor-pointer flex flex-col items-center select-none ${isSelected ? 'z-50' : 'hover:z-40 z-20'
        }">
          <!-- Floating Pill Badge (Suhu & Nama Kebun saat hover/selected) -->
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-lg border backdrop-blur-md transition-all duration-200 ${badgeBg} ${isSelected
          ? 'ring-2 ring-emerald-400 scale-105 shadow-emerald-500/40 bg-slate-950'
          : 'hover:scale-105'
        }">
            <span class="w-2 h-2 rounded-full ${dotColor}"></span>
            <span class="text-xs font-bold tracking-tight">${temp}</span>
            <span class="text-[10px] text-zinc-300 font-medium ${isSelected ? 'inline ml-1 font-semibold text-emerald-300' : 'hidden group-hover:inline ml-1'
        } whitespace-nowrap">
              ${plantation.name.replace('Kebun ', '')}
            </span>
          </div>

          <!-- Needle Stem -->
          <div class="w-[2px] h-2.5 bg-slate-800 dark:bg-zinc-600"></div>
          
          <!-- Titik Pusat Koordinat GPS Kebun (Tunggal & Presisi di Titik Lat/Lon) -->
          <div class="w-4 h-4 flex items-center justify-center relative -mt-[1px]">
            ${isSelected
          ? `<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>`
          : ''
        }
            <span class="relative inline-flex rounded-full h-3 w-3 ${isSelected
          ? 'bg-emerald-400 ring-2 ring-white shadow-lg'
          : isGambut
            ? 'bg-amber-500 ring-2 ring-white shadow-md'
            : 'bg-emerald-600 ring-2 ring-white shadow-md'
        }"></span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: iconHtml,
        iconSize: [140, 52],
        iconAnchor: [70, 43], // Exact centroid dot center at [lat, lon]
        popupAnchor: [0, -44],
      });

      let marker = markersRef.current[plantation.id];

      if (!marker) {
        marker = L.marker([plantation.latitude, plantation.longitude], {
          icon: customIcon,
          title: plantation.name,
        }).addTo(map);

        marker.on('click', () => {
          onSelectPlantation(plantation);
        });

        markersRef.current[plantation.id] = marker;
      } else {
        marker.setIcon(customIcon);
        marker.setLatLng([plantation.latitude, plantation.longitude]);
      }

      // Popup Content: Dark Glassmorphic, 100% Rapi & Tanpa Teks Terpotong/Turun ke Bawah
      const shortProvince = plantation.province
        .replace('Sumatera ', 'Sum. ')
        .replace('Kalimantan ', 'Kal. ');

      const popupHtml = `
        <div class="p-3.5 font-sans w-[295px] text-slate-100">
          <!-- Header: Region + Soil Type satu div di kiri, Tombol X di kanan -->
          <div class="flex items-center justify-between mb-2.5 pr-7">
            <!-- Div Grup Kiri: Region dan Soil Type selalu berdampingan dengan gap pas -->
            <div class="flex items-center gap-1.5">
              <span class="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide whitespace-nowrap shrink-0 ${plantation.region === 'Sumatra'
          ? 'bg-amber-400/20 text-amber-300 border border-amber-500/30'
          : 'bg-emerald-400/20 text-emerald-300 border border-emerald-500/30'
        }">
                ${plantation.region} &bull; ${shortProvince}
              </span>
              <span class="text-[10px] text-zinc-300 font-medium bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700 whitespace-nowrap shrink-0">
                ${plantation.soilType}
              </span>
            </div>
            <!-- Sisi kanan khusus area tombol silang (X) Leaflet -->
          </div>

          <h4 class="text-sm font-bold text-white leading-tight drop-shadow-sm truncate">${plantation.name}</h4>
          <p class="m-0 text-[11px] text-zinc-300 mb-2.5 font-normal leading-relaxed truncate">${plantation.companyDivision}</p>

          <!-- Cuaca Snapshot Grid -->
          <div class="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-slate-800/90 border border-slate-700/80 mb-2.5 text-center shadow-inner">
            <div>
              <div class="text-[10px] text-zinc-400 font-medium">Suhu</div>
              <div class="text-xs font-bold text-white">${weather ? `${weather.current.temperature}°C` : '--'}</div>
            </div>
            <div>
              <div class="text-[10px] text-zinc-400 font-medium">Lembap</div>
              <div class="text-xs font-bold text-white">${weather ? `${weather.current.humidity}%` : '--'}</div>
            </div>
            <div>
              <div class="text-[10px] text-zinc-400 font-medium">Hujan</div>
              <div class="text-xs font-bold ${isRain ? 'text-sky-300 font-extrabold' : 'text-white'}">${weather ? `${weather.current.precipitation} mm` : '--'}</div>
            </div>
          </div>

          <!-- Bottom Row: Luas & GPS (Satu baris rapi tanpa turun ke bawah) -->
          <div class="flex items-center justify-between text-[11px] pt-2 border-t border-slate-700/80 text-zinc-300">
            <span class="whitespace-nowrap">Luas: <b class="text-emerald-400 font-semibold">${plantation.areaHectares.toLocaleString('id-ID')} Ha</b></span>
            <span class="font-mono text-[10px] text-emerald-300 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 whitespace-nowrap">
              📍 ${plantation.latitude.toFixed(4)}°, ${plantation.longitude.toFixed(4)}°
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, {
        className: 'custom-gis-popup',
        maxWidth: 320,
        autoPan: false, // autoPan: false mencegah kamera tergeser dari posisi center
      });
    });
  }, [map, plantations, weatherMap, selectedPlantation, onSelectPlantation, showZones]);

  // 4. KETIKA KEBUN DIPILIH / DI-RESET / CARD DI-KLIK:
  // Jika kebun dipilih: flyTo ke koordinat kebun (zoom 12)
  // Jika null (tampilan awal / reset): zoom-out ke overview seluruh kebun di nusantara
  useEffect(() => {
    if (!map) return;

    // Jika tidak ada kebun yang dipilih (Overview Mode)
    if (!selectedPlantation) {
      map.closePopup();
      if (plantations && plantations.length > 0) {
        const bounds = L.latLngBounds(plantations.map((p) => [p.latitude, p.longitude]));
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
          return;
        }
      }
      map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 0.8 });
      return;
    }

    // 1. Validasi koordinat numerik
    const lat = Number(selectedPlantation.latitude);
    const lon = Number(selectedPlantation.longitude);
    if (isNaN(lat) || isNaN(lon)) return;

    // 2. Cegah kalkulasi flyTo jika kontainer peta sedang tersembunyi (display: none / size 0 di mobile)
    const container = map.getContainer();
    if (!container || container.offsetWidth === 0 || container.offsetHeight === 0) {
      return;
    }

    const mapSize = map.getSize();
    if (!mapSize || mapSize.x === 0 || mapSize.y === 0) {
      return;
    }

    map.invalidateSize();

    // 3. Eksekusi flyTo secara aman
    try {
      map.flyTo([lat, lon], 12, {
        duration: 0.8,
        animate: true,
      });

      // Tampilkan popup otomatis pada titik marker
      const marker = markersRef.current[selectedPlantation.id];
      if (marker) {
        setTimeout(() => {
          marker.openPopup();
        }, 350);
      }
    } catch (err) {
      console.warn('Gagal memusatkan kamera peta:', err);
    }
  }, [map, selectedPlantation, focusTrigger, plantations]);

  // Reset View handler (Fokus Wilayah / Kembali ke Overview)
  const handleResetView = () => {
    if (!map) return;
    map.closePopup();
    if (onResetSelection) {
      onResetSelection();
    }
    if (plantations && plantations.length > 0) {
      const bounds = L.latLngBounds(plantations.map((p) => [p.latitude, p.longitude]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
        return;
      }
    }
    map.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM, { duration: 1.0 });
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden shadow-inner border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Control: Layer Switcher, Zone Toggle & Reset */}
      <div className="absolute top-3 left-3 z-[400] flex flex-col gap-2">
        {/* Basemap Switcher */}
        <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 text-xs">
          <div className="px-2 py-1 flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-200 text-[11px] border-r border-zinc-200 dark:border-zinc-800 pr-2">
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>Layer</span>
          </div>
          <button
            onClick={() => setCurrentBasemap('osm')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${currentBasemap === 'osm'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
          >
            Vektor
          </button>
          <button
            onClick={() => setCurrentBasemap('satellite')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${currentBasemap === 'satellite'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
          >
            Satelit
          </button>
          <button
            onClick={() => setCurrentBasemap('topo')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${currentBasemap === 'topo'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
          >
            Topografi
          </button>
        </div>

        {/* Zona Batas Kebun Toggle & Reset Button */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setShowZones(!showZones)}
            className={`px-3 py-1.5 rounded-xl shadow-lg border backdrop-blur-md text-xs font-semibold flex items-center gap-1.5 transition-all ${showZones
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-white/95 dark:bg-zinc-900/95 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50'
              }`}
            title="Tampilkan atau sembunyikan poligon batas zona konsesi kebun"
          >
            <LandPlot className="w-3.5 h-3.5" />
            <span>Zona Batas: {showZones ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={handleResetView}
            className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
            <span>Fokus Wilayah</span>
          </button>
        </div>
      </div>

      {/* TOP-RIGHT GIS CURSOR TELEMETRY (Ultra-compact, Zero Collision with Left Controls) */}
      <div className="absolute top-3 right-3 z-[400] hidden sm:flex items-center gap-2 bg-slate-900/90 text-white backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg border border-slate-700/80 text-[11px] font-mono select-none">
        <Crosshair className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="text-[10px] text-zinc-400 font-sans">Kursor:</span>
        <span className="text-zinc-100 font-bold">
          {cursorCoords ? `${cursorCoords.lat.toFixed(4)}, ${cursorCoords.lon.toFixed(4)}` : 'Peta Aktif'}
        </span>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[400] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-800 text-xs">
        <div className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 mb-1 flex items-center gap-1.5">
          <Trees className="w-3.5 h-3.5 text-emerald-600" />
          <span>Legenda GIS & Batas Zona</span>
        </div>
        <div className="flex flex-col gap-1 text-[10px] text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-3.5 flex items-center justify-center shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-800 shadow-sm"></span>
            </div>
            <span>Titik Bundar Koordinat GPS Pusat Kebun</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3.5 flex items-center justify-center shrink-0">
              <span className="w-3.5 h-2 rounded border-2 border-emerald-500 bg-emerald-500/25"></span>
            </div>
            <span>Garis Batas Konsesi Luas Kebun (Solid)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-3.5 flex items-center justify-center shrink-0">
              <span className="w-3.5 h-2 rounded border-2 border-amber-500 bg-amber-500/25"></span>
            </div>
            <span>Zona Konsesi Lahan Gambut</span>
          </div>
        </div>
      </div>
    </div>
  );
}
