import { BLOK_NAMA, DAFTAR_BLOK, IURAN_PER_KK, RONDA_INFO } from "@/lib/constants";
import {
  demoAduan,
  demoAnggota,
  demoBlokIuran,
  demoDashboardStats,
  demoIuran,
  demoKas,
  demoKeuangan,
  demoRonda,
  demoSurat,
  demoWarga,
  demoWargaStats,
} from "@/lib/demo-data";
import { formatPeriodeBulan } from "@/lib/format";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  Aduan,
  AnggotaKeluarga,
  BlokIuran,
  DashboardData,
  DashboardStats,
  IuranRow,
  KasTransaksi,
  KeuanganData,
  RondaPetugas,
  SuratPengantar,
  SuratData,
  SuratStatus,
  Warga,
  WargaData,
  WargaStats,
} from "@/lib/types";

type Row = Record<string, unknown>;


const STATUS_SURAT_AKTIF: SuratStatus[] = ["menunggu", "review", "menunggu_ttd"];

export async function fetchSuratData(): Promise<SuratData> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return {
      source: "demo",
      surat: demoSurat,
    };
  }

  const { data, error } = await supabase
    .from("surat")
    .select("*")
    .order("diajukan_pada", { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat data surat: ${error.message}`);
  }

  const surat = (data ?? []).map((row) => mapSurat(row as Row));
  return {
    source: "supabase",
    surat,
  };
}

function str(row: Row, key: string, fallback = ""): string {
  const value = row[key];
  return typeof value === "string" ? value : fallback;
}

function nulStr(row: Row, key: string): string | null {
  const value = row[key];
  return typeof value === "string" ? value : null;
}

function num(row: Row, key: string, fallback = 0): number {
  const value = row[key];
  return typeof value === "number" ? value : fallback;
}

function bool(row: Row, key: string): boolean {
  return row[key] === true;
}

export function periodeIni(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function isHariIni(iso: string): boolean {
  const tanggal = new Date(iso);
  const now = new Date();
  return (
    tanggal.getFullYear() === now.getFullYear() &&
    tanggal.getMonth() === now.getMonth() &&
    tanggal.getDate() === now.getDate()
  );
}

function mapWarga(row: Row): Warga {
  return {
    id: str(row, "id"),
    noKk: str(row, "no_kk"),
    nikKepala: str(row, "nik_kepala"),
    namaKepala: str(row, "nama_kepala"),
    pekerjaan: nulStr(row, "pekerjaan"),
    usia: typeof row.usia === "number" ? row.usia : null,
    blok: str(row, "blok"),
    noRumah: str(row, "no_rumah"),
    statusDomisili: str(row, "status_domisili", "tetap") as Warga["statusDomisili"],
    kepemilikan: nulStr(row, "kepemilikan"),
    jumlahAnggota: num(row, "jumlah_anggota", 1),
    noWa: nulStr(row, "no_wa"),
    ktpVerified: bool(row, "ktp_verified"),
    kkVerified: bool(row, "kk_verified"),
    bansos: str(row, "bansos", "pending") as Warga["bansos"],
    fotoUrl: nulStr(row, "foto_url"),
  };
}

function mapAnggota(row: Row): AnggotaKeluarga {
  return {
    id: str(row, "id"),
    wargaId: str(row, "warga_id"),
    nama: str(row, "nama"),
    nik: str(row, "nik"),
    hubungan: str(row, "hubungan"),
    usia: num(row, "usia"),
    pekerjaan: str(row, "pekerjaan"),
    fotoUrl: nulStr(row, "foto_url"),
  };
}

function mapSurat(row: Row): SuratPengantar {
  return {
    id: str(row, "id"),
    nama: str(row, "nama"),
    nik: str(row, "nik"),
    blok: str(row, "blok"),
    noRumah: str(row, "no_rumah"),
    jenis: str(row, "jenis"),
    keperluan: str(row, "keperluan"),
    keterangan: nulStr(row, "keterangan"),
    status: str(row, "status", "menunggu") as SuratStatus,
    diajukanPada: str(row, "diajukan_pada"),
  };
}

function mapIuran(row: Row): IuranRow {
  const warga = (row.warga ?? {}) as Row;
  const wargaId = str(row, "warga_id");
  return {
    id: str(row, "id"),
    wargaId,
    blok: str(warga, "blok") || str(row, "blok"),
    noRumah: str(warga, "no_rumah") || str(row, "no_rumah"),
    namaKepala: str(warga, "nama_kepala") || str(row, "nama_kepala"),
    noWa: nulStr(warga, "no_wa") || nulStr(row, "no_wa"),
    periode: str(row, "periode"),
    jumlah: num(row, "jumlah"),
    status: str(row, "status", "belum") as IuranRow["status"],
    metode: nulStr(row, "metode"),
    catatan: nulStr(row, "catatan"),
    waktuBayar: nulStr(row, "waktu_bayar"),
  };
}

function mapKas(row: Row): KasTransaksi {
  return {
    id: str(row, "id"),
    tanggal: str(row, "tanggal").slice(0, 10),
    jenis: str(row, "jenis", "masuk") as KasTransaksi["jenis"],
    kategori: str(row, "kategori"),
    jumlah: num(row, "jumlah"),
    keterangan: str(row, "keterangan"),
    verified: bool(row, "verified"),
  };
}

function mapAduan(row: Row): Aduan {
  return {
    id: str(row, "id"),
    judul: str(row, "judul"),
    deskripsi: str(row, "deskripsi"),
    pelapor: str(row, "pelapor"),
    lokasi: str(row, "lokasi"),
    status: str(row, "status", "diproses") as Aduan["status"],
    fotoUrl: nulStr(row, "foto_url"),
    dibuatPada: str(row, "dibuat_pada"),
  };
}

function mapRonda(row: Row): RondaPetugas {
  return {
    id: str(row, "id"),
    nomor: num(row, "nomor"),
    nama: str(row, "nama"),
    peran: str(row, "peran"),
    blok: str(row, "blok"),
    status: str(row, "status", "siap_hadir") as RondaPetugas["status"],
  };
}

function hitungStatsWarga(warga: Warga[]): WargaStats {
  const totalKk = warga.length;
  let totalJiwa = 0;
  let tetap = 0;
  let kontrak = 0;
  let bansos = 0;
  let terverifikasi = 0;

  for (const item of warga) {
    totalJiwa += item.jumlahAnggota;
    if (item.statusDomisili === "tetap") {
      tetap += item.jumlahAnggota;
    } else {
      kontrak += item.jumlahAnggota;
    }
    if (item.bansos === "eligible") {
      bansos += item.jumlahAnggota;
    }
    if (item.ktpVerified && item.kkVerified) {
      terverifikasi += 1;
    }
  }

  return {
    totalJiwa,
    totalKk,
    wargaTetap: tetap,
    wargaKontrak: kontrak,
    bansosRentan: bansos,
    verifikasiPersen:
      totalKk === 0 ? 100 : Math.round((terverifikasi / totalKk) * 10) / 10,
  };
}

/** Ambil seluruh data warga + statistik agregat. */
export async function fetchWargaData(): Promise<WargaData> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return {
      source: "demo",
      warga: demoWarga,
      stats: demoWargaStats,
    };
  }

  const { data, error } = await supabase
    .from("warga")
    .select("*")
    .order("blok", { ascending: true })
    .order("no_rumah", { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat data warga: ${error.message}`);
  }

  const warga = (data ?? []).map((row) => mapWarga(row as Row));
  return {
    source: "supabase",
    warga,
    stats: hitungStatsWarga(warga),
  };
}

