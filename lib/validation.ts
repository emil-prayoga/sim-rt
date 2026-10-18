import { z } from "zod";

const nikSchema = z
  .string()
  .trim()
  .regex(/^\d{16}$/, "NIK harus terdiri dari 16 digit angka");

const noKkSchema = z
  .string()
  .trim()
  .regex(/^\d{16}$/, "Nomor KK harus terdiri dari 16 digit angka");

const noWaSchema = z
  .string()
  .trim()
  .regex(/^08[1-9][0-9]{6,10}$/, "Format nomor WhatsApp: 08xxxxxxxxxx");

const periodeSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Format periode: YYYY-MM");

const tanggalSchema = z.string().trim().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}, "Tanggal tidak valid");

/** Form tambah kepala keluarga baru (halaman Data Warga & KK). */
export const addKepalaKeluargaSchema = z.object({
  namaKepala: z
    .string()
    .trim()
    .min(3, "Nama kepala keluarga minimal 3 karakter")
    .max(80, "Nama terlalu panjang"),
  nik: nikSchema,
  noKk: noKkSchema,
  blok: z.enum(["A", "B", "C", "D"]),
  noRumah: z
    .string()
    .trim()
    .regex(/^\d{1,3}[A-Za-z]?$/, "Contoh nomor rumah: 12 atau 12A"),
  statusDomisili: z.enum(["tetap", "kontrak", "sementara"]),
  kepemilikan: z.string().trim().min(3, "Status hunian wajib diisi"),
  noWa: noWaSchema,
  jumlahAnggota: z.coerce
    .number({ error: "Jumlah anggota wajib diisi" })
    .int("Jumlah anggota harus bilangan bulat")
    .min(1, "Minimal 1 anggota")
    .max(30, "Maksimal 30 anggota"),
  pekerjaan: z.string().trim().max(80).optional(),
  bansos: z.enum(["eligible", "non_eligible", "pending"]),
  ktpVerified: z.preprocess((value) => value === "on" || value === true, z.boolean()),
  kkVerified: z.preprocess((value) => value === "on" || value === true, z.boolean()),
});

export type AddKepalaKeluargaInput = z.infer<typeof addKepalaKeluargaSchema>;
export const editKepalaKeluargaSchema = addKepalaKeluargaSchema;
export type EditKepalaKeluargaInput = z.infer<typeof editKepalaKeluargaSchema>;

/** Form catat transaksi kas (halaman Keuangan & Iuran). */
export const catatTransaksiSchema = z.object({
  tanggal: tanggalSchema,
  jenis: z.enum(["masuk", "keluar"]),
  kategori: z.string().trim().min(3, "Kategori minimal 3 karakter"),
  jumlah: z.coerce
    .number({ error: "Nominal wajib diisi" })
    .positive("Nominal harus lebih dari Rp 0"),
  keterangan: z
    .string()
    .trim()
    .min(5, "Keterangan minimal 5 karakter")
    .max(200, "Keterangan terlalu panjang"),
});

export type CatatTransaksiInput = z.infer<typeof catatTransaksiSchema>;
export const editTransaksiSchema = catatTransaksiSchema;
export type EditTransaksiInput = z.infer<typeof editTransaksiSchema>;

/** Form buat tagihan iuran baru (halaman Keuangan & Iuran). */
export const buatTagihanSchema = z.object({
  wargaId: z.string().trim().min(1, "Pilih kepala keluarga"),
  periode: periodeSchema,
  jumlah: z.coerce
    .number({ error: "Nominal tagihan wajib diisi" })
    .int("Nominal harus bilangan bulat")
    .positive("Nominal harus lebih dari Rp 0"),
  catatan: z.string().trim().max(120, "Catatan terlalu panjang").optional(),
});

export type BuatTagihanInput = z.infer<typeof buatTagihanSchema>;

/** Form minta revisi surat (halaman Surat & Administrasi). */
export const mintaRevisiSchema = z.object({
  alasan: z
    .string()
    .trim()
    .min(10, "Alasan revisi minimal 10 karakter")
    .max(300, "Alasan revisi terlalu panjang"),
});

export type MintaRevisiInput = z.infer<typeof mintaRevisiSchema>;

export const aduanSchema = z.object({
  judul: z.string().trim().min(5, "Judul minimal 5 karakter").max(100),
  deskripsi: z.string().trim().min(10, "Deskripsi minimal 10 karakter").max(1200),
  pelapor: z.string().trim().min(3, "Nama pelapor wajib diisi").max(80),
  lokasi: z.string().trim().min(3, "Lokasi wajib diisi").max(120),
  status: z.enum(["diproses", "koordinasi", "selesai"]),
});
export type AduanInput = z.infer<typeof aduanSchema>;

export const pengaturanRTSchema = z.object({
  namaWilayah: z.string().trim().min(2).max(100),
  rt: z.string().trim().regex(/^\d{1,3}$/),
  rw: z.string().trim().regex(/^\d{1,3}$/),
  kelurahan: z.string().trim().min(2).max(100),
  kecamatan: z.string().trim().min(2).max(100),
  ketua: z.string().trim().min(3).max(100),
  kontak: z.string().trim().max(30),
  alamat: z.string().trim().max(250),
});
export type PengaturanRTInput = z.infer<typeof pengaturanRTSchema>;

/** Ubah error Zod menjadi record pesan per-field untuk rendering kondisional. */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

export const loginSchema = z.object({
  email: z.email("Alamat email tidak valid").trim(),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
});
export type LoginInput = z.infer<typeof loginSchema>;
