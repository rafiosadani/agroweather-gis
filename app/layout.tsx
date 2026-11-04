import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AgroWeather GIS - PT Agrofarm Nusa Raya",
  description:
    "Sistem Informasi Geografis & Pemantauan Cuaca Real-Time Perkebunan Kelapa Sawit Sumatra dan Kalimantan terintegrasi Open-Meteo API dan Decision Support System (DSS) operasional kebun.",
  keywords: [
    "AgroWeather GIS",
    "PT Agrofarm Nusa Raya",
    "Kelapa Sawit",
    "Cuaca Sawit",
    "GIS Kebun",
    "Open-Meteo",
    "Sumatra",
    "Kalimantan",
    "DSS Sawit",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
