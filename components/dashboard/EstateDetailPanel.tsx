'use client';

import React, { useState } from 'react';
import { Plantation } from '@/types/plantation';
import { WeatherData, OperationalAdvisoryItem } from '@/types/weather';
import {
  X,
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  Compass,
  Calendar,
  LandPlot,
  MapPin,
  Layers,
  UserCheck,
  Phone,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Sparkles,
  Flame,
  Truck,
  Sprout,
  Waves,
  ChevronDown,
  Sun,
  SunDim,
  Cloud,
  CloudSun,
  CloudDrizzle,
  CloudSunRain,
  CloudLightning,
  CloudFog,
} from 'lucide-react';

/**
 * Helper render ikon cuaca visual untuk baris prakiraan mingguan
 */
function renderForecastConditionIcon(code: number) {
  switch (code) {
    case 0:
      return (
        <div
          className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs"
          title="Cerah Terang"
        >
          <Sun className="w-4 h-4 text-amber-500 animate-[spin_16s_linear_infinite]" />
        </div>
      );
    case 1:
      return (
        <div
          className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs"
          title="Sebagian Besar Cerah"
        >
          <SunDim className="w-4 h-4 text-amber-500" />
        </div>
      );
    case 2:
      return (
        <div
          className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0 shadow-xs"
          title="Cerah Berawan"
        >
          <CloudSun className="w-4 h-4 text-sky-500 dark:text-sky-400" />
        </div>
      );
    case 3:
      return (
        <div
          className="w-7 h-7 rounded-lg bg-slate-500/15 border border-slate-500/30 flex items-center justify-center shrink-0 shadow-xs"
          title="Mendung Berawan Tebal"
        >
          <Cloud className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </div>
      );
    case 45:
    case 48:
      return (
        <div
          className="w-7 h-7 rounded-lg bg-stone-500/15 border border-stone-500/30 flex items-center justify-center shrink-0 shadow-xs"
          title="Berkabut / Haze"
        >
          <CloudFog className="w-4 h-4 text-stone-500 dark:text-stone-400" />
        </div>
      );
    case 51:
    case 53:
    case 55:
      return (
        <div
          className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-xs"
          title="Gerimis Ringan"
        >
          <CloudDrizzle className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        </div>
      );
    case 61:
    case 63:
    case 65:
    case 82:
      return (
        <div
          className="w-7 h-7 rounded-lg bg-blue-600/15 border border-blue-600/30 flex items-center justify-center shrink-0 shadow-xs"
          title="Hujan"
        >
          <CloudRain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
      );
    case 80:
    case 81:
      return (
        <div
          className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0 shadow-xs"
          title="Hujan Curah Lokal"
        >
          <CloudSunRain className="w-4 h-4 text-blue-500 dark:text-blue-400" />
        </div>
      );
    case 95:
    case 96:
    case 99:
      return (
        <div
          className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0 shadow-xs"
          title="Badai Petir Tropis"
        >
          <CloudLightning className="w-4 h-4 text-rose-500 dark:text-rose-400 animate-pulse" />
        </div>
      );
    default:
      return (
        <div
          className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center shrink-0 shadow-xs"
          title="Berawan"
        >
          <CloudSun className="w-4 h-4 text-sky-500" />
        </div>
      );
  }
}

interface EstateDetailPanelProps {
  plantation: Plantation;
  weather?: WeatherData;
  onClose?: () => void;
}

