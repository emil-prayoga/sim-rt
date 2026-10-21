"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowDownLeft, ArrowUpRight, Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Modal } from "@/components/modal";
import { Toast } from "@/components/toast";
import { fetchKeuanganData } from "@/lib/data";
import { insertKasTransaksi, updateKasTransaksi } from "@/lib/mutations";
import { catatTransaksiSchema, zodFieldErrors } from "@/lib/validation";
import { formatRupiah, formatTanggal } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";
import type { KeuanganData, KasTransaksi } from "@/lib/types";
import { CountUp } from "@/components/count-up";
import { DirectionalMotion } from "@/components/directional-motion";

type Notice = { message: string; tone: "success" | "error" } | null;

export function KeuanganClient() {
  const [data, setData] = useState<KeuanganData | null>(null); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(""); 
  const [busy, setBusy] = useState(false); 
  const [notice, setNotice] = useState<Notice>(null); 
  const [showForm, setShowForm] = useState(false); 
  const [editing, setEditing] = useState<KasTransaksi | null>(null); 
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setData(await fetchKeuanganData());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Data keuangan gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = catatTransaksiSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget).entries()));
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setBusy(true);
    setErrors({});
    try {
      if (editing) await updateKasTransaksi(editing.id, parsed.data);
      else await insertKasTransaksi(parsed.data);
      setNotice({ message: editing ? "Transaksi diperbarui." : "Transaksi dicatat.", tone: "success" });
      setShowForm(false);
      setEditing(null);
      await refresh();
    } catch (e) {
      setNotice({ message: e instanceof Error ? e.message : "Transaksi gagal disimpan.", tone: "error" });
    } finally {
      setBusy(false);
    }
  }



  function exportCsv() {
    if (data) {
      downloadCsv(
        "buku-kas-rt.csv",
        ["Tanggal", "Jenis", "Kategori", "Jumlah", "Keterangan", "Terverifikasi"],
        data.kas.map((x) => [x.tanggal, x.jenis, x.kategori, x.jumlah, x.keterangan, x.verified ? "Ya" : "Tidak"])
      );
    }
  }

  function open(item?: KasTransaksi) {
    setEditing(item ?? null);
    setErrors({});
    setShowForm(true);
  }

  return (
    <div className="portal-content">
      <DirectionalMotion direction="up"><PageHeader
        title="Keuangan & Rekap Iuran Bulanan" 
        description="Catat pemasukan dan pengeluaran, lalu pantau pembayaran iuran warga."
        actions={
          <div className="flex items-center gap-2">
            <button 
              className="py-2.5 px-3 rounded-xl bg-surface hover:bg-[#1D4533] hover:text-white border border-outline-variant/40 text-on-surface font-bold text-sm flex items-center gap-2 transition-colors shadow-sm" 
              onClick={exportCsv} 
              disabled={!data}
            >
              <Download size={16}/> Ekspor CSV
            </button>
            <button 
              className="py-2.5 px-3 rounded-xl bg-primary text-on-primary font-bold text-sm flex items-center gap-2 hover:opacity-95 transition-opacity shadow-sm" 
              onClick={() => open()}
            >
              <Plus size={16}/> Catat transaksi
            </button>
          </div>
        } 
      /></DirectionalMotion>

      {loading && <div></div>}
      
      {error && (
        <div className="p-4 rounded-xl bg-error-container text-on-error-container text-sm flex items-center justify-between shadow-sm">
          <span>{error}</span>
          <button className="px-3 py-1.5 rounded-lg bg-error text-on-error font-medium text-xs hover:opacity-90" onClick={() => void refresh()}>Coba lagi</button>
        </div>
      )}

      {!loading && data && !error && <FinanceView data={data} edit={open} remove={(x) => void (x)} />}

      {showForm && (
        <Modal
          title={editing ? "Edit transaksi kas" : "Catat transaksi kas"}
          onClose={() => setShowForm(false)}
        >
            <form onSubmit={(e) => void save(e)} noValidate className="modal-form">
              <div className="form-grid">
                <Input name="tanggal" label="Tanggal transaksi" type="date" defaultValue={editing?.tanggal ?? new Date().toISOString().slice(0, 10)} />
                <label className="field">
                  <span>Jenis transaksi *</span>
                  <select name="jenis" defaultValue={editing?.jenis ?? ""}>
                    <option value="" disabled hidden>Pilih jenis transaksi</option>
                    <option value="masuk">Pemasukan</option>
                    <option value="keluar">Pengeluaran</option>
                  </select>
                </label>
                <Input name="kategori" label="Kategori" defaultValue={editing?.kategori} placeholder="Contoh: Iuran bulanan" />
                <Input name="jumlah" label="Jumlah rupiah" type="number" defaultValue={editing ? String(editing.jumlah) : ""} placeholder="Contoh: 100000" />
                <label className="field full-field">
                  <span>Keterangan *</span>
                  <textarea name="keterangan" rows={3} defaultValue={editing?.keterangan ?? ""} placeholder="Jelaskan tujuan atau sumber transaksi" />
                </label>
              </div>

              {Object.entries(errors).map(([k, v]) => (
                <small key={k} className="text-xs text-error font-medium">{k}: {v}</small>
              ))}

              <div className="form-actions">
                <button disabled={busy} className="w-full button primary">
                  {busy ? "Menyimpan…" : editing ? "Simpan perubahan" : "Simpan transaksi"}
                </button>
              </div>
            </form>
        </Modal>
      )}

      {notice && <Toast message={notice.message} tone={notice.tone} onDismiss={() => setNotice(null)} />}
    </div>
  );
}

