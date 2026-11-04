import { Plantation, SoilType } from '@/types/plantation';
import {
  WeatherData,
  CurrentWeather,
  WeatherConditionInfo,
  OperationalAdvisoryItem,
  HourlyForecastItem,
  DailyForecastItem,
} from '@/types/weather';

// In-memory cache with 10-minute TTL
const weatherCache = new Map<string, { timestamp: number; data: WeatherData }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Mapping WMO Weather Code to Indonesian labels, categories, and visual styling
 */
export function getWmoCondition(code: number): WeatherConditionInfo {
  switch (code) {
    case 0:
      return {
        label: 'Cerah Terang',
        description: 'Langit cerah tanpa awan signifikan, radiasi matahari maksimal',
        category: 'clear',
        iconName: 'Sun',
        badgeBg: 'bg-amber-500/15',
        badgeText: 'text-amber-500',
        borderClass: 'border-amber-500/30',
      };
    case 1:
      return {
        label: 'Sebagian Besar Cerah',
        description: 'Sedikit tutupan awan tipis, kondisi sangat cerah',
        category: 'clear',
        iconName: 'SunDim',
        badgeBg: 'bg-amber-500/15',
        badgeText: 'text-amber-600 dark:text-amber-400',
        borderClass: 'border-amber-500/30',
      };
    case 2:
      return {
        label: 'Cerah Berawan',
        description: 'Kombinasi sinar matahari dan awan kumulus ringan',
        category: 'cloudy',
        iconName: 'CloudSun',
        badgeBg: 'bg-sky-500/15',
        badgeText: 'text-sky-600 dark:text-sky-400',
        borderClass: 'border-sky-500/30',
      };
    case 3:
      return {
        label: 'Mendung Berawan Tebal',
        description: 'Tutupan awan tebal merata, potensi gerimis lokal',
        category: 'cloudy',
        iconName: 'Cloud',
        badgeBg: 'bg-slate-500/15',
        badgeText: 'text-slate-600 dark:text-slate-400',
        borderClass: 'border-slate-500/30',
      };
    case 45:
    case 48:
      return {
        label: 'Berkabut / Haze',
        description: 'Jarak pandang terbatas karena kabut uap air atau asap',
        category: 'fog',
        iconName: 'CloudFog',
        badgeBg: 'bg-stone-500/15',
        badgeText: 'text-stone-600 dark:text-stone-400',
        borderClass: 'border-stone-500/30',
      };
    case 51:
    case 53:
    case 55:
      return {
        label: 'Gerimis Ringan',
        description: 'Presipitasi rintik halus dengan intensitas rendah',
        category: 'rain',
        iconName: 'CloudDrizzle',
        badgeBg: 'bg-blue-500/15',
        badgeText: 'text-blue-600 dark:text-blue-400',
        borderClass: 'border-blue-500/30',
      };
    case 61:
      return {
        label: 'Hujan Ringan',
        description: 'Hujan teratur dengan intensitas < 2.5 mm/jam',
        category: 'rain',
        iconName: 'CloudRain',
        badgeBg: 'bg-blue-500/15',
        badgeText: 'text-blue-600 dark:text-blue-400',
        borderClass: 'border-blue-500/30',
      };
    case 63:
      return {
        label: 'Hujan Sedang',
        description: 'Hujan konsisten dengan akumulasi sedang',
        category: 'rain',
        iconName: 'CloudRain',
        badgeBg: 'bg-blue-600/20',
        badgeText: 'text-blue-700 dark:text-blue-300',
        borderClass: 'border-blue-600/40',
      };
    case 65:
    case 82:
      return {
        label: 'Hujan Lebat / Deras',
        description: 'Curah hujan deras berintensitas tinggi, waspada genangan air',
        category: 'rain',
        iconName: 'CloudRain',
        badgeBg: 'bg-indigo-600/20',
        badgeText: 'text-indigo-700 dark:text-indigo-300',
        borderClass: 'border-indigo-600/40',
      };
    case 80:
    case 81:
      return {
        label: 'Hujan Curah Lokal',
        description: 'Hujan lokal sesaat dengan kemungkinan jeda cerah',
        category: 'rain',
        iconName: 'CloudSunRain',
        badgeBg: 'bg-blue-500/15',
        badgeText: 'text-blue-600 dark:text-blue-400',
        borderClass: 'border-blue-500/30',
      };
    case 95:
    case 96:
    case 99:
      return {
        label: 'Badai Petir Tropis',
        description: 'Aktivitas konvektif kuat dengan petir dan angin kencang',
        category: 'storm',
        iconName: 'CloudLightning',
        badgeBg: 'bg-rose-500/15',
        badgeText: 'text-rose-600 dark:text-rose-400',
        borderClass: 'border-rose-500/30',
      };
    default:
      return {
        label: 'Berawan',
        description: 'Kondisi cuaca berawan normal',
        category: 'cloudy',
        iconName: 'Cloud',
        badgeBg: 'bg-slate-500/15',
        badgeText: 'text-slate-600 dark:text-slate-400',
        borderClass: 'border-slate-500/30',
      };
  }
}