export default function EstateDetailPanel({
  plantation,
  weather,
  onClose,
}: EstateDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'forecast' | 'profile'>('forecast');

  // Singkatan resmi nama provinsi & kabupaten agar pas dan tidak terpotong ke bawah
  const shortProvince = plantation.province
    .replace('Sumatera ', 'Sum. ')
    .replace('Kalimantan ', 'Kal. ');
  const shortRegency = plantation.regency.replace('Kabupaten ', 'Kab. ');

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border-t lg:border-t-0 lg:border-l border-zinc-200 dark:border-zinc-800 overflow-hidden">
      {/* Panel Header */}
      <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1 pr-1">
          <div className="flex items-center gap-1.5 mb-1 min-w-0">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 ${plantation.region === 'Sumatra'
                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                : 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30'
                }`}
            >
              {plantation.region}
            </span>
            <span
              className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate"
              title={`${plantation.province} • ${plantation.regency}`}
            >
              {shortProvince} &bull; {shortRegency}
            </span>
          </div>
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white leading-tight truncate" title={plantation.name}>
            {plantation.name}
          </h2>
          <div className="flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono text-emerald-700 dark:text-emerald-300 w-fit">
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="font-semibold">{plantation.latitude.toFixed(4)}°, {plantation.longitude.toFixed(4)}°</span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
            title="Tutup Panel Detail"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Weather Hero Card - Compact */}
      <div className="p-3.5 bg-gradient-to-br from-emerald-600 to-teal-800 text-white relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Baris Atas: Label Cuaca Real-Time & Badge Kondisi Cuaca (Bebas Wrapping) */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="text-[11px] text-emerald-100 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <span>Cuaca Real-Time</span>
            </div>

            {weather && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xs whitespace-nowrap">
                {weather.condition.label}
              </span>
            )}
          </div>

          {/* Baris Suhu: Suhu Aktual & Terasa */}
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="text-3xl font-extrabold tracking-tight">
              {weather ? `${weather.current.temperature}°C` : '--'}
            </span>
            <span className="text-xs text-emerald-100 font-medium">
              Terasa {weather ? `${weather.current.apparentTemperature}°C` : '--'}
            </span>
          </div>

          {/* Key Weather Metrics - Seragam, Presisi & Bebas Wrapping */}
          <div className="grid grid-cols-4 gap-1.5 pt-2.5 border-t border-white/20 text-center items-stretch">
            {/* Lembap */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 flex flex-col items-center justify-between h-full">
              <div className="text-[10px] text-emerald-200 flex items-center justify-center gap-1 shrink-0 whitespace-nowrap">
                <Droplets className="w-3.5 h-3.5 shrink-0" />
                <span>Lembap</span>
              </div>
              <div className="text-xs font-bold mt-1 whitespace-nowrap">
                {weather ? weather.current.humidity : '--'}
                <span className="text-[9px] font-normal text-emerald-200 ml-0.5">%</span>
              </div>
            </div>

            {/* Hujan (Curah Hujan) */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 flex flex-col items-center justify-between h-full">
              <div className="text-[10px] text-emerald-200 flex items-center justify-center gap-1 shrink-0 whitespace-nowrap">
                <CloudRain className="w-3.5 h-3.5 shrink-0" />
                <span>Hujan</span>
              </div>
              <div className="text-xs font-bold mt-1 whitespace-nowrap">
                {weather ? weather.current.precipitation : '--'}
                <span className="text-[9px] font-normal text-emerald-200 ml-0.5">mm</span>
              </div>
            </div>

            {/* Kecepatan Angin */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 flex flex-col items-center justify-between h-full">
              <div className="text-[10px] text-emerald-200 flex items-center justify-center gap-1 shrink-0 whitespace-nowrap">
                <Wind className="w-3.5 h-3.5 shrink-0" />
                <span>Angin</span>
              </div>
              <div className="text-xs font-bold mt-1 whitespace-nowrap">
                {weather ? weather.current.windSpeed : '--'}
                <span className="text-[9px] font-normal text-emerald-200 ml-0.5">km/h</span>
              </div>
            </div>

            {/* Arah Angin */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2 flex flex-col items-center justify-between h-full">
              <div className="text-[10px] text-emerald-200 flex items-center justify-center gap-1 shrink-0 whitespace-nowrap">
                <Compass className="w-3.5 h-3.5 shrink-0" />
                <span>Arah</span>
              </div>
              <div className="text-xs font-bold mt-1 whitespace-nowrap">
                {weather ? weather.current.windDirection : '--'}
                <span className="text-[9px] font-normal text-emerald-200 ml-0.5">°</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('forecast')}
          className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${activeTab === 'forecast'
            ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
            : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Prakiraan Cuaca</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all ${activeTab === 'profile'
            ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
            : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>Profil Kebun</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

        {/* TAB 2: WEATHER FORECAST (HOURLY & DAILY) */}
        {activeTab === 'forecast' && (
          <div className="space-y-4">
            {/* 24-Hour Forecast */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Prakiraan Tiap Jam (24 Jam ke Depan)</span>
                </h4>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {weather?.hourly && weather.hourly.length > 0 ? (
                  weather.hourly.slice(0, 16).map((h, i) => (
                    <div
                      key={i}
                      className="min-w-[64px] p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center shrink-0"
                    >
                      <div className="text-[10px] text-zinc-500 font-medium">{h.time}</div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-white my-1">
                        {h.temperature}°
                      </div>
                      <div className="text-[10px] text-blue-500 font-semibold">
                        {h.precipitation > 0 ? `${h.precipitation}mm` : `${h.precipitationProbability}%`}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-zinc-400 py-4">Memuat data prakiraan...</div>
                )}
              </div>
            </div>

            {/* 7-Day Forecast */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Prakiraan Mingguan (7 Hari)</span>
                </h4>
                <span className="text-[10px] text-zinc-400 font-medium">Suhu & Cuaca</span>
              </div>

              <div className="space-y-1.5">
                {weather?.daily && weather.daily.length > 0 ? (
                  weather.daily.map((d, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${i === 0
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-500/40 shadow-xs'
                          : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200/70 dark:border-zinc-700/50 hover:border-zinc-300 dark:hover:border-zinc-600'
                        }`}
                    >
                      {/* Hari & Tanggal */}
                      <div className="w-[58px] shrink-0">
                        <div
                          className={`text-xs leading-tight ${i === 0
                              ? 'font-bold text-emerald-700 dark:text-emerald-400'
                              : 'font-semibold text-zinc-800 dark:text-zinc-200'
                            }`}
                        >
                          {d.dayName}
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          {new Date(d.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                      </div>

                      {/* Gambar / Ikon Cuaca Visual (Matahari, Awan, Hujan, dll) */}
                      {renderForecastConditionIcon(d.weatherCode)}

                      {/* Keterangan Kondisi & Curah Hujan */}
                      <div className="flex-1 min-w-0 pr-1">
                        <div
                          className="text-[11px] font-medium text-zinc-800 dark:text-zinc-200 truncate"
                          title={d.conditionLabel}
                        >
                          {d.conditionLabel}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {d.precipitationSum > 0 ? (
                            <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-0.5">
                              <Droplets className="w-2.5 h-2.5" />
                              {d.precipitationSum} mm
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-400">
                              0 mm
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Rentang Suhu Maks / Min */}
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-zinc-900 dark:text-white">
                          {d.tempMax}°
                        </div>
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium">
                          {d.tempMin}°
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-zinc-400 py-4">Memuat data mingguan...</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ESTATE PROFILE & AGRONOMY SPECS */}
        {activeTab === 'profile' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                <span>Deskripsi Operasional Lapangan</span>
              </h4>
              <p className="text-xs text-justify text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {plantation.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="text-[10px] text-zinc-400 flex items-center gap-1 mb-0.5">
                  <LandPlot className="w-3 h-3 text-emerald-600" /> Luas Areal
                </div>
                <div className="font-bold text-zinc-900 dark:text-white">
                  {plantation.areaHectares.toLocaleString('id-ID')} Hektar
                </div>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="text-[10px] text-zinc-400 flex items-center gap-1 mb-0.5">
                  <Layers className="w-3 h-3 text-emerald-600" /> Jenis Tanah
                </div>
                <div className="font-bold text-zinc-900 dark:text-white">
                  {plantation.soilType}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="text-[10px] text-zinc-400 flex items-center gap-1 mb-0.5">
                  <Sprout className="w-3 h-3 text-emerald-600" /> Varietas Bibit
                </div>
                <div className="font-bold text-zinc-900 dark:text-white">
                  {plantation.palmVariety}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                <div className="text-[10px] text-zinc-400 flex items-center gap-1 mb-0.5">
                  <Calendar className="w-3 h-3 text-emerald-600" /> Tahun Tanam / Umur
                </div>
                <div className="font-bold text-zinc-900 dark:text-white">
                  {plantation.plantingYear} ({plantation.averageAgeYears} Thn)
                </div>
              </div>

              <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 col-span-2">
                <div className="text-[10px] text-zinc-400 flex items-center gap-1 mb-0.5">
                  <Truck className="w-3 h-3 text-emerald-600" /> Estimasi Produksi TBS
                </div>
                <div className="font-bold text-zinc-900 dark:text-white">
                  ~{plantation.estTbsMonthlyTons.toLocaleString('id-ID')} Ton / Bulan
                </div>
              </div>
            </div>

            {/* Manager Contact Card */}
            <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                    Estate Manager Lapangan
                  </div>
                  <div className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {plantation.manager}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{plantation.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
