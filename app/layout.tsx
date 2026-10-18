import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SiRT — Sistem Informasi RT 04 / RW 08",
    template: "%s | SiRT",
  },
  description:
    "Portal administrasi Rukun Tetangga: data warga & KK, keuangan dan iuran kas, surat pengantar, aduan fasilitas, serta jadwal ronda.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background font-body-md text-on-surface antialiased min-h-full">
        {children}
      </body>
    </html>
  );
}

