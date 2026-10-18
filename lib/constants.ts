/** Iuran wajib per KK per bulan (Rp) — Keamanan & Kebersihan + Dana Sosial. */
export const IURAN_PER_KK = 100_000;

/** Komponen pos iuran bulanan. */
export const POS_IURAN = [
  {
    nama: "Kebersihan & Sampah",
    nominal: 35_000,
    keterangan: "Pengangkutan 3x seminggu",
    icon: "delete_sweep",
  },
  {
    nama: "Keamanan & Ronda",
    nominal: 40_000,
    keterangan: "Insentif 2 petugas pos malam",
    icon: "shield",
  },
  {
    nama: "Dana Sosial & Kematian",
    nominal: 25_000,
    keterangan: "Santunan & kedaruratan",
    icon: "handshake",
  },
] as const;

/** Target pemasukan iuran bulan berjalan (Rp). */
export const TARGET_PEMASUKAN = 8_400_000;

/** Total target iuran seluruh lingkungan untuk dashboard (Rp). */
export const TARGET_IURAN_TOTAL = 28_200_000;

export const RONDA_INFO = {
  shiftLabel: "Shift Regu 2 • 22:00 - 04:30 WIB",
  posLabel: "POS UTAMA RT 04",
  koordinatorTelp: "0812-8899-7712 (Iwan)",
  koordinatorWa: "6281288997712",
} as const;

export const BLOK_NAMA: Record<string, string> = {
  A: "Mawar",
  B: "Melati",
  C: "Kenanga",
  D: "Cempaka",
};

export const DAFTAR_BLOK = ["A", "B", "C", "D"] as const;

export const JENIS_SURAT = [
  "Pengantar KTP/KK",
  "Ket. Domisili",
  "Pengantar Nikah",
  "SKTM",
  "Pengantar SKCK",
  "Keterangan Kelahiran",
] as const;

/** Aset gambar statis shell (logo & avatar pengguna). */
export const SHELL_ASSETS = {
  logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJtOajP09xdXTZrRlUsQ4hjpWJb4-KRy7bPphfRpIEpT3AOisomC9m4HIqOi345pxoJG5OE1cIAIr5l2TkhVqjCeEiiASe1h4V1J58nBC4tw_vghO2zy_12ywrg6BBNTIgfjn3ZHG2oPemMloqkBE9ZphwD7JlIMu-EXCbtACGOOrN_CHjasuXMaN3VWzyy3uwkl4fWbHk3SXrg7GBVkPmhxOR9bI7IPJMtCeR7bb86-GXz3LGMKvSHQ",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAx3_0aWOTnNdRqAFgvQkYRah4z7kAmoydqnboV4p4TsCowbGYn-fH0BmgwfstR6CHYzVRSwuBe-pldaznVXh9kkrHLQ2NFPIL1XIm1q40G00tFVK4a-9n7pQz9wU3Fvt4Tq2ll288CrUFKmkYLimCCAKR_pW11nfwXT9WnXiWM1doQNDjbA5sKPFOUF30gLK7Uwnt5h3_OJpiRGOT1luP7_O8NqW9n5gaey9yQVbqPl3OEUsHxdDTK9g",
} as const;

/** Pratinjau berkas digital (e-KTP & KK) pada panel detail keluarga. */
export const BERKAS_ASSETS = {
  ktp: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7dXA5PdrkKzVKxc6Zbh2S7mUCsM_PDEoM3cLkLR5wnBacKMQBNR1MbhrSLeTwsKCcjSgi-OgmiUQi8VTqWaceb1G8IPsyc7LO9T_jVPkWGxRXJSwrZNCi0fpBBd0bS3eRhFklxv1maGchAWKz5j8ysA8VhFf7getB7T3HGQ7bEthjUtcTBMJ1egVwlYuifhRG6V_KNPKPxN3vDE8rXtnY06A8aWDmkKyYQvxLAP6wNrwvlFN4QVfAVQ",
  kk: "https://lh3.googleusercontent.com/aida-public/AB6AXuAgMGWq7GhaHcU5ykCw5oyvK01X83TOKw6rNMhoGWueJNmy4Gx8tR-_PbiPnNMTCAW1yX2qZzn1QmCEx2zxs9mP5AH_zeDFstI2N3o33Cj5oqSv-EfyAONqo2ZUg9pUWxRAZUBRM0qR9IstKgMURsYwViFXQAbHceAopkr5Jyoj3DqF0rImtrMEiQR4D3z5j_CCMIfH19_mv_98tS31fOh0QgChy-KGRFolJb52W3L6iPjPpPiaVkguIw",
} as const;
