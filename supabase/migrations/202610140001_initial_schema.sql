-- Schema SiRT. RLS policies intentionally require an authenticated Supabase user.
-- Create admin accounts in Supabase Auth before using the live database.
create extension if not exists pgcrypto;

create table if not exists public.warga (
  id uuid primary key default gen_random_uuid(),
  no_kk text not null unique check (no_kk ~ '^\d{16}$'),
  nik_kepala text not null unique check (nik_kepala ~ '^\d{16}$'),
  nama_kepala text not null,
  pekerjaan text,
  usia integer check (usia is null or usia between 0 and 130),
  blok text not null check (blok in ('A','B','C','D')),
  no_rumah text not null,
  status_domisili text not null default 'tetap' check (status_domisili in ('tetap','kontrak','sementara')),
  kepemilikan text,
  jumlah_anggota integer not null default 1 check (jumlah_anggota between 1 and 30),
  no_wa text,
  ktp_verified boolean not null default false,
  kk_verified boolean not null default false,
  bansos text not null default 'pending' check (bansos in ('eligible','non_eligible','pending')),
  foto_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.anggota_warga (
  id uuid primary key default gen_random_uuid(),
  warga_id uuid not null references public.warga(id) on delete cascade,
  nama text not null,
  nik text not null unique check (nik ~ '^\d{16}$'),
  hubungan text not null,
  usia integer not null check (usia between 0 and 130),
  pekerjaan text not null default '',
  foto_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.surat (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  nik text not null check (nik ~ '^\d{16}$'),
  blok text not null,
  no_rumah text not null,
  jenis text not null,
  keperluan text not null,
  keterangan text,
  status text not null default 'menunggu' check (status in ('menunggu','review','menunggu_ttd','disetujui','revisi','ditolak')),
  diajukan_pada timestamptz not null default now(),
  catatan_keputusan text,
  keputusan_pada timestamptz
);

create table if not exists public.iuran (
  id uuid primary key default gen_random_uuid(),
  warga_id uuid not null references public.warga(id) on delete cascade,
  periode text not null check (periode ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  jumlah bigint not null check (jumlah > 0),
  status text not null default 'belum' check (status in ('lunas','menunggu','belum','tertunggak')),
  metode text,
  catatan text,
  waktu_bayar timestamptz,
  created_at timestamptz not null default now(),
  unique (warga_id, periode)
);

create table if not exists public.kas_transaksi (
  id uuid primary key default gen_random_uuid(),
  tanggal date not null default current_date,
  jenis text not null check (jenis in ('masuk','keluar')),
  kategori text not null,
  jumlah bigint not null check (jumlah > 0),
  keterangan text not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.aduan (
  id uuid primary key default gen_random_uuid(),
  judul text not null,
  deskripsi text not null,
  pelapor text not null,
  lokasi text not null,
  status text not null default 'diproses' check (status in ('diproses','koordinasi','selesai')),
  foto_url text,
  dibuat_pada timestamptz not null default now()
);

create table if not exists public.ronda_petugas (
  id uuid primary key default gen_random_uuid(),
  nomor integer not null,
  nama text not null,
  peran text not null,
  blok text not null,
  status text not null default 'siap_hadir' check (status in ('siap_hadir','konfirmasi_pengganti'))
);

do $$ declare table_name text; begin
  foreach table_name in array array['warga','anggota_warga','surat','iuran','kas_transaksi','aduan','ronda_petugas'] loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('drop policy if exists "Authenticated RT users can manage %I" on public.%I', table_name, table_name);
    execute format('create policy "Authenticated RT users can manage %I" on public.%I for all to authenticated using (true) with check (true)', table_name, table_name);
  end loop;
end $$;

create index if not exists surat_status_date_idx on public.surat(status, diajukan_pada desc);
create index if not exists iuran_periode_status_idx on public.iuran(periode, status);
create index if not exists kas_tanggal_idx on public.kas_transaksi(tanggal desc);
create index if not exists warga_blok_rumah_idx on public.warga(blok, no_rumah);
