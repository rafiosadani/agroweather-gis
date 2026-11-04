export type WeatherCategory = 'clear' | 'cloudy' | 'rain' | 'storm' | 'fog';

export type AdvisoryStatus = 'optimal' | 'caution' | 'warning';

export interface WeatherConditionInfo {
  label: string;
  description: string;
  category: WeatherCategory;
  iconName: string;
  badgeBg: string;
  badgeText: string;
  borderClass: string;
}

export interface OperationalAdvisoryItem {
  key: 'spraying' | 'fertilizing' | 'harvesting' | 'fireRisk' | 'drainage';
  title: string;
  status: AdvisoryStatus;
  statusText: string;
  headline: string;
  recommendation: string;
  iconName: string;
}

export interface CurrentWeather {
  time: string;
  temperature: number; // °C
  humidity: number; // %
  apparentTemperature: number; // °C
  precipitation: number; // mm
  rain: number; // mm
  weatherCode: number;
  windSpeed: number; // km/h
  windDirection: number; // derajat
}

export interface HourlyForecastItem {
  time: string;
  temperature: number;
  precipitation: number;
  precipitationProbability: number;
}

export interface DailyForecastItem {
  date: string;
  dayName: string;
  weatherCode: number;
  conditionLabel: string;
  tempMax: number;
  tempMin: number;
  precipitationSum: number;
}

export interface WeatherData {
  plantationId: string;
  fetchedAt: string;
  current: CurrentWeather;
  condition: WeatherConditionInfo;
  advisories: OperationalAdvisoryItem[];
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}
