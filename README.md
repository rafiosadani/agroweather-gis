# AgroWeather GIS

AgroWeather GIS adalah platform dashboard Sistem Informasi Geografis (GIS) dan telemetri agrometeorologi real-time untuk pemantauan operasional perkebunan kelapa sawit. Platform ini menggabungkan visualisasi spasial batas konsesi perkebunan dengan integrasi data cuaca numerik presisi tinggi dari Open-Meteo API.

---

## Fitur Utama

- **Peta GIS Interaktif Multi-Layer**
  - Dukungan beragam basemap: OpenStreetMap (Vektor), ESRI World Imagery (Satelit), dan OpenTopoMap (Topografi).
  - Penanda koordinat presisi tunggal dengan label temperatur live.
  - Visualisasi poligon batas konsesi lahan perkebunan dengan diferensiasi jenis tanah mineral dan lahan gambut.
  - Telemetri koordinat kursor live pada kanvas peta.
  - Kontrol visibilitas layer zona batas konsesi dan legenda GIS terpadu.

- **Telemetri Agrometeorologi Real-Time**
  - Pemantauan parameter cuaca instan: suhu aktual, suhu terasa, kelembapan udara, curah hujan, kecepatan angin, dan arah angin.
  - Prakiraan cuaca per jam untuk 24 jam ke depan.
  - Prakiraan cuaca mingguan 7 hari dengan indikator visual kondisi cuaca.
  - Sinkronisasi data real-time pada seluruh kartu ringkasan, popup peta, dan panel analisis.

- **Navigasi Geospasial Dinamis**
  - Mode Overview Makro: Tampilan awal yang mencakup seluruh sebaran perkebunan.
  - Transisi Kamera FlyTo: Animasi perpindahan fokus kamera langsung menuju titik koordinat kebun terpilih.
  - Reset View: Pengembalian tampilan ke skala makro secara instan.

- **Pencarian dan Filter Reaktif**
  - Filter regional dinamis dengan penghitungan data otomatis secara real-time.
  - Pencarian cepat berdasarkan nama kebun, wilayah administratif, atau divisi operasional.
  - Pengurutan data berdasarkan nama, intensitas hujan, suhu, dan luas lahan.

- **Antarmuka Responsif**
  - Tata letak adaptif untuk perangkat desktop, tablet, dan smartphone.
  - Navigasi tab mobile khusus untuk memudahkan akses antara peta, daftar kebun, dan panel analisis.
  - Panel samping yang dapat disembunyikan untuk memberikan area pandang peta yang optimal.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Library UI**: React 19
- **Bahasa Pemrograman**: TypeScript
- **Styling**: Tailwind CSS v4
- **Engine Peta**: Leaflet.js & React-Leaflet
- **Ikonografi**: Lucide React
- **Penyedia Data Cuaca**: Open-Meteo API

---

## Kebutuhan Sistem (Prerequisites)

Pastikan lingkungan pengembangan Anda telah memenuhi spesifikasi berikut:

- **Node.js**: Versi 18.18.0 atau versi yang lebih baru (disarankan Node.js 20 LTS atau Node.js 22 LTS).
- **Package Manager**: npm, yarn, pnpm, atau bun.
- **Koneksi Internet**: Diperlukan untuk proses instalasi dependensi, pemuatan tile peta, dan sinkronisasi data cuaca.

Verifikasi instalasi Node.js dan package manager melalui terminal:
```bash
node -v
npm -v
```

---

## Panduan Instalasi dan Menjalankan Proyek

### 1. Kloning Repository
```bash
git clone <URL_REPOSITORY_ANDA>
cd agroweather-gis
```

### 2. Instalasi Dependensi
Jalankan salah satu perintah berikut:
```bash
npm install
```
Atau menggunakan package manager lain:
```bash
pnpm install
# atau
yarn install
```

### 3. Menjalankan Server Pengembangan
```bash
npm run dev
```

Buka peramban web dan akses:
```
http://localhost:3000
```

### 4. Build untuk Lingkungan Produksi
Untuk mengompilasi aplikasi ke mode produksi:
```bash
npm run build
npm run start
```

---

## Struktur Direktori Proyek

```text
agroweather-gis/
├── app/
│   ├── globals.css         # Konfigurasi Tailwind CSS dan styling Leaflet
│   ├── layout.tsx          # Root layout aplikasi dan metadata
│   └── page.tsx            # Halaman utama dan state orchestrator
├── components/
│   ├── dashboard/
│   │   ├── EstateDetailPanel.tsx  # Panel detail telemetri cuaca dan profil kebun
│   │   ├── Header.tsx             # Navigasi atas dan status sinkronisasi waktu
│   │   ├── PlantationCard.tsx     # Kartu ringkasan data kebun
│   │   └── Sidebar.tsx            # Sidebar daftar kebun, pencarian, dan filter
│   └── map/
│       ├── EstateMap.tsx          # Wrapper komponen peta (SSR: false)
│       └── EstateMapInner.tsx     # Implementasi layer Leaflet, marker, dan poligon
├── data/
│   └── plantations.ts      # Dataset kebun dan kalkulasi poligon konsesi
├── public/
│   └── logo/
│       └── logo-urp-anr.png # Asset logo aplikasi
├── services/
│   └── weatherService.ts   # Integrasi Open-Meteo API, parsing WMO, dan caching
├── types/
│   ├── plantation.ts       # Definisi tipe data kebun dan konsesi
│   └── weather.ts          # Definisi tipe data telemetri cuaca
├── package.json
├── tsconfig.json
└── README.md
```

---

## Lisensi dan Hak Cipta

Seluruh hak cipta dilindungi. Penggunaan dan distribusi kode ini diatur sesuai dengan kebijakan proyek yang bersangkutan.