/**
 * Generate Palm Oil Agronomic Operational Advisory (DSS)
 */
export function generateOperationalAdvisories(
  current: CurrentWeather,
  soilType: SoilType
): OperationalAdvisoryItem[] {
  const advisories: OperationalAdvisoryItem[] = [];

  // 1. Penyemprotan Herbisida / Gulma
  if (current.precipitation > 0.5 || current.weatherCode >= 61) {
    advisories.push({
      key: 'spraying',
      title: 'Penyemprotan Herbisida / Gulma',
      status: 'warning',
      statusText: 'Tunda Penyemprotan',
      headline: 'Tercuci Hujan (Wash-off Risk)',
      recommendation:
        'Hujan saat ini akan mencuci bahan aktif pestisida/herbisida dari daun gulma. Tunda hingga minimal 2 jam setelah hujan berhenti.',
      iconName: 'SprayCan',
    });
  } else if (current.windSpeed > 13) {
    advisories.push({
      key: 'spraying',
      title: 'Penyemprotan Herbisida / Gulma',
      status: 'caution',
      statusText: 'Waspada Kecepatan Angin',
      headline: 'Risiko Drift Partikel Semprot',
      recommendation: `Kecepatan angin tercatat ${current.windSpeed} km/h (ambang ideal < 10 km/h). Gunakan nozzle bertekanan rendah atau tunda ke sore hari.`,
      iconName: 'Wind',
    });
  } else if (current.temperature > 33) {
    advisories.push({
      key: 'spraying',
      title: 'Penyemprotan Herbisida / Gulma',
      status: 'caution',
      statusText: 'Suhu Tinggi Terik',
      headline: 'Tingkat Evaporasi Tinggi',
      recommendation:
        'Suhu udara mencapai > 33°C. Droplet mudah menguap sebelum diserap stomata gulma. Rekomendasi aplikasi sebelum 09:30 WIB atau sesudah 15:30 WIB.',
      iconName: 'ThermometerSun',
    });
  } else {
    advisories.push({
      key: 'spraying',
      title: 'Penyemprotan Herbisida / Gulma',
      status: 'optimal',
      statusText: 'Sangat Optimal',
      headline: 'Aplikasi Efektif & Aman',
      recommendation:
        'Angin tenang (< 10 km/h) dan cuaca tanpa hujan. Waktu ideal untuk piringan sawit, pasar pikul, dan pengendalian hama ulat api.',
      iconName: 'CheckCircle2',
    });
  }

  // 2. Pemupukan Tanaman Sawit (NPK / Urea / Borat)
  if (current.precipitation > 12) {
    advisories.push({
      key: 'fertilizing',
      title: 'Aplikasi Pemupukan Tanah (NPK/Urea)',
      status: 'warning',
      statusText: 'Tunda Pemupukan',
      headline: 'Bahaya Aliran Permukaan (Run-off)',
      recommendation:
        'Curah hujan tinggi berisiko melarutkan dan menghanyutkan butiran pupuk ke parit drainase/rorak sebelum terserap akar.',
      iconName: 'AlertTriangle',
    });
  } else if (current.precipitation >= 1.5 && current.precipitation <= 10) {
    advisories.push({
      key: 'fertilizing',
      title: 'Aplikasi Pemupukan Tanah (NPK/Urea)',
      status: 'optimal',
      statusText: 'Kondisi Paling Prima',
      headline: 'Kadar Lengas Tanah Sangat Ideal',
      recommendation:
        'Kelembapan tanah optimal untuk melarutkan granul pupuk perlahan tanpa menyebabkan pencucian berlebih (leaching).',
      iconName: 'Sprout',
    });
  } else if (current.humidity < 55 && current.precipitation === 0) {
    advisories.push({
      key: 'fertilizing',
      title: 'Aplikasi Pemupukan Tanah (NPK/Urea)',
      status: 'caution',
      statusText: 'Perhatikan Lengas Tanah',
      headline: 'Tanah Kering / Penguapan Nitrogen',
      recommendation:
        'Hindari penaburan urea di permukaan tanah kering karena risiko volatilisasi amonia tinggi. Sebaiknya pupuk dibenamkan atau tunggu kelembapan naik.',
      iconName: 'Droplets',
    });
  } else {
    advisories.push({
      key: 'fertilizing',
      title: 'Aplikasi Pemupukan Tanah (NPK/Urea)',
      status: 'optimal',
      statusText: 'Aman untuk Aplikasi',
      headline: 'Kondisi Lapangan Kondusif',
      recommendation:
        'Cocok untuk melanjutkan jadwal rotasi pupuk NPK majemuk, dolomit, maupun aplikasi kiserit.',
      iconName: 'CheckCircle2',
    });
  }

  // 3. Panen & Angkut TBS (Tandan Buah Segar)
  if (current.precipitation > 15) {
    advisories.push({
      key: 'harvesting',
      title: 'Pemanenan & Angkutan TBS ke PKS',
      status: 'warning',
      statusText: 'Jalur Angkut Berisiko',
      headline: 'Jalan Poros / Koleksi Licin & Amblas',
      recommendation:
        'Hujan lebat membuat jalan tanah berlumpur. Prioritaskan evakuasi TBS dari TPH terdekat dengan traktor gandeng berantai.',
      iconName: 'Truck',
    });
  } else if (current.precipitation > 2) {
    advisories.push({
      key: 'harvesting',
      title: 'Pemanenan & Angkutan TBS ke PKS',
      status: 'caution',
      statusText: 'Operasional Ekstra Hati-hati',
      headline: 'Tingkatkan Kesiapan Armada',
      recommendation:
        'Kondisi licin di jalur panen. Pastikan muatan truk TBS tidak melebihi kapasitas agar tidak merusak badan jalan kebun.',
      iconName: 'AlertCircle',
    });
  } else {
    advisories.push({
      key: 'harvesting',
      title: 'Pemanenan & Angkutan TBS ke PKS',
      status: 'optimal',
      statusText: 'Logistik Lancar',
      headline: 'Pengangkutan TBS Cepat & Segar',
      recommendation:
        'Akses jalan produksi kering. Pengiriman TBS dari TPH menuju loading ramp PKS dapat dicapai di bawah target 24 jam untuk menjaga FFA tetap rendah.',
      iconName: 'CheckCircle2',
    });
  }

  // 4. Mitigasi Karhutla & Tata Kelola Air (Water Management)
  if (soilType === 'Lahan Gambut') {
    if (current.temperature >= 32 && current.humidity <= 60 && current.precipitation === 0) {
      advisories.push({
        key: 'fireRisk',
        title: 'Mitigasi Karhutla Lahan Gambut',
        status: 'warning',
        statusText: 'Siaga Karhutla',
        headline: 'Risiko Titik Panas Meningkat',
        recommendation:
          'Lahan gambut kering rentan menyulut api bawah permukaan. Tutup pintu sekat kanal (canal blocking), tingkatkan ronda tim Damkar kebun.',
        iconName: 'Flame',
      });
    } else {
      advisories.push({
        key: 'drainage',
        title: 'Tata Kelola Air Kanal Gambut',
        status: 'optimal',
        statusText: 'Level Muka Air Stabil',
        headline: 'Water Level Terkontrol Baik',
        recommendation:
          'Kelembapan gambut terjaga pada ambang aman regulasi (-40 s.d -50 cm). Lanjutkan pemantauan tongkat peilschaal dan piezometer rutin.',
        iconName: 'Waves',
      });
    }
  } else {
    if (current.temperature >= 34 && current.precipitation === 0) {
      advisories.push({
        key: 'fireRisk',
        title: 'Kondisi Mikroklimat Perkebunan',
        status: 'caution',
        statusText: 'Defisit Air Harian',
        headline: 'Suhu Udara Panas Ekstrem',
        recommendation:
          'Laju evapotranspirasi tinggi. Pastikan rorak penampung air berfungsi dan hindari pembakaran sampah organik apapun di perumahan karyawan.',
        iconName: 'SunAlert',
      });
    } else {
      advisories.push({
        key: 'drainage',
        title: 'Kondisi Mikroklimat Perkebunan',
        status: 'optimal',
        statusText: 'Kondisi Normal',
        headline: 'Mikroklimat Kebun Sehat',
        recommendation:
          'Suhu dan kelembapan ideal untuk fotosintesis dan aktivitas serangga penyerbuk sawit (Elaeidobius kamerunicus).',
        iconName: 'Sprout',
      });
    }
  }

  return advisories;
}

