'use client';

import React from 'react';
import { Plantation } from '@/types/plantation';
import { WeatherData } from '@/types/weather';
import {
  Thermometer,
  Droplets,
  CloudRain,
  Sun,
  CloudSun,
  Cloud,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  ChevronRight,
  LandPlot,
  MapPin,
} from 'lucide-react';

interface PlantationCardProps {
  plantation: Plantation;
  weather?: WeatherData;
  isSelected: boolean;
  onClick: () => void;
}

export default function PlantationCard({
  plantation,
  weather,
  isSelected,
  onClick,
}: PlantationCardProps) {
  // Render dynamic weather icon based on condition (compact)
  const renderWeatherIcon = () => {
    if (!weather) return <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin shrink-0" />;
    const iconName = weather.condition.iconName;

    switch (iconName) {
      case 'Sun':
        return <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'SunDim':
      case 'CloudSun':
        return <CloudSun className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'Cloud':
        return <Cloud className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
      case 'CloudDrizzle':
        return <CloudDrizzle className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
      case 'CloudRain':
      case 'CloudSunRain':
        return <CloudRain className="w-3.5 h-3.5 text-blue-500 animate-pulse shrink-0" />;
      case 'CloudLightning':
        return <CloudLightning className="w-3.5 h-3.5 text-rose-500 animate-bounce shrink-0" />;
      case 'CloudFog':
        return <CloudFog className="w-3.5 h-3.5 text-zinc-400 shrink-0" />;
      default:
        return <CloudSun className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    }
  };

  // Kondisi cuaca langsung dari Open-Meteo
  const conditionInfo = weather ? weather.condition : {
    label: 'Memuat Cuaca...',
    badgeBg: 'bg-zinc-100 dark:bg-zinc-800',
    badgeText: 'text-zinc-600 dark:text-zinc-400',
    borderClass: 'border-zinc-200 dark:border-zinc-700',
  };

  return (
    <div
      onClick={onClick}
      className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${isSelected
        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
        : 'bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800 hover:border-emerald-400/60 dark:hover:border-emerald-600/60 hover:shadow-md'
        }`}
    >
      {/* Top badges: Region, Province, Soil Type */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${plantation.region === 'Sumatra'
              ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
              : 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20'
              }`}
          >
            {plantation.region}
          </span>
          <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
            {plantation.province}
          </span>
        </div>

        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${plantation.soilType === 'Lahan Gambut'
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300'
            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
            }`}
        >
          {plantation.soilType}
        </span>
      </div>

      {/* Title & Division */}
      <div className="mb-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors flex items-center justify-between">
          <span>{plantation.name}</span>
          <ChevronRight
            className={`w-4 h-4 transition-transform duration-200 text-zinc-400 ${isSelected ? 'transform translate-x-1 text-emerald-600' : 'group-hover:translate-x-0.5'
              }`}
          />
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1">
          {plantation.regency} &bull; {plantation.companyDivision}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5 text-[11px] font-mono text-zinc-600 dark:text-zinc-300 bg-zinc-100/90 dark:bg-zinc-800/80 px-2 py-0.5 rounded-md w-fit border border-zinc-200/60 dark:border-zinc-700/50">
          <MapPin className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{plantation.latitude.toFixed(4)}°, {plantation.longitude.toFixed(4)}°</span>
        </div>
      </div>

      {/* Real-Time Open-Meteo Weather Snapshot */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-700/50 mb-3">
        {/* Temperature */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="p-1 rounded-md bg-amber-500/10 text-amber-600 shrink-0">
            <Thermometer className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-zinc-400 whitespace-nowrap">Suhu</div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white whitespace-nowrap">
              {weather ? `${weather.current.temperature}°C` : '--'}
            </div>
          </div>
        </div>

        {/* Humidity */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="p-1 rounded-md bg-sky-500/10 text-sky-600 shrink-0">
            <Droplets className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-zinc-400 whitespace-nowrap">Lembap</div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white whitespace-nowrap">
              {weather ? `${weather.current.humidity}%` : '--'}
            </div>
          </div>
        </div>

        {/* Precipitation */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="p-1 rounded-md bg-blue-500/10 text-blue-600 shrink-0">
            <CloudRain className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[10px] text-zinc-400 whitespace-nowrap">Hujan</div>
            <div className="text-xs font-bold text-zinc-900 dark:text-white whitespace-nowrap">
              {weather ? `${weather.current.precipitation} mm` : '--'}
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Live Weather Condition & Area info */}
      <div className="flex items-center justify-between text-[11px] pt-1">
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-medium ${conditionInfo.badgeBg} ${conditionInfo.badgeText} ${conditionInfo.borderClass}`}>
          {renderWeatherIcon()}
          <span className="truncate max-w-[150px] text-[10px] font-semibold">{conditionInfo.label}</span>
        </div>

        <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-[10px]">
          <LandPlot className="w-3 h-3" />
          <span>{plantation.areaHectares.toLocaleString('id-ID')} Ha</span>
        </div>
      </div>
    </div>
  );
}