function FinanceView({ data, edit, remove }: { data: KeuanganData; edit: (x: KasTransaksi) => void; remove: (x: KasTransaksi) => void }) {
  const stats: [string, number][] = [
    ["Saldo kas", data.saldo],
    ["Pemasukan bulan ini", data.pemasukan],
    ["Pengeluaran bulan ini", data.pengeluaran],
    ["Tunggakan iuran", data.tunggakan]
  ];
  const max = Math.max(...data.trend.map((x) => Math.max(x.masuk, x.keluar)), 1);

  return (
    <div className="finance-overview">
      <div className="stat-grid compact-stats" role="group" aria-label="Ringkasan keuangan">
        {stats.map(([l, v], index) => (
          <DirectionalMotion as="article" direction={(["left", "up", "down", "right"] as const)[index]} delay={index * 0.035} className="stat-card" key={l}>
            <span className="stat-label">{l}</span>
            <strong><CountUp value={v} format="rupiah" /></strong>
          </DirectionalMotion>
        ))}
      </div>

      <div className="finance-columns">
        <DirectionalMotion as="section" direction="left" className="finance-panel dues-panel">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <h2 className="text-base font-bold text-on-surface">Rekap iuran · {data.periodeLabel}</h2>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container">{data.tunggakanKk} KK belum lunas</span>
          </div>
          <div className="flex flex-col gap-1 p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <strong className="text-2xl font-bold text-on-surface">{formatRupiah(data.pemasukan)}</strong>
            <span className="text-xs text-on-surface-variant">dari target {formatRupiah(data.targetPemasukan)}</span>
            <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden mt-3">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(data.targetPemasukan ? (data.pemasukan / data.targetPemasukan) * 100 : 0, 100)}%` }} />
            </div>
            <small className="text-[11px] text-on-surface-variant mt-1.5">{data.transaksiTerverifikasi} pembayaran tercatat</small>
          </div>
          <div className="flex flex-col divide-y divide-outline-variant/20">
            {data.iuran.slice(0, 8).map((b) => (
              <div className="py-3 flex items-center justify-between first:pt-0 last:pb-0" key={b.id}>
                <div>
                  <strong className="block text-sm font-semibold text-on-surface">{b.namaKepala}</strong>
                  <small className="text-xs text-on-surface-variant">Blok {b.blok} · Rumah {b.noRumah}</small>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${b.status === "lunas" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                  {b.status === "lunas" ? "Lunas" : "Belum lunas"}
                </span>
              </div>
            ))}
          </div>
        </DirectionalMotion>

        <DirectionalMotion as="section" direction="right" className="finance-panel ledger-panel">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <h2 className="text-base font-bold text-on-surface">Buku kas</h2>
            <span className="text-xs font-medium text-on-surface-variant">{data.kas.length} transaksi</span>
          </div>
          <div className="flex flex-col divide-y divide-outline-variant/20">
            {data.kas.slice(0, 9).map((x) => (
              <div className="py-3 flex items-center gap-3 first:pt-0 last:pb-0" key={x.id}>
                <span className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${x.jenis === "masuk" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                  {x.jenis === "masuk" ? <ArrowDownLeft size={17} /> : <ArrowUpRight size={17} />}
                </span>
                <div className="flex-1 min-w-0">
                  <strong className="block text-sm font-semibold text-on-surface truncate">{x.kategori}</strong>
                  <small className="block text-xs text-on-surface-variant truncate">{formatTanggal(x.tanggal)}</small>
                  <small className="block text-xs text-on-surface-variant truncate"> {x.keterangan}</small>
                </div>
                <div className="ledger-actions">
                  <strong className={`text-sm font-bold shrink-0 ${x.jenis === "masuk" ? "text-emerald-700" : "text-rose-700"}`}>
                    {x.jenis === "masuk" ? "+" : "-"}{formatRupiah(x.jumlah)}
                  </strong>
                </div>
              </div>
            ))}
            {!data.kas.length && <div className="py-8 text-center text-xs text-on-surface-variant bg-surface-container-low rounded-xl border border-dashed border-outline-variant/40">Belum ada transaksi kas.</div>}
          </div>
        </DirectionalMotion>
      </div>
    </div>
  );
}

function Input({ name, label, type = "text", defaultValue, placeholder }: { name: string; label: string; type?: string; defaultValue?: string; placeholder?: string }) { 
  return (
    <label className="field">
      <span>{label} *</span>
      <input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} />
    </label>
  ); 
}
