'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Plantation } from '@/types/plantation';
import { WeatherData } from '@/types/weather';
import { Loader2, MapPin } from 'lucide-react';

interface EstateMapProps {
  plantations: Plantation[];
  weatherMap: Record<string, WeatherData>;
  selectedPlantation: Plantation | null;
  onSelectPlantation: (plantation: Plantation) => void;
  onResetSelection?: () => void;
  focusTrigger?: number;
}

const DynamicEstateMapInner = dynamic(
  () => import('@/components/map/EstateMapInner'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[420px] rounded-2xl flex flex-col items-center justify-center bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
        <div className="relative mb-3">
          <MapPin className="w-10 h-10 text-emerald-600 animate-bounce" />
          <Loader2 className="w-5 h-5 text-zinc-400 animate-spin absolute -bottom-1 -right-1" />
        </div>
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Memuat Peta Interaktif GIS Sawit...
        </p>
        <p className="text-xs text-zinc-400">Sumatra & Kalimantan</p>
      </div>
    ),
  }
);

export default function EstateMap(props: EstateMapProps) {
  return <DynamicEstateMapInner {...props} />;
}
