"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { Toast } from "@/components/toast";
import { UiIcon } from "@/components/ui-icon";
import { fetchSuratData } from "@/lib/data";
import { updateSuratStatus } from "@/lib/mutations";
import { mintaRevisiSchema } from "@/lib/validation";
import { formatRelatif } from "@/lib/format";
import type { SuratData, SuratPengantar, SuratStatus } from "@/lib/types";

type Notice = { message: string; tone: "success" | "error" } | null;

export function SuratClient() {
  const [data, setData] = useState<SuratData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setData(await fetchSuratData());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Surat gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function decide(id: string, status: "disetujui" | "revisi") {
    let reason: string | null = null;
    if (status === "revisi") {
      const value = window.prompt("Alasan revisi (minimal 10 karakter):");
      if (value === null) return;
      const parsed = mintaRevisiSchema.safeParse({ alasan: value });
      if (!parsed.success) {
        setNotice({ message: parsed.error.issues[0]?.message ?? "Alasan tidak valid.", tone: "error" });
        return;
      }
      reason = parsed.data.alasan;
    }
    setBusy(true);
    try {
      await updateSuratStatus(id, status, reason);
      setNotice({
        message: status === "disetujui" ? "Surat disetujui." : "Permintaan revisi dikirim.",
        tone: "success",
      });
      await refresh();
    } catch (e) {
      setNotice({ message: e instanceof Error ? e.message : "Status surat gagal diubah.", tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="portal-content">
      <PageHeader title="Surat Pengantar & Administrasi" description="Tinjau permohonan warga dan kelola proses penerbitan surat." />
      {loading && <div className="callout bg-background shadow-sm rounded-xl">Memuat antrean surat…</div>}
      {error && (
        <div className="callout error-callout shadow-sm rounded-xl">
          {error}
          <button className="button" onClick={() => void refresh()}>
            Coba lagi
          </button>
        </div>
      )}
      {!loading && data && !error && (
        <LetterQueue data={data} busy={busy} decide={(id, s) => void decide(id, s)} />
      )}
      {notice && <Toast message={notice.message} tone={notice.tone} onDismiss={() => setNotice(null)} />}
    </div>
  );
}

function LetterQueue({
  data,
  busy,
  decide,
}: {
  data: SuratData;
  busy: boolean;
  decide: (id: string, s: "disetujui" | "revisi") => void;
}) {
  const [activeId, setActiveId] = useState(
    data.surat.find((x) => x.status === "menunggu")?.id ?? data.surat[0]?.id ?? ""
  );
  const active = data.surat.find((x) => x.id === activeId);
  const pending = data.surat.filter((x) => ["menunggu", "review", "menunggu_ttd"].includes(x.status));

  return (
    <>
      <div className="stat-grid compact-stats">
        {[
          ["Menunggu persetujuan", pending.length],
          ["Diterbitkan", data.surat.filter((x) => x.status === "disetujui").length],
          ["Perlu dilengkapi", data.surat.filter((x) => x.status === "revisi").length],
          ["Total permohonan", data.surat.length],
        ].map(([l, v]) => (
          <article className="stat-card shadow-sm border-0 rounded-2xl bg-white p-4" key={l}>
            <span className="stat-label">{l}</span>
            <strong>{v}</strong>
          </article>
        ))}
      </div>
      <div className="letter-layout">
        <section className="panel shadow-sm border-0 rounded-2xl bg-white p-5">
          <div className="panel-title">
            <h2>Antrean permohonan</h2>
            <span>{pending.length} aktif</span>
          </div>
          <div className="letter-list">
            {data.surat.map((s) => (
              <button
                key={s.id}
                className={`letter-item ${active?.id === s.id ? "selected" : ""}`}
                onClick={() => setActiveId(s.id)}
              >
                <span className="eyebrow">{s.jenis}</span>
                <strong>{s.nama}</strong>
                <small>
                  NIK {s.nik} · Blok {s.blok}/{s.noRumah}
                </small>
                <span
                  className={`badge ${
                    s.status === "disetujui"
                      ? "success"
                      : s.status === "revisi" || s.status === "ditolak"
                      ? "neutral"
                      : "warning"
                  }`}
                >
                  {label(s.status)}
                </span>
                <small>{formatRelatif(s.diajukanPada)}</small>
              </button>
            ))}
            {!data.surat.length && <div className="empty">Belum ada permohonan.</div>}
          </div>
        </section>
        <section className="panel letter-preview shadow-sm border-0 rounded-2xl bg-white p-5">
          {active ? (
            <Letter surat={active} busy={busy} pending={pending.includes(active)} decide={decide} />
          ) : (
            <div className="empty">Pilih surat untuk pratinjau.</div>
          )}
        </section>
      </div>
    </>
  );
}

function Letter({
  surat,
  busy,
  pending,
  decide,
}: {
  surat: SuratPengantar;
  busy: boolean;
  pending: boolean;
  decide: (id: string, s: "disetujui" | "revisi") => void;
}) {
  return (
    <>
      <div className="paper-head">
        <span className="stat-icon">
          <UiIcon name="location_city" size={22} />
        </span>
        <span>
          <strong>RUKUN TETANGGA 04 / RUKUN WARGA 08</strong>
          <b>KELURAHAN SUKAMAJU</b>
          <small>Kecamatan Cilandak · Jakarta Selatan</small>
        </span>
      </div>
      <div className="paper-rule" />
      <h2 className="font-bold">{surat.jenis}</h2>
      <p className="muted">Nomor: 042/RT.04/RW.08/{new Date().getFullYear()}</p>
      <p>Yang bertanda tangan di bawah ini, Ketua RT 04 / RW 08 Kelurahan Sukamaju, menerangkan warga berikut:</p>
      <div className="paper-data">
        {[
          ["Nama lengkap", surat.nama],
          ["NIK", surat.nik],
          ["Alamat", `Blok ${surat.blok} · Rumah ${surat.noRumah}`],
          ["Keperluan", surat.keperluan],
          ["Keterangan", surat.keterangan ?? "—"],
        ].map(([k, v]) => (
          <div key={k}>
            <span>{k}</span>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
      <div className="signature">
        <small>
          Hormat kami,
          <br />
          Ketua RT 04 / RW 08
        </small>
        <strong>BAMBANG SUTRISNO</strong>
      </div>
      <div className="letter-actions">
        <button className="button" disabled={busy || !pending} onClick={() => decide(surat.id, "revisi")}>
          Minta revisi
        </button>
        <button
          className="button primary"
          disabled={busy || !pending}
          onClick={() => decide(surat.id, "disetujui")}
        >
          <UiIcon name="check" size={16} /> Setujui surat
        </button>
      </div>
    </>
  );
}

function label(status: SuratStatus) {
  return (
    {
      menunggu: "Menunggu verifikasi",
      review: "Dalam review",
      menunggu_ttd: "Menunggu tanda tangan",
      disetujui: "Disetujui",
      revisi: "Perlu revisi",
      ditolak: "Ditolak",
    }[status]
  );
}
