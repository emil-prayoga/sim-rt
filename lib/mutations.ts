import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { periodeIni } from "@/lib/data";
import type {
  IuranRow,
  KasTransaksi,
  SuratStatus,
  Warga,
} from "@/lib/types";
import type { AduanInput, PengaturanRTInput } from "@/lib/validation";
import type {
  AddKepalaKeluargaInput,
  BuatTagihanInput,
  CatatTransaksiInput,
} from "@/lib/validation";
import { getDemoKas, getDemoWarga, saveDemoKas, saveDemoWarga } from "@/lib/demo-store";

function requireSupabase(): SupabaseClient {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    throw new Error(
      "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return supabase;
}

type Row = Record<string, unknown>;

function str(row: Row, key: string, fallback = ""): string {
  const value = row[key];
  return typeof value === "string" ? value : fallback;
}

function nulStr(row: Row, key: string): string | null {
  const value = row[key];
  return typeof value === "string" ? value : null;
}

/** Simpan kepala keluarga baru ke tabel `warga`. */
export async function insertKepalaKeluarga(
  input: AddKepalaKeluargaInput,
): Promise<Warga> {
  const browserClient = getSupabaseBrowserClient();
  if (!browserClient) {
    const warga = demoWargaFromInput(input, crypto.randomUUID());
    saveDemoWarga([warga, ...getDemoWarga()]);
    return warga;
  }
  const supabase = browserClient;
  const { data, error } = await supabase
    .from("warga")
    .insert({
      no_kk: input.noKk,
      nik_kepala: input.nik,
      nama_kepala: input.namaKepala,
      pekerjaan: input.pekerjaan ?? null,
      usia: null,
      blok: input.blok,
      no_rumah: input.noRumah,
      status_domisili: input.statusDomisili,
      kepemilikan: input.kepemilikan,
      jumlah_anggota: input.jumlahAnggota,
      no_wa: input.noWa,
      ktp_verified: input.ktpVerified,
      kk_verified: input.kkVerified,
      bansos: input.bansos,
      foto_url: null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Gagal menyimpan kepala keluarga: ${error.message}`);
  }

  const row = data as Row;
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
    jumlahAnggota: typeof row.jumlah_anggota === "number" ? row.jumlah_anggota : 1,
    noWa: nulStr(row, "no_wa"),
    ktpVerified: row.ktp_verified === true,
    kkVerified: row.kk_verified === true,
    bansos: str(row, "bansos", "pending") as Warga["bansos"],
    fotoUrl: nulStr(row, "foto_url"),
  };
}

function demoWargaFromInput(input: AddKepalaKeluargaInput, id: string): Warga {
  return {
    id, noKk: input.noKk, nikKepala: input.nik, namaKepala: input.namaKepala,
    pekerjaan: input.pekerjaan || null, usia: null, blok: input.blok, noRumah: input.noRumah,
    statusDomisili: input.statusDomisili, kepemilikan: input.kepemilikan,
    jumlahAnggota: input.jumlahAnggota, noWa: input.noWa,
    ktpVerified: input.ktpVerified, kkVerified: input.kkVerified, bansos: input.bansos, fotoUrl: null,
  };
}

export async function updateKepalaKeluarga(id: string, input: AddKepalaKeluargaInput): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    saveDemoWarga(getDemoWarga().map((item) => item.id === id ? demoWargaFromInput(input, id) : item));
    return;
  }
  const { error } = await supabase.from("warga").update({
    no_kk: input.noKk, nik_kepala: input.nik, nama_kepala: input.namaKepala,
    pekerjaan: input.pekerjaan || null, blok: input.blok, no_rumah: input.noRumah,
    status_domisili: input.statusDomisili, kepemilikan: input.kepemilikan,
    jumlah_anggota: input.jumlahAnggota, no_wa: input.noWa, bansos: input.bansos,
    ktp_verified: input.ktpVerified, kk_verified: input.kkVerified,
  }).eq("id", id);
  if (error) throw new Error(`Gagal memperbarui data warga: ${error.message}`);
}

export async function deleteKepalaKeluarga(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) { saveDemoWarga(getDemoWarga().filter((item) => item.id !== id)); return; }
  const { error } = await supabase.from("warga").delete().eq("id", id);
  if (error) throw new Error(`Gagal menghapus data warga: ${error.message}`);
}

/** Perbarui status verifikasi surat (setujui / revisi / tolak). */
export async function updateSuratStatus(
  id: string,
  status: SuratStatus,
  alasan: string | null = null,
): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase
    .from("surat")
    .update({
      status,
      catatan_keputusan: alasan,
      keputusan_pada: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Gagal memperbarui status surat: ${error.message}`);
  }
}

/** Catat transaksi kas baru (masuk / keluar). */
export async function insertKasTransaksi(
  input: CatatTransaksiInput,
): Promise<KasTransaksi> {
  const browserClient = getSupabaseBrowserClient();
  if (!browserClient) {
    const transaksi: KasTransaksi = { id: crypto.randomUUID(), tanggal: input.tanggal, jenis: input.jenis, kategori: input.kategori, jumlah: Math.round(input.jumlah), keterangan: input.keterangan, verified: false };
    saveDemoKas([transaksi, ...getDemoKas()]);
    return transaksi;
  }
  const supabase = browserClient;
  const { data, error } = await supabase
    .from("kas_transaksi")
    .insert({
      tanggal: input.tanggal,
      jenis: input.jenis,
      kategori: input.kategori,
      jumlah: Math.round(input.jumlah),
      keterangan: input.keterangan,
      verified: false,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Gagal mencatat transaksi kas: ${error.message}`);
  }

  const row = data as Row;
  return {
    id: str(row, "id"),
    tanggal: str(row, "tanggal").slice(0, 10),
    jenis: str(row, "jenis", "masuk") as KasTransaksi["jenis"],
    kategori: str(row, "kategori"),
    jumlah: typeof row.jumlah === "number" ? row.jumlah : 0,
    keterangan: str(row, "keterangan"),
    verified: row.verified === true,
  };
}

export async function updateKasTransaksi(id: string, input: CatatTransaksiInput): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    saveDemoKas(getDemoKas().map((item) => item.id === id ? { ...item, tanggal: input.tanggal, jenis: input.jenis, kategori: input.kategori, jumlah: Math.round(input.jumlah), keterangan: input.keterangan } : item));
    return;
  }
  const { error } = await supabase.from("kas_transaksi").update({
    tanggal: input.tanggal, jenis: input.jenis, kategori: input.kategori,
    jumlah: Math.round(input.jumlah), keterangan: input.keterangan,
  }).eq("id", id);
  if (error) throw new Error(`Gagal memperbarui transaksi kas: ${error.message}`);
}

export async function deleteKasTransaksi(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) { saveDemoKas(getDemoKas().filter((item) => item.id !== id)); return; }
  const { error } = await supabase.from("kas_transaksi").delete().eq("id", id);
  if (error) throw new Error(`Gagal menghapus transaksi kas: ${error.message}`);
}

/** Buat tagihan iuran baru untuk satu kepala keluarga. */
export async function insertTagihan(
  input: BuatTagihanInput,
): Promise<IuranRow> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("iuran")
    .insert({
      warga_id: input.wargaId,
      periode: input.periode || periodeIni(),
      jumlah: input.jumlah,
      status: "belum",
      metode: null,
      catatan: input.catatan ?? null,
      waktu_bayar: null,
    })
    .select("*, warga(blok, no_rumah, nama_kepala, no_wa)")
    .single();

  if (error) {
    throw new Error(`Gagal membuat tagihan iuran: ${error.message}`);
  }

  const row = data as Row;
  const warga = (row.warga ?? {}) as Row;
  return {
    id: str(row, "id"),
    wargaId: str(row, "warga_id"),
    blok: str(warga, "blok"),
    noRumah: str(warga, "no_rumah"),
    namaKepala: str(warga, "nama_kepala"),
    noWa: nulStr(warga, "no_wa"),
    periode: str(row, "periode"),
    jumlah: typeof row.jumlah === "number" ? row.jumlah : 0,
    status: str(row, "status", "belum") as IuranRow["status"],
    metode: nulStr(row, "metode"),
    catatan: nulStr(row, "catatan"),
    waktuBayar: nulStr(row, "waktu_bayar"),
  };
}

export async function insertAduan(input: AduanInput): Promise<void> {
  const { error } = await requireSupabase().from("aduan").insert({ ...input });
  if (error) throw new Error(`Gagal menambahkan pengaduan: ${error.message}`);
}

export async function updateAduan(id: string, input: AduanInput): Promise<void> {
  const { error } = await requireSupabase().from("aduan").update({ ...input }).eq("id", id);
  if (error) throw new Error(`Gagal memperbarui pengaduan: ${error.message}`);
}

export async function deleteAduan(id: string): Promise<void> {
  const { error } = await requireSupabase().from("aduan").delete().eq("id", id);
  if (error) throw new Error(`Gagal menghapus pengaduan: ${error.message}`);
}

export async function savePengaturanRT(input: PengaturanRTInput): Promise<void> {
  const { error } = await requireSupabase().from("pengaturan_rt").upsert({
    id: 1, nama_wilayah: input.namaWilayah, rt: input.rt, rw: input.rw,
    kelurahan: input.kelurahan, kecamatan: input.kecamatan, ketua: input.ketua,
    kontak: input.kontak || null, alamat: input.alamat || null,
  });
  if (error) throw new Error(`Gagal menyimpan pengaturan RT: ${error.message}`);
}