const INDONESIAN_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

/**
 * Fetch dynamic real-time weather from Open-Meteo API
 */
export async function fetchPlantationWeather(plantation: Plantation): Promise<WeatherData> {
  const cacheKey = plantation.id;
  const cached = weatherCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${plantation.latitude}&longitude=${plantation.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FJakarta`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 600 }, // 10 minutes cache
    });

    if (!res.ok) {
      console.warn(`Open-Meteo API status ${res.status} untuk ${plantation.name}. Menggunakan data cache/fallback.`);
      if (cached) return cached.data;
      return getFallbackWeather(plantation);
    }

    const data = await res.json();

    const current: CurrentWeather = {
      time: data.current?.time || new Date().toISOString(),
      temperature: Math.round((data.current?.temperature_2m ?? 30) * 10) / 10,
      humidity: Math.round(data.current?.relative_humidity_2m ?? 75),
      apparentTemperature: Math.round((data.current?.apparent_temperature ?? 34) * 10) / 10,
      precipitation: data.current?.precipitation ?? 0,
      rain: data.current?.rain ?? 0,
      weatherCode: data.current?.weather_code ?? 1,
      windSpeed: Math.round((data.current?.wind_speed_10m ?? 8) * 10) / 10,
      windDirection: Math.round(data.current?.wind_direction_10m ?? 180),
    };

    const condition = getWmoCondition(current.weatherCode);
    const advisories = generateOperationalAdvisories(current, plantation.soilType);

    // Parse Hourly (next 24 hours)
    const hourly: HourlyForecastItem[] = [];
    const hourlyTimes = data.hourly?.time || [];
    const hourlyTemps = data.hourly?.temperature_2m || [];
    const hourlyPrecip = data.hourly?.precipitation || [];
    const hourlyProb = data.hourly?.precipitation_probability || [];

    // Find index of current hour or start from first
    const nowHourStr = new Date().toISOString().substring(0, 13);
    let startIndex = hourlyTimes.findIndex((t: string) => t.startsWith(nowHourStr));
    if (startIndex === -1) startIndex = 0;

    for (let i = startIndex; i < Math.min(startIndex + 24, hourlyTimes.length); i++) {
      const timeStr = hourlyTimes[i];
      const hourPart = timeStr.includes('T') ? timeStr.split('T')[1].substring(0, 5) : timeStr;
      hourly.push({
        time: hourPart,
        temperature: Math.round(hourlyTemps[i] ?? 28),
        precipitation: Math.round((hourlyPrecip[i] ?? 0) * 10) / 10,
        precipitationProbability: Math.round(hourlyProb[i] ?? 0),
      });
    }

    // Parse Daily (next 7 days)
    const daily: DailyForecastItem[] = [];
    const dailyDates = data.daily?.time || [];
    const dailyCodes = data.daily?.weather_code || [];
    const dailyMax = data.daily?.temperature_2m_max || [];
    const dailyMin = data.daily?.temperature_2m_min || [];
    const dailyPrecip = data.daily?.precipitation_sum || [];

    for (let i = 0; i < Math.min(7, dailyDates.length); i++) {
      const d = new Date(dailyDates[i]);
      const dayName = i === 0 ? 'Hari Ini' : INDONESIAN_DAYS[d.getDay()];
      // Sinkronkan hari ini (index 0) dengan kondisi real-time agar konsisten dengan card & header
      const code = (i === 0 && current.weatherCode !== undefined) ? current.weatherCode : (dailyCodes[i] ?? 1);
      const wmoInfo = getWmoCondition(code);

      daily.push({
        date: dailyDates[i],
        dayName,
        weatherCode: code,
        conditionLabel: wmoInfo.label,
        tempMax: Math.round(dailyMax[i] ?? 32),
        tempMin: Math.round(dailyMin[i] ?? 24),
        precipitationSum: Math.round((dailyPrecip[i] ?? 0) * 10) / 10,
      });
    }

    const result: WeatherData = {
      plantationId: plantation.id,
      fetchedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      current,
      condition,
      advisories,
      hourly,
      daily,
    };

    weatherCache.set(cacheKey, { timestamp: now, data: result });
    return result;
  } catch (error) {
    console.error(`Failed to fetch weather for ${plantation.name}:`, error);
    // Return fallback realistic tropical weather so UI never breaks
    return getFallbackWeather(plantation);
  }
}

/**
 * Fallback generator in case of network unavailability
 */
function getFallbackWeather(plantation: Plantation): WeatherData {
  const isGambut = plantation.soilType === 'Lahan Gambut';
  const current: CurrentWeather = {
    time: new Date().toISOString(),
    temperature: isGambut ? 31.2 : 29.8,
    humidity: isGambut ? 72 : 78,
    apparentTemperature: 34.5,
    precipitation: 0.2,
    rain: 0.2,
    weatherCode: 2,
    windSpeed: 7.5,
    windDirection: 140,
  };

  return {
    plantationId: plantation.id,
    fetchedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    current,
    condition: getWmoCondition(current.weatherCode),
    advisories: generateOperationalAdvisories(current, plantation.soilType),
    hourly: Array.from({ length: 12 }, (_, i) => ({
      time: `${String((new Date().getHours() + i) % 24).padStart(2, '0')}:00`,
      temperature: 28 + Math.round(Math.sin(i / 2) * 4),
      precipitation: i === 4 || i === 5 ? 1.4 : 0,
      precipitationProbability: i === 4 || i === 5 ? 65 : 20,
    })),
    daily: Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const fallbackCode = i === 0 ? current.weatherCode : (i % 2 === 0 ? 2 : 61);
      const wmoInfo = getWmoCondition(fallbackCode);
      return {
        date: d.toISOString().split('T')[0],
        dayName: i === 0 ? 'Hari Ini' : INDONESIAN_DAYS[d.getDay()],
        weatherCode: fallbackCode,
        conditionLabel: wmoInfo.label,
        tempMax: 32 - (i % 2),
        tempMin: 23 + (i % 2),
        precipitationSum: i % 2 === 0 ? 1.2 : 8.5,
      };
    }),
  };
}
