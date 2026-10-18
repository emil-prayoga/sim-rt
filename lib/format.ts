const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const bulanFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "short",
  year: "numeric",
});

const tanggalPanjangFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "short",
  year: "numeric",
});

const tanggalFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const waktuFormatter = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** "Rp 24.850.000" */
export function formatRupiah(nilai: number): string {
  return rupiahFormatter.format(nilai).replace(/\u00a0/g, " ");
}

/** "Okt 2024" */
export function formatPeriodeBulan(tanggal: Date = new Date()): string {
  return bulanFormatter.format(tanggal);
}

/** "Rabu, 23 Okt 2024" */
export function formatTanggalPanjang(tanggal: Date): string {
  return tanggalPanjangFormatter.format(tanggal);
}

/** "23 Okt 2024" */
export function formatTanggal(tanggal: Date | string): string {
  const date = typeof tanggal === "string" ? new Date(tanggal) : tanggal;
  return tanggalFormatter.format(date);
}

/** "14:22" */
export function formatWaktu(tanggal: Date | string): string {
  const date = typeof tanggal === "string" ? new Date(tanggal) : tanggal;
  return waktuFormatter.format(date);
}

/**
 * Label relatif untuk waktu pengajuan/aduan:
 * "Hari ini, 08:45 WIB" / "Kemarin, 19:12 WIB" / "20 Okt, 14:22".
 */
export function formatRelatif(iso: string): string {
  const tanggal = new Date(iso);
  const now = new Date();
  const mulaiHariIni = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const waktu = new Date(
    tanggal.getFullYear(),
    tanggal.getMonth(),
    tanggal.getDate(),
  );
  const selisihHari = Math.round(
    (mulaiHariIni.getTime() - waktu.getTime()) / 86_400_000,
  );

  const jam = `${formatWaktu(tanggal)} WIB`;
  if (selisihHari <= 0) return `Hari ini, ${jam}`;
  if (selisihHari === 1) return `Kemarin, ${jam}`;
  return `${formatTanggal(tanggal)}, ${formatWaktu(tanggal)}`;
}

/** Ambil inisial nama (maks 2 huruf) untuk avatar. */
export function inisialNama(nama: string): string {
  const bagian = nama
    .replace(/[.,]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  if (bagian.length === 0) return "?";
  if (bagian.length === 1) return bagian[0].slice(0, 2).toUpperCase();
  return (bagian[0][0] + bagian[1][0]).toUpperCase();
}

/** "3174-0924-0898-0001" */
export function formatNoKk(noKk: string): string {
  return noKk.replace(/(\d{4})(?=\d)/g, "$1-");
}

/** "0812-8921-4321" */
export function formatWa(noWa: string): string {
  const clean = noWa.replace(/\D/g, "");
  if (clean.length <= 4) return clean;
  if (clean.length <= 8) return `${clean.slice(0, 4)}-${clean.slice(4)}`;
  return `${clean.slice(0, 4)}-${clean.slice(4, 8)}-${clean.slice(8)}`;
}
