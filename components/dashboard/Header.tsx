'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Trees,
  RefreshCw,
  Clock,
  ShieldCheck,
  CloudRain,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { Plantation } from '@/types/plantation';
import { WeatherData } from '@/types/weather';

interface HeaderProps {
  plantations: Plantation[];
  weatherMap: Record<string, WeatherData>;
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdated: string;
}

const TOTAL_COUNTDOWN_SECONDS = 120; // 2 menit = 120 detik

export default function Header({
  plantations,
  weatherMap,
  isRefreshing,
  onRefresh,
  lastUpdated,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL_COUNTDOWN_SECONDS);
  const [logoError, setLogoError] = useState<boolean>(false);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  // Real-time Clock (WIB)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      });
      setCurrentTime(timeStr);
    };

    updateClock();
    const clockTimer = setInterval(updateClock, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // 2-Minute Circular Countdown Auto-Refresh Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // Schedule onRefresh on next tick outside of React render phase
          setTimeout(() => {
            if (onRefreshRef.current) {
              onRefreshRef.current();
            }
          }, 0);
          return TOTAL_COUNTDOWN_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Manual trigger resets countdown
  const handleManualRefresh = () => {
    setSecondsLeft(TOTAL_COUNTDOWN_SECONDS);
    onRefresh();
  };

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // SVG circular math
  const circleRadius = 14;
  const circumference = 2 * Math.PI * circleRadius; // ~87.96
  // Progress goes from full (1.0) to empty (0.0)
  const progressRatio = Math.max(0, Math.min(1, secondsLeft / TOTAL_COUNTDOWN_SECONDS));
  const strokeDashoffset = circumference * (1 - progressRatio);

  // Compute metrics
  const totalHectares = plantations.reduce((sum, p) => sum + p.areaHectares, 0);
  const sumatraCount = plantations.filter((p) => p.region === 'Sumatra').length;
  const kalimantanCount = plantations.filter((p) => p.region === 'Kalimantan').length;

  const rainCount = Object.values(weatherMap).filter(
    (w) => w.current.precipitation > 0.5
  ).length;

  return (
    <header className="w-full bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Logo PT Agrofarm Nusa Raya */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {!logoError ? (
              /* Logo Agrofarm Resmi (Ukuran asli: 2560 x 433, aspek rasio ~5.9:1) */
              <img
                src="/logo/logo-urp-anr.png"
                alt="Logo PT Agrofarm Nusa Raya"
                className="h-9 sm:h-11 w-auto max-w-[260px] sm:max-w-[320px] object-contain transition-transform hover:scale-[1.02]"
                onError={() => setLogoError(true)}
              />
            ) : (
              /* Fallback Elegan Otomatis jika file gambar tidak ditemukan */
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white shrink-0">
                  <Trees className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                      PT Agrofarm Nusa Raya
                    </h1>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    AgroWeather GIS &bull; Sistem Pemantauan Cuaca & Presisi Sawit
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="hidden lg:block h-6 w-px bg-zinc-200 dark:bg-zinc-800"></div>

          <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            AgroWeather GIS
          </span>
        </div>

        {/* Action, Clock & Circular 5-Minute Auto-Refresh Widget */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Real-time Clock Widget */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60 text-xs text-zinc-700 dark:text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-mono font-medium">{currentTime || 'Memuat...'}</span>
          </div>

          {/* CIRCULAR AUTO-REFRESH PROGRESS TIMER (5 MENIT OTOMATIS) */}
          <div
            onClick={handleManualRefresh}
            role="button"
            tabIndex={0}
            title="Auto-refresh otomatis setiap 5 menit. Klik untuk refresh sekarang."
            className="group flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-950 text-white border border-zinc-700 dark:border-zinc-800 shadow-md hover:border-orange-500/60 transition-all cursor-pointer select-none"
          >
            {/* SVG Circular Progress Ring */}
            <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
              <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 36 36">
                {/* Background Track */}
                <circle
                  cx="18"
                  cy="18"
                  r={circleRadius}
                  className="stroke-zinc-700 dark:stroke-zinc-800"
                  strokeWidth="3.5"
                  fill="none"
                />
                {/* Dynamic Countdown Circular Progress */}
                <circle
                  cx="18"
                  cy="18"
                  r={circleRadius}
                  stroke="#f97316" /* Orange vibrant accent */
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>

              {/* Refresh icon inside circle */}
              <div className="absolute inset-0 flex items-center justify-center text-orange-400 group-hover:text-orange-300 transition-colors">
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-400' : 'group-hover:rotate-45 transition-transform duration-300'
                    }`}
                />
              </div>
            </div>

            {/* Timer countdown text & label */}
            <div className="flex flex-col text-left">
              <span className="font-mono font-bold text-xs text-orange-400 group-hover:text-orange-300">
                {formatTime(secondsLeft)}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">
                {isRefreshing ? 'Sinkronisasi...' : 'Auto-Sync'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Strip */}
      <div className="bg-zinc-50/80 dark:bg-zinc-950/60 border-t border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="font-semibold text-zinc-900 dark:text-white">{plantations.length}</span> Kebun (
              <span className="text-zinc-500">{sumatraCount} Sumatra, {kalimantanCount} Kal.</span>)
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <TrendingUp className="w-4 h-4 text-teal-600 shrink-0" />
            <div>
              Total Area: <span className="font-semibold text-zinc-900 dark:text-white">{totalHectares.toLocaleString('id-ID')}</span> Ha
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <CloudRain className={`w-4 h-4 ${rainCount > 0 ? 'text-blue-500 animate-pulse' : 'text-zinc-400'} shrink-0`} />
            <div>
              Hujan Aktif: <span className={`font-semibold ${rainCount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-900 dark:text-white'}`}>{rainCount}</span> Kebun
            </div>
          </div>

          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 justify-self-start sm:justify-self-end">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-[11px] text-zinc-500">
              Update Terakhir: <span className="font-mono text-zinc-700 dark:text-zinc-300 font-medium">{lastUpdated || 'Menghubungkan...'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
