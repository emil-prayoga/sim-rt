# SiRT — Portal Administrasi RT

Portal Next.js untuk ringkasan lingkungan, data kartu keluarga, keuangan/iuran, dan verifikasi surat. Antarmuka mengikuti referensi di `design/`; data contoh tersedia saat konfigurasi Supabase belum diisi.

## Menjalankan aplikasi

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Isi `.env.local` dengan Project URL dan publishable/anon key dari Supabase. Jangan pernah menaruh `service_role` key di variabel `NEXT_PUBLIC_*` atau di browser.

## Menyiapkan Supabase

1. Jalankan SQL dari `supabase/migrations/202610140001_initial_schema.sql` lewat Supabase CLI (`supabase db push`) atau SQL Editor.
2. Buat akun pengelola RT di **Authentication → Users**. Portal hanya mengizinkan sesi pengguna yang sudah terautentikasi; pembuatan akun publik tidak dibuka.
3. Tabel memakai Row Level Security. Policy awal memberi akses CRUD kepada peran `authenticated`. Untuk lingkungan produksi dengan beberapa RT, batasi policy per RT memakai membership/role dan `rt_id` sebelum memasukkan data asli.

Tanpa kredensial Supabase, aplikasi memakai data demo dan menyimpan perubahan di browser lokal.

### Akun demo lokal

Jika variabel Supabase tidak diisi, halaman login menerima akun demo berikut. Sesi demo hanya berlaku di browser saat ini dan data demo yang diedit disimpan di `localStorage` browser.

- Email: `admin@sirt.demo`
- Password: `SirtDemo04!`

Akun ini tidak dibuat pada Supabase Auth dan tidak berlaku saat Supabase dikonfigurasi. Untuk login Supabase, buat akun admin dari Supabase Dashboard.

## Route

- `/` — Ringkasan & dashboard
- `/warga` — Data warga dan KK
- `/keuangan` — Rekap iuran, buku kas, dan pencatatan transaksi
- `/surat` — Antrean dan keputusan surat pengantar

Halaman warga dan keuangan mendukung penambahan, pengeditan, penghapusan, serta ekspor CSV. Hapus data warga meminta konfirmasi dan menghapus anggota keluarga/tagihan terkait sesuai foreign key cascade.

Formulir memakai skema Zod bersama. Klien Supabase memakai publishable key dan RLS; autentikasi email/kata sandi disimpan oleh Supabase Auth.
