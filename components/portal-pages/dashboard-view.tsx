"use client";

import { useEffect, useState } from "react";
import { fetchDashboardData } from "@/lib/data";
import { formatRupiah } from "@/lib/format";
import type { DashboardData } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { UiIcon } from "@/components/ui-icon";

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      void fetchDashboardData()
        .then((result) => { if (active) setData(result); })
        .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "Data tidak dapat dimuat."); })
        .finally(() => { if (active) setLoading(false); });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, []);

  return (
    <div className="portal-content">
      <PageHeader title="Ringkasan & Dashboard" description="Pantau data warga, kas, surat, dan kegiatan RT dalam satu tampilan." />
      {loading && (
        <div className="p-4 rounded-xl bg-surface border border-outline-variant/30 text-on-surface-variant text-sm shadow-sm">
          Memuat data administrasi…
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container text-sm flex items-center justify-between shadow-sm">
          <span>{error}</span>
          <button 
            className="px-3 py-1.5 rounded-lg bg-error text-on-error font-medium text-xs hover:opacity-90 transition-opacity" 
            onClick={() => window.location.reload()}
          >
            Coba lagi
          </button>
        </div>
      )}
      {!loading && !error && data && <DashboardOverview data={data} />}
    </div>
  );
}

function DashboardOverview({ data }: { data: DashboardData }) {
  const { stats, suratAntrean, blokIuran, aduan, ronda } = data;
  const metrics = [
    { label: "Total warga", value: stats.totalJiwa.toLocaleString("id-ID"), detail: "Penduduk terdata", prominence: "primary" },
    { label: "Kepala keluarga", value: stats.totalKk.toLocaleString("id-ID"), detail: `${stats.kkTetap} tetap · ${stats.kkKontrak} kontrak` },
    { label: "Kas RT tersedia", value: formatRupiah(stats.kasSaldo), detail: `${stats.pemasukanPersen}% target bulanan`, prominence: "primary" },
    { label: "Surat menunggu", value: stats.suratMenunggu.toLocaleString("id-ID"), detail: `${stats.suratBaruHariIni} pengajuan hari ini` }
  ];

  return (
    <div className="dashboard-overview">
      <section className="dashboard-welcome">
        <div className="flex flex-col gap-2 z-10">
          <h2>
            Selamat bertugas,<br />Bpk. Bambang Sutrisno
          </h2>
          <p>
            Ketua RT 04 / RW 08 · Kelurahan Sukamaju, Cilandak
          </p>
        </div>

        <div className="welcome-details">
          <div className="flex flex-col">
            <span>Status kesiagaan</span>
            <strong>
              <UiIcon name="security" size={16}/> Kondusif · Level 1
            </strong>
          </div>
          <div>
            <span>Periode laporan</span>
            <strong>{data.periodeLabel}</strong>
          </div>
        </div>
      </section>

      <div className="dashboard-metrics" role="group" aria-label="Ringkasan administrasi">
        {metrics.map(({ label, value, detail, prominence }) => (
          <article className={prominence ? "dashboard-metric-primary" : "dashboard-metric-supporting"} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{detail}</small>
          </article>
        ))}
      </div>

      {/* Grid 2 Kolom: Surat & Realisasi Iuran */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="dashboard-panel">
          <PanelTitle title="Antrean surat pengantar" href="/surat" action="Lihat semua" />
          <div className="flex flex-col divide-y divide-outline-variant/20">
            {suratAntrean.slice(0, 6).map((item) => (
              <div className="py-3 flex items-center gap-3 first:pt-0 last:pb-0" key={item.id}>
                <span className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container font-semibold flex items-center justify-center text-sm shrink-0">
                  {item.nama.slice(0, 1)}
                </span>
                <div className="flex-1 min-w-0">
                  <strong className="block text-sm font-semibold text-on-surface truncate">{item.nama}</strong>
                  <small className="block text-xs text-on-surface-variant">{item.jenis} · Blok {item.blok}/{item.noRumah}</small>
                </div>
                <span className={`dashboard-queue-status dashboard-queue-status-${item.status}`}>
                  {item.status === "menunggu" ? "Menunggu" : item.status === "review" ? "Dalam review" : "Menunggu tanda tangan"}
                </span>
              </div>
            ))}
            {suratAntrean.length === 0 && <Empty>Belum ada surat yang menunggu.</Empty>}
          </div>
        </section>

        <section className="dashboard-panel">
          <PanelTitle title="Realisasi iuran per blok" href="/keuangan" action="Detail keuangan" />
          {blokIuran.length ? (
            <div className="grid grid-cols-4 gap-3 pt-2" role="img" aria-label="Grafik realisasi iuran per blok">
              {blokIuran.map((item) => (
                <div className="block-performance" key={item.blok} aria-label={`Blok ${item.blok}, ${item.persen}% terealisasi`}>
                  <strong className="text-sm font-bold text-primary mb-2">{item.persen}%</strong>
                  <div className="w-3 h-28 bg-surface-container-high rounded-full overflow-hidden flex flex-col justify-end p-0.5">
                    <div 
                      className="w-full bg-primary rounded-full transition-all duration-500" 
                      style={{ height: `${Math.max(8, Math.min(100, item.persen))}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-on-surface mt-2.5">Blok {item.blok}</span>
                  <small className="text-[10px] text-on-surface-variant mt-0.5">{item.lunas}/{item.rumah} KK</small>
                  <small className="text-[10px] font-medium text-secondary mt-0.5">{formatRupiah(item.terkumpul)}</small>
                </div>
              ))}
            </div>
          ) : (
            <Empty>Data realisasi iuran belum tersedia.</Empty>
          )}
        </section>
      </div>

      {/* Grid 2 Kolom: Pengaduan & Jadwal Ronda */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="dashboard-panel">
          <PanelTitle title="Pengaduan fasilitas" href="/pengaduan" action="Lihat semua" />
          <div className="flex flex-col divide-y divide-outline-variant/20">
            {aduan.slice(0, 6).map((item) => (
              <div className="py-3 flex items-center gap-3 first:pt-0 last:pb-0" key={item.id}>
                <span className="p-2 rounded-xl bg-secondary-container text-secondary shrink-0">
                  <UiIcon name="campaign" size={18} />
                </span>
                <div className="flex-1 min-w-0">
                  <strong className="block text-sm font-semibold text-on-surface truncate">{item.judul}</strong>
                  <small className="block text-xs text-on-surface-variant truncate">{item.lokasi} · {item.pelapor}</small>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-surface-container-high text-on-surface-variant shrink-0">
                  {item.status}
                </span>
              </div>
            ))}
            {aduan.length === 0 && <Empty>Tidak ada pengaduan aktif.</Empty>}
          </div>
        </section>

        <section className="dashboard-panel">
          <PanelTitle title="Jadwal ronda" action={ronda.shiftLabel} />
          <div className="flex items-center justify-between bg-surface-container-low px-3.5 py-2.5 rounded-xl border border-outline-variant/20">
            <span className="text-xs font-medium text-on-surface-variant flex items-center gap-1.5">
              <UiIcon name="location_on" size={14} /> Pos Ronda
            </span>
            <span className="text-xs font-bold text-primary">{ronda.posLabel}</span>
          </div>
          <div className="flex flex-col gap-2">
            {ronda.petugas.slice(0, 4).map((person) => (
              <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-[#CFE2D7]/20 transition-colors" key={person.id}>
                <span className="text-sm font-medium text-on-surface">{person.nomor}. {person.nama}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-medium">Blok {person.blok}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function PanelTitle({ title, action, href }: { title: string; action: string; href?: string }) { 
  return (
    <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
      <h2 className="text-base font-bold text-on-surface tracking-tight">{title}</h2>
      {href ? (
        <a href={href} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
          {action} <UiIcon name="arrow" size={14}/>
        </a>
      ) : action && (
        <span className="text-xs font-medium text-secondary">{action}</span>
      )}
    </div>
  ); 
}

function Empty({ children }: { children: React.ReactNode }) { 
  return (
    <div className="py-8 text-center text-xs text-on-surface-variant bg-surface-container-low rounded-xl border border-dashed border-outline-variant/40">
      {children}
    </div>
  ); 
}
