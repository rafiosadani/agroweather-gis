'use client';

import React, { useMemo } from 'react';
import { Plantation, Region } from '@/types/plantation';
import { WeatherData } from '@/types/weather';
import PlantationCard from './PlantationCard';
import {
  Search,
  Filter,
  ArrowUpDown,
  X,
  Trees,
  CloudRain,
  SlidersHorizontal,
} from 'lucide-react';

interface SidebarProps {
  plantations: Plantation[];
  weatherMap: Record<string, WeatherData>;
  selectedPlantation: Plantation | null;
  onSelectPlantation: (plantation: Plantation) => void;
  selectedRegion: 'Semua' | Region;
  onSelectRegion: (region: 'Semua' | Region) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'name' | 'rain' | 'temperature' | 'area';
  onSortChange: (sort: 'name' | 'rain' | 'temperature' | 'area') => void;
}

export default function Sidebar({
  plantations,
  weatherMap,
  selectedPlantation,
  onSelectPlantation,
  selectedRegion,
  onSelectRegion,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
}: SidebarProps) {
  // 1. Data hasil pencarian keyword (sebelum difilter region)
  // Digunakan untuk menghitung jumlah count dinamis di setiap tab filter
  const searchMatchedPlantations = useMemo(() => {
    if (!searchQuery.trim()) {
      return plantations;
    }
    const query = searchQuery.toLowerCase().trim();
    return plantations.filter((p) => {
      const matchName = p.name.toLowerCase().includes(query);
      const matchProvince = p.province.toLowerCase().includes(query);
      const matchRegency = p.regency.toLowerCase().includes(query);
      const matchDivision = p.companyDivision.toLowerCase().includes(query);
      const matchVariety = p.palmVariety.toLowerCase().includes(query);
      return matchName || matchProvince || matchRegency || matchDivision || matchVariety;
    });
  }, [plantations, searchQuery]);

  // Jumlah count dinamis per tab berdasarkan keyword pencarian yang aktif
  const totalCount = searchMatchedPlantations.length;
  const sumatraCount = searchMatchedPlantations.filter((p) => p.region === 'Sumatra').length;
  const kalimantanCount = searchMatchedPlantations.filter((p) => p.region === 'Kalimantan').length;

  // 2. Filter berdasarkan tab region yang aktif, kemudian urutkan (sort)
  const filteredPlantations = useMemo(() => {
    return searchMatchedPlantations
      .filter((p) => {
        if (selectedRegion === 'Semua') return true;
        return p.region === selectedRegion;
      })
      .sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'area') {
          return b.areaHectares - a.areaHectares;
        }
        if (sortBy === 'rain') {
          const rainA = weatherMap[a.id]?.current.precipitation ?? 0;
          const rainB = weatherMap[b.id]?.current.precipitation ?? 0;
          return rainB - rainA;
        }
        if (sortBy === 'temperature') {
          const tempA = weatherMap[a.id]?.current.temperature ?? 0;
          const tempB = weatherMap[b.id]?.current.temperature ?? 0;
          return tempB - tempA;
        }
        return 0;
      });
  }, [searchMatchedPlantations, selectedRegion, sortBy, weatherMap]);

  return (
    <aside className="w-full lg:w-[330px] xl:w-[360px] h-full flex flex-col bg-zinc-50/50 dark:bg-zinc-950/40 border-r border-zinc-200 dark:border-zinc-800 shrink-0">
      {/* Search and Filters Header */}
      <div className="p-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari kebun, provinsi, atau varietas..."
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Region Filter Tabs dengan Jumlah Count Dinamis */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold">
          <button
            onClick={() => onSelectRegion('Semua')}
            className={`py-1.5 px-2 rounded-lg transition-all text-center ${
              selectedRegion === 'Semua'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Semua ({totalCount})
          </button>
          <button
            onClick={() => onSelectRegion('Sumatra')}
            className={`py-1.5 px-2 rounded-lg transition-all text-center ${
              selectedRegion === 'Sumatra'
                ? 'bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Sumatra ({sumatraCount})
          </button>
          <button
            onClick={() => onSelectRegion('Kalimantan')}
            className={`py-1.5 px-2 rounded-lg transition-all text-center ${
              selectedRegion === 'Kalimantan'
                ? 'bg-white dark:bg-zinc-900 text-teal-600 dark:text-teal-400 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Kalimantan ({kalimantanCount})
          </button>
        </div>

        {/* Sort & Counter Bar */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 pt-1">
          <span className="font-medium text-[11px]">
            Menampilkan <strong className="text-zinc-800 dark:text-zinc-200">{filteredPlantations.length}</strong> kebun
          </span>

          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="bg-transparent text-[11px] font-medium text-zinc-700 dark:text-zinc-300 focus:outline-none cursor-pointer"
            >
              <option value="name">Nama Kebun (A-Z)</option>
              <option value="rain">Curah Hujan Tertinggi</option>
              <option value="temperature">Suhu Tertinggi</option>
              <option value="area">Luas Area Terbesar</option>
            </select>
          </div>
        </div>
      </div>

      {/* Plantation Cards Scrollable List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {filteredPlantations.length > 0 ? (
          filteredPlantations.map((plantation) => (
            <PlantationCard
              key={plantation.id}
              plantation={plantation}
              weather={weatherMap[plantation.id]}
              isSelected={selectedPlantation?.id === plantation.id}
              onClick={() => onSelectPlantation(plantation)}
            />
          ))
        ) : (
          <div className="py-12 px-4 text-center">
            <Trees className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2" />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Tidak ada kebun ditemukan
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Coba sesuaikan kata kunci pencarian atau filter wilayah Anda.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
