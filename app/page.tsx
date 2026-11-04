'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PLANTATIONS_DATA } from '@/data/plantations';
import { Plantation, Region } from '@/types/plantation';
import { WeatherData } from '@/types/weather';
import { fetchPlantationWeather } from '@/services/weatherService';

import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import EstateDetailPanel from '@/components/dashboard/EstateDetailPanel';
import EstateMap from '@/components/map/EstateMap';

import {
  MapPin,
  ListFilter,
  Sparkles,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';

export default function Home() {
  const [plantations] = useState<Plantation[]>(PLANTATIONS_DATA);
  const [weatherMap, setWeatherMap] = useState<Record<string, WeatherData>>({});
  // Mode Overview di awal: belum ada kebun yang dipilih (kamera makro nusantara)
  const [selectedPlantation, setSelectedPlantation] = useState<Plantation | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<'Semua' | Region>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'rain' | 'temperature' | 'area'>('name');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Mobile layout state: 'map' | 'list' | 'detail'
  const [mobileTab, setMobileTab] = useState<'map' | 'list' | 'detail'>('map');

  // Desktop detail panel collapsible state (tertutup di awal untuk keluasan peta)
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  const [focusTrigger, setFocusTrigger] = useState<number>(0);

  // Load weather for all plantations with staggered fetching (avoids HTTP 429 burst rate limits)
  const loadAllWeather = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const newWeatherMap: Record<string, WeatherData> = {};

      for (const plantation of plantations) {
        try {
          const data = await fetchPlantationWeather(plantation);
          newWeatherMap[plantation.id] = data;
        } catch (err) {
          console.error(`Error loading weather for ${plantation.name}:`, err);
        }
        // Jeda 100ms antar kebun untuk mencegah burst rate limit 429
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      setWeatherMap((prev) => ({ ...prev, ...newWeatherMap }));
      setLastUpdated(
        new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' WIB'
      );
    } catch (error) {
      console.error('Failed to load all weather data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [plantations]);

  // Initial load
  useEffect(() => {
    loadAllWeather();
  }, [loadAllWeather]);

  const handleSelectPlantation = (plantation: Plantation) => {
    setSelectedPlantation(plantation);
    setFocusTrigger(Date.now());
    setIsDetailOpen(true);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Header */}
      <Header
        plantations={plantations}
        weatherMap={weatherMap}
        isRefreshing={isRefreshing}
        onRefresh={loadAllWeather}
        lastUpdated={lastUpdated}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* DESKTOP SIDEBAR / MOBILE LIST VIEW */}
        <div
          className={`h-full lg:block ${
            mobileTab === 'list' ? 'block' : 'hidden'
          }`}
        >
          <Sidebar
            plantations={plantations}
            weatherMap={weatherMap}
            selectedPlantation={selectedPlantation}
            onSelectPlantation={(p) => {
              handleSelectPlantation(p);
              // On mobile, switch to detail or map
              setMobileTab('detail');
            }}
            selectedRegion={selectedRegion}
            onSelectRegion={setSelectedRegion}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {/* MAP & DETAIL VIEW AREA */}
        <div
          className={`flex-1 h-full relative flex flex-col lg:flex-row overflow-hidden ${
            mobileTab === 'map' ? 'block' : mobileTab === 'detail' ? 'lg:flex' : 'hidden lg:flex'
          }`}
        >
          {/* Map Container */}
          <div
            className={`flex-1 h-full p-2.5 sm:p-4 transition-all duration-300 relative ${
              mobileTab === 'detail' ? 'hidden lg:block' : 'block'
            }`}
          >
            <EstateMap
              plantations={plantations}
              weatherMap={weatherMap}
              selectedPlantation={selectedPlantation}
              focusTrigger={focusTrigger}
              onSelectPlantation={(p) => {
                handleSelectPlantation(p);
              }}
              onResetSelection={() => {
                setSelectedPlantation(null);
                setIsDetailOpen(false);
              }}
            />

            {/* Petunjuk melayang ramah saat dalam mode overview makro */}
            {!selectedPlantation && (
              <div className="hidden sm:flex absolute top-3 left-1/2 -translate-x-1/2 z-[400] bg-slate-900/85 text-white backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-slate-700/60 text-xs items-center gap-2 pointer-events-none select-none animate-in fade-in duration-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-zinc-200 font-medium text-[11px]">
                  Pilih kebun pada peta atau daftar untuk membuka telemetri
                </span>
              </div>
            )}

            {/* Desktop floating drawer tab to open Detail Panel if closed */}
            {!isDetailOpen && selectedPlantation && (
              <button
                onClick={() => setIsDetailOpen(true)}
                className="hidden lg:flex items-center gap-2 absolute right-0 top-1/2 -translate-y-1/2 z-[400] bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white pl-3.5 pr-2.5 py-3 rounded-l-2xl shadow-2xl border-y border-l border-emerald-400/50 transition-all duration-200 group hover:pl-4 cursor-pointer"
                title="Buka Panel Detail Cuaca & Kebun"
              >
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold leading-tight">Detail Cuaca</span>
                  <span className="text-[9px] text-emerald-100 font-medium">Buka Panel</span>
                </div>
              </button>
            )}
          </div>

          {/* DETAIL PANEL (SLIDE-OVER / DEDICATED COLUMN) - COMPACT */}
          {selectedPlantation && isDetailOpen && (
            <div
              className={`w-full lg:w-[310px] xl:w-[340px] h-full shadow-2xl lg:shadow-none z-20 transition-all shrink-0 ${
                mobileTab === 'detail' ? 'block' : 'hidden lg:block'
              }`}
            >
              <EstateDetailPanel
                plantation={selectedPlantation}
                weather={weatherMap[selectedPlantation.id]}
                onClose={() => {
                  setIsDetailOpen(false);
                  setSelectedPlantation(null); // Kembali ke mode overview nusantara
                  if (mobileTab === 'detail') {
                    setMobileTab('map');
                  }
                }}
              />
            </div>
          )}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="lg:hidden bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 p-1.5 flex items-center justify-around z-30">
        <button
          onClick={() => setMobileTab('map')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
            mobileTab === 'map'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40'
              : 'text-zinc-500 font-medium'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span className="text-[10px]">Peta GIS</span>
        </button>

        <button
          onClick={() => setMobileTab('list')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
            mobileTab === 'list'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40'
              : 'text-zinc-500 font-medium'
          }`}
        >
          <ListFilter className="w-4 h-4" />
          <span className="text-[10px]">Daftar Kebun</span>
        </button>

        <button
          onClick={() => {
            if (!selectedPlantation) {
              setMobileTab('list');
            } else {
              setMobileTab('detail');
            }
          }}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all ${
            mobileTab === 'detail'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40'
              : 'text-zinc-500 font-medium'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-[10px]">Analisis Cuaca</span>
        </button>
      </div>
    </div>
  );
}
