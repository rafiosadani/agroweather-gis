export type Region = 'Sumatra' | 'Kalimantan';

export type SoilType = 'Tanah Mineral' | 'Lahan Gambut';

export interface Plantation {
  id: string;
  name: string;
  companyDivision: string;
  region: Region;
  province: string;
  regency: string; // Kabupaten
  latitude: number;
  longitude: number;
  areaHectares: number;
  palmVariety: string;
  soilType: SoilType;
  plantingYear: number;
  averageAgeYears: number;
  manager: string;
  phone: string;
  description: string;
  estTbsMonthlyTons: number; // Estimasi produksi TBS bulanan
  boundaryCoordinates?: [number, number][]; // Koordinat poligon batas zona konsesi kebun
}

export interface PlantationFilter {
  region: 'Semua' | Region;
  searchQuery: string;
  sortBy: 'name' | 'rain' | 'temperature' | 'area';
}
