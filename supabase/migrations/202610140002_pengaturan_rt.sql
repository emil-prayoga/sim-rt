create table if not exists public.pengaturan_rt (
  id smallint primary key default 1 check (id = 1),
  nama_wilayah text not null default 'Sukamaju',
  rt text not null default '04',
  rw text not null default '08',
  kelurahan text not null default 'Sukamaju',
  kecamatan text not null default 'Cilandak',
  ketua text not null default 'Bambang Sutrisno',
  kontak text,
  alamat text,
  diperbarui_pada timestamptz not null default now()
);

alter table public.pengaturan_rt enable row level security;
drop policy if exists "Authenticated RT users can manage pengaturan_rt" on public.pengaturan_rt;
create policy "Authenticated RT users can manage pengaturan_rt"
  on public.pengaturan_rt for all to authenticated using (true) with check (true);

insert into public.pengaturan_rt (id) values (1) on conflict (id) do nothing;
