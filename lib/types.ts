export type DomisiliStatus = "tetap" | "kontrak" | "sementara";
export type BansosStatus = "eligible" | "non_eligible" | "pending";
export type SuratStatus =
  | "menunggu"
  | "review"
  | "menunggu_ttd"
  | "disetujui"
  | "revisi"
  | "ditolak";
export type IuranStatus = "lunas" | "menunggu" | "belum" | "tertunggak";
export type AduanStatus = "diproses" | "koordinasi" | "selesai";
export type RondaStatus = "siap_hadir" | "konfirmasi_pengganti";
export type KasJenis = "masuk" | "keluar";

export type DataSource = "supabase" | "demo";

export interface Warga {
  id: string;
  noKk: string;
  nikKepala: string;
  namaKepala: string;
  pekerjaan: string | null;
  usia: number | null;
  blok: string;
  noRumah: string;
  statusDomisili: DomisiliStatus;
  kepemilikan: string | null;
  jumlahAnggota: number;
  noWa: string | null;
  ktpVerified: boolean;
  kkVerified: boolean;
  bansos: BansosStatus;
  fotoUrl: string | null;
}

export interface AnggotaKeluarga {
  id: string;
  wargaId: string;
  nama: string;
  nik: string;
  hubungan: string;
  usia: number;
  pekerjaan: string;
  fotoUrl: string | null;
}

export interface SuratPengantar {
  id: string;
  nama: string;
  nik: string;
  blok: string;
  noRumah: string;
  jenis: string;
  keperluan: string;
  keterangan: string | null;
  status: SuratStatus;
  /** ISO date string */
  diajukanPada: string;
}

export interface IuranRow {
  id: string;
  wargaId: string;
  blok: string;
  noRumah: string;
  namaKepala: string;
  noWa: string | null;
  periode: string; // "YYYY-MM"
  jumlah: number;
  status: IuranStatus;
  metode: string | null;
  catatan: string | null;
  /** ISO date string kapan pembayaran dicatat */
  waktuBayar: string | null;
}

export interface KasTransaksi {
  id: string;
  /** ISO date (YYYY-MM-DD) */
  tanggal: string;
  jenis: KasJenis;
  kategori: string;
  jumlah: number;
  keterangan: string;
  verified: boolean;
}

export interface Aduan {
  id: string;
  judul: string;
  deskripsi: string;
  pelapor: string;
  lokasi: string;
  status: AduanStatus;
  fotoUrl: string | null;
  /** ISO date string */
  dibuatPada: string;
}

export interface RondaPetugas {
  id: string;
  nomor: number;
  nama: string;
  peran: string;
  blok: string;
  status: RondaStatus;
}

export interface WargaStats {
  totalJiwa: number;
  totalKk: number;
  wargaTetap: number;
  wargaKontrak: number;
  bansosRentan: number;
  verifikasiPersen: number;
}

export interface DashboardStats {
  totalJiwa: number;
  totalKk: number;
  kkTetap: number;
  kkKontrak: number;
  kasSaldo: number;
  pemasukanPersen: number;
  suratMenunggu: number;
  suratBaruHariIni: number;
  aduanAktif: number;
  aduanSelesaiPekan: number;
}

export interface BlokIuran {
  blok: string;
  namaBlok: string;
  rumah: number;
  lunas: number;
  terkumpul: number;
  persen: number;
}

export interface RondaInfo {
  shiftLabel: string;
  posLabel: string;
  koordinatorTelp: string;
  koordinatorWa: string;
  petugas: RondaPetugas[];
}

export interface DashboardData {
  source: DataSource;
  stats: DashboardStats;
  /** penerimaan bulan berjalan / target */
  targetIuran: number;
  periodeLabel: string;
  suratAntrean: SuratPengantar[];
  aduan: Aduan[];
  ronda: RondaInfo;
  blokIuran: BlokIuran[];
}

export interface WargaData {
  source: DataSource;
  warga: Warga[];
  stats: WargaStats;
}

export interface KeuanganData {
  source: DataSource;
  iuran: IuranRow[];
  kas: KasTransaksi[];
  saldo: number;
  pemasukan: number;
  pengeluaran: number;
  targetPemasukan: number;
  tunggakan: number;
  tunggakanKk: number;
  transaksiTerverifikasi: number;
  periodeLabel: string;
  trend: TrendBulan[]; // <--- Pastikan baris ini ada di dalam interface KeuanganData
}

export interface TrendBulan {
  label: string;
  masuk: number;
  keluar: number;
}

export interface SuratData {
  source: DataSource;
  surat: SuratPengantar[];
}