/** Ambil susunan anggota sebuah keluarga (dipanggil saat panel dipilih). */
export async function fetchAnggota(wargaId: string): Promise<AnggotaKeluarga[]> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return demoAnggota.filter((anggota) => anggota.wargaId === wargaId);
  }

  const { data, error } = await supabase
    .from("anggota_warga")
    .select("*")
    .eq("warga_id", wargaId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Gagal memuat anggota keluarga: ${error.message}`);
  }

  return (data ?? []).map((row) => mapAnggota(row as Row));
}

function hitungStatsDashboard(
  dasar: Omit<
    DashboardStats,
    "suratMenunggu" | "suratBaruHariIni" | "aduanAktif" | "aduanSelesaiPekan"
  >,
  antrean: SuratPengantar[],
  aduan: Aduan[],
): DashboardStats {
  return {
    ...dasar,
    suratMenunggu: antrean.length,
    suratBaruHariIni: antrean.filter((surat) =>
      isHariIni(surat.diajukanPada),
    ).length,
    aduanAktif: aduan.length,
    aduanSelesaiPekan: aduan.filter((a) => a.status === "selesai").length,
  };
}

export interface PengaturanRT {
  namaWilayah: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  ketua: string;
  kontak: string;
  alamat: string;
}

export const PENGATURAN_DEFAULT: PengaturanRT = {
  namaWilayah: "Warga Sukamaju",
  rt: "04",
  rw: "08",
  kelurahan: "Sukamaju",
  kecamatan: "Cilandak",
  ketua: "Bpk. Bambang Sutrisno",
  kontak: "081234567890",
  alamat: "Jl. Sukamaju Raya No. 12",
};

/** Ambil pengaturan wilayah RT */
export async function fetchPengaturanRT(): Promise<PengaturanRT> {
  return PENGATURAN_DEFAULT;
}

export interface AduanData {
  source: "supabase" | "demo";
  aduan: Aduan[];
}

/** Ambil seluruh data pengaduan fasilitas */
export async function fetchAduanData(): Promise<AduanData> {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return {
      source: "demo",
      aduan: demoAduan,
    };
  }

  const { data, error } = await supabase
    .from("aduan")
    .select("*")
    .order("dibuat_pada", { ascending: false });

  if (error) {
    throw new Error(`Gagal memuat data aduan: ${error.message}`);
  }

  const aduan = (data ?? []).map((row) => mapAduan(row as Row));
  return {
    source: "supabase",
    aduan,
  };
}

/** Ambil seluruh data keuangan (iuran, kas, dan ringkasan) */
export async function fetchKeuanganData(): Promise<KeuanganData> {
  const supabase = getSupabaseBrowserClient();
  const periodeAktif = periodeIni();
  const periodeLabel = formatPeriodeBulan();

  if (!supabase) {
    return {
      source: "demo",
      iuran: demoIuran,
      kas: demoKas,
      saldo: demoKeuangan.saldo,
      pemasukan: demoKeuangan.pemasukan,
      pengeluaran: demoKeuangan.pengeluaran,
      targetPemasukan: demoKeuangan.targetPemasukan,
      tunggakan: demoKeuangan.tunggakan,
      tunggakanKk: demoKeuangan.tunggakanKk,
      transaksiTerverifikasi: demoKeuangan.transaksiTerverifikasi,
      periodeLabel
    };
  }

  const [iuranRes, kasRes, wargaRes] = await Promise.all([
    supabase.from("iuran").select("*, warga(blok, no_rumah, nama_kepala, no_wa)").order("periode", { ascending: false }),
    supabase.from("kas_transaksi").select("*").order("tanggal", { ascending: false }),
    supabase.from("warga").select("*"),
  ]);

  if (iuranRes.error) throw new Error(`Gagal memuat iuran: ${iuranRes.error.message}`);
  if (kasRes.error) throw new Error(`Gagal memuat kas: ${kasRes.error.message}`);
  if (wargaRes.error) throw new Error(`Gagal memuat warga: ${wargaRes.error.message}`);

  const iuran = (iuranRes.data ?? []).map((row) => mapIuran(row as Row));
  const kas = (kasRes.data ?? []).map((row) => mapKas(row as Row));
  const warga = (wargaRes.data ?? []).map((row) => mapWarga(row as Row));

  const totalPemasukanKas = kas
    .filter((k) => k.jenis === "masuk" && k.verified)
    .reduce((acc, curr) => acc + curr.jumlah, 0);

  const totalPengeluaranKas = kas
    .filter((k) => k.jenis === "keluar" && k.verified)
    .reduce((acc, curr) => acc + curr.jumlah, 0);

  const saldo = totalPemasukanKas - totalPengeluaranKas;

  const iuranBulanIni = iuran.filter((i) => i.periode === periodeAktif && i.status === "lunas");
  const pemasukanIuranBulanIni = iuranBulanIni.reduce((acc, curr) => acc + curr.jumlah, 0);
  
  const targetPemasukan = warga.length * IURAN_PER_KK;
  const tunggakanKkList = iuran.filter((i) => i.periode === periodeAktif && i.status !== "lunas");
  const tunggakan = tunggakanKkList.length * IURAN_PER_KK;

  const trendMap: Record<string, { masuk: number; keluar: number }> = {};
  for (const k of kas) {
    const bulanKey = k.tanggal.slice(0, 7);
    if (!trendMap[bulanKey]) {
      trendMap[bulanKey] = { masuk: 0, keluar: 0 };
    }
    if (k.verified) {
      if (k.jenis === "masuk") trendMap[bulanKey].masuk += k.jumlah;
      else trendMap[bulanKey].keluar += k.jumlah;
    }
  }

  const trend: TrendBulan[] = Object.keys(trendMap)
    .sort()
    .slice(-6)
    .map((bulan) => ({
      label: bulan,
      masuk: trendMap[bulan].masuk,
      keluar: trendMap[bulan].keluar,
    }));

  return {
    source: "supabase",
    iuran,
    kas,
    saldo,
    pemasukan: pemasukanIuranBulanIni,
    pengeluaran: totalPengeluaranKas,
    targetPemasukan,
    tunggakan,
    tunggakanKk: tunggakanKkList.length,
    transaksiTerverifikasi: kas.filter((k) => k.verified).length,
    periodeLabel,
    trend: trend.length > 0 ? trend : [{ label: periodeAktif, masuk: pemasukanIuranBulanIni, keluar: totalPengeluaranKas }],
  };
}

/** Ringkasan dashboard: statistik, antrean surat, aduan, ronda, dan realisasi iuran per blok. */
export async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = getSupabaseBrowserClient();
  console.log("STATUS SUPABASE CLIENT:", supabase ? "TERHUBUNG" : "TIDAK TERHUBUNG / NULL");
  const periodeLabel = formatPeriodeBulan();

  if (!supabase) {
    const suratAktif = demoSurat.filter((surat) => STATUS_SURAT_AKTIF.includes(surat.status));
    const antrean = suratAktif.filter((surat) => surat.status === "menunggu");
    return {
      source: "demo",
      stats: hitungStatsDashboard(demoDashboardStats, antrean, demoAduan),
      targetIuran: 0,
      periodeLabel,
      suratAntrean: suratAktif,
      aduan: demoAduan,
      ronda: { ...RONDA_INFO, petugas: demoRonda },
      blokIuran: demoBlokIuran,
    };
  }

  const [wargaRes, suratRes, aduanRes, iuranRes, kasRes, rondaRes] =
    await Promise.all([
      supabase.from("warga").select("*"),
      supabase
        .from("surat")
        .select("*")
        .in("status", STATUS_SURAT_AKTIF)
        .order("diajukan_pada", { ascending: false }),
      supabase
        .from("aduan")
        .select("*")
        .neq("status", "selesai")
        .order("dibuat_pada", { ascending: false }),
      supabase.from("iuran").select("*"),
      supabase.from("kas_transaksi").select("*"),
      supabase.from("ronda_petugas").select("*").order("nomor", { ascending: true }),
    ]);

  const gagal = [wargaRes, suratRes, aduanRes, iuranRes, kasRes, rondaRes].find(
    (hasil) => hasil.error,
  );
  if (gagal?.error) {
    throw new Error(`Gagal memuat ringkasan dashboard: ${gagal.error.message}`);
  }

  const warga = (wargaRes.data ?? []).map((row) => mapWarga(row as Row));
  const suratAktif = (suratRes.data ?? []).map((row) => mapSurat(row as Row));
  const antrean = suratAktif.filter((surat) => surat.status === "menunggu");
  const aduan = (aduanRes.data ?? []).map((row) => mapAduan(row as Row));
  const kas = (kasRes.data ?? []).map((row) => mapKas(row as Row));
  const iuran = (iuranRes.data ?? []).map((row) => mapIuran(row as Row));
  const petugas = (rondaRes.data ?? []).map((row) => mapRonda(row as Row));

  const periodeAktif = periodeIni(); 
  const targetPerKk = IURAN_PER_KK;

  const blokIuran: BlokIuran[] = DAFTAR_BLOK.map((blokKey) => {
    const wargaBlok = warga.filter((w) => w.blok === blokKey);
    const totalRumah = wargaBlok.length;
    const wargaIds = new Set(wargaBlok.map((w) => w.id));

    const iuranLunasBlok = iuran.filter(
      (i) => wargaIds.has(i.wargaId) && i.periode === periodeAktif && i.status === "lunas"
    );

    const lunasCount = iuranLunasBlok.length;
    const terkumpul = iuranLunasBlok.reduce((acc, curr) => acc + curr.jumlah, 0);
    const persen = totalRumah > 0 ? Math.round((lunasCount / totalRumah) * 100) : 0;

    return {
      blok: blokKey,
      namaBlok: BLOK_NAMA[blokKey] ?? `Blok ${blokKey}`,
      rumah: totalRumah,
      lunas: lunasCount,
      terkumpul,
      persen,
    };
  });

  const totalPemasukanKas = kas
    .filter((k) => k.jenis === "masuk" && k.verified)
    .reduce((acc, curr) => acc + curr.jumlah, 0);
  
  const totalPengeluaranKas = kas
    .filter((k) => k.jenis === "keluar" && k.verified)
    .reduce((acc, curr) => acc + curr.jumlah, 0);

  const kasSaldo = totalPemasukanKas - totalPengeluaranKas;
  const totalTargetBulanan = warga.length * targetPerKk;
  const totalTerkumpulBulanIni = blokIuran.reduce((acc, curr) => acc + curr.terkumpul, 0);
  const pemasukanPersen = totalTargetBulanan > 0 ? Math.round((totalTerkumpulBulanIni / totalTargetBulanan) * 100) : 0;

  const statsWarga = hitungStatsWarga(warga);
  const dashboardStats: DashboardStats = {
    ...statsWarga,
    kkTetap: warga.filter((w) => w.statusDomisili === "tetap").length,
    kkKontrak: warga.filter((w) => w.statusDomisili === "kontrak" || w.statusDomisili === "sementara").length,
    kasSaldo,
    pemasukanPersen,
    suratMenunggu: antrean.length,
    suratBaruHariIni: antrean.filter((s) => isHariIni(s.diajukanPada)).length,
    aduanAktif: aduan.length,
    aduanSelesaiPekan: aduan.filter((a) => a.status === "selesai").length,
  };

  return {
    source: "supabase",
    stats: dashboardStats,
    targetIuran: totalTerkumpulBulanIni,
    periodeLabel,
    suratAntrean: suratAktif,
    aduan,
    ronda: { ...RONDA_INFO, petugas },
    blokIuran,
  };
}
