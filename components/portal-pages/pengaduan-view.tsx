"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Plus, Download, Pencil, Trash2, X, Search, MapPin } from "lucide-react";
import { fetchAduanData } from "@/lib/data";
import { downloadCsv } from "@/lib/csv";
import { insertAduan, updateAduan, deleteAduan } from "@/lib/mutations";
import { aduanSchema, zodFieldErrors } from "@/lib/validation";
import type { Aduan, AduanStatus } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { Modal } from "@/components/modal";
import { CountUp } from "@/components/count-up";
import { DirectionalMotion } from "@/components/directional-motion";

const kosong: { judul: string; deskripsi: string; pelapor: string; lokasi: string; status: AduanStatus | "" } = {
  judul: "",
  deskripsi: "",
  pelapor: "",
  lokasi: "",
  status: "",
};

export function ComplaintsPage() {
  const [items, setItems] = useState<Aduan[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState<Aduan | null>(null);
  const [selected, setSelected] = useState<Aduan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(kosong);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filterTab, setFilterTab] = useState<"semua" | "perlu" | "selesai">("semua");
  const [searchQuery, setSearchQuery] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchAduanData();
      const list = res.aduan ?? [];
      setItems(list);
      setSelected((current) => list.find((item) => item.id === current?.id) ?? list[0] ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Pengaduan gagal dimuat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [refresh]);

  function startEdit(item?: Aduan) {
    setShowForm(true);
    setEditing(item ?? null);
    setForm(
      item
        ? { judul: item.judul, deskripsi: item.deskripsi, pelapor: item.pelapor, lokasi: item.lokasi, status: item.status }
        : kosong
    );
    setErrors({});
    window.setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = aduanSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget).entries()));
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setBusy(true);
    setErrors({});
    try {
      if (editing) await updateAduan(editing.id, parsed.data);
      else await insertAduan(parsed.data);
      setNotice(editing ? "Pengaduan diperbarui." : "Pengaduan berhasil diterbitkan.");
      setShowForm(false);
      setEditing(null);
      setForm(kosong);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Data gagal disimpan.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: Aduan) {
    if (!window.confirm(`Hapus pengaduan “${item.judul}”?`)) return;
    try {
      await deleteAduan(item.id);
      setNotice("Pengaduan dihapus.");
      if (selected?.id === item.id) setSelected(null);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Pengaduan gagal dihapus.");
    }
  }

  const safeItems = Array.isArray(items) ? items : [];

  function exportItems() {
    downloadCsv(
      "rekap-pengaduan.csv",
      ["Judul", "Deskripsi", "Pelapor", "Lokasi", "Status", "Dibuat pada"],
      safeItems.map((item) => [item.judul, item.deskripsi, item.pelapor, item.lokasi, item.status, item.dibuatPada])
    );
  }

  const active = safeItems.filter((item) => item.status !== "selesai").length;
  const selesai = safeItems.filter((item) => item.status === "selesai").length;

  const filteredItems = safeItems.filter((item) => {
    const matchSearch =
      item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pelapor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.lokasi.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    if (filterTab === "perlu") return item.status !== "selesai";
    if (filterTab === "selesai") return item.status === "selesai";
    return true;
  });

  return (
    <div className="portal-content complaint-page">

      {/* Page Header Komponen Utama */}
      <DirectionalMotion direction="up"><PageHeader
        title="Pengaduan Warga Desa dan Warta"
        description="Tindak lanjuti laporan warga dan kelola informasi yang dibagikan ke lingkungan RT."
        actions={
          <>
        <button className="px-3 py-2.5 rounded-xl  flex flex-row gap-2 items-center justify-center font-bold shadow-sm bg-surface text-on-surface hover:bg-primary hover:text-white transition-colors" onClick={exportItems}>
          <Download size={16} /> Unduh rekap bulanan
        </button>
            <button
              className="button primary hover:opacity-95 transition-opacity  flex flex-row gap-2 items-center justify-center shadow-xs"
              style={{ backgroundColor: "#1D4533", color: "#FFFFFF" }}
              onClick={() => startEdit()}
            >
              <Plus size={16} /> Terbitkan warta
            </button>
          </>
        }
      /></DirectionalMotion>

      {/* Grid Statistik (Article Warna Putih) */}
      <div className="stat-grid compact-stats three-stats" role="group" aria-label="Ringkasan pengaduan">
        <DirectionalMotion as="article" direction="left" className="stat-card"><span className="stat-label">Total laporan masuk</span><strong><CountUp value={safeItems.length} /></strong></DirectionalMotion>
        <DirectionalMotion as="article" direction="up" delay={0.04} className="stat-card"><span className="stat-label">Sedang ditindaklanjuti</span><strong><CountUp value={active} /></strong></DirectionalMotion>
        <DirectionalMotion as="article" direction="right" delay={0.08} className="stat-card"><span className="stat-label">Laporan selesai</span><strong><CountUp value={selesai} /></strong></DirectionalMotion>
      </div>

      {/* Bar Filter & Pencarian */}
      <DirectionalMotion direction="left" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="filter-tabs" role="group" aria-label="Filter status pengaduan">
          <button
            onClick={() => setFilterTab("semua")}
            aria-pressed={filterTab === "semua"}
            className={`filter-tab ${filterTab === "semua" ? "active" : ""}`}
          >
            Semua ({safeItems.length})
          </button>
          <button
            onClick={() => setFilterTab("perlu")}
            aria-pressed={filterTab === "perlu"}
            className={`filter-tab ${filterTab === "perlu" ? "active" : ""}`}
          >
            Perlu Tindakan ({active})
          </button>
          <button
            onClick={() => setFilterTab("selesai")}
            aria-pressed={filterTab === "selesai"}
            className={`filter-tab ${filterTab === "selesai" ? "active" : ""}`}
          >
            Selesai ({selesai})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5E3122]/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Cari judul, pelapor, atau lokasi"
            placeholder="Cari judul, pelapor, atau lokasi..."
            className="w-full bg-white shadow-xs text-xs rounded-xl pl-8 pr-3 py-2 text-[#1A2721] placeholder-[#5E3122]/50 outline-none border-0 focus:ring-1 focus:ring-[#1D4533]"
          />
        </div>
      </DirectionalMotion>

      {/* Notifikasi */}
      {notice && (
        <div className="bg-white shadow-xs rounded-xl p-3 text-xs flex justify-between items-center text-[#1D4533] border-0">
          <span>{notice}</span>
          <button onClick={() => setNotice("")} className="text-[#5E3122] hover:text-[#1A2721]">
            <X size={15} />
          </button>
        </div>
      )}
      {error && (
        <div className="bg-error-container text-on-error-container shadow-xs rounded-xl p-3 text-xs flex justify-between items-center border-0">
          <span>{error}</span>
          <button onClick={() => void refresh()} className="bg-error text-white px-2.5 py-1 rounded-lg text-[11px]">
            Coba lagi
          </button>
        </div>
      )}

      {/* Layout Utama 2 Kolom (Section Warna Putih) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Kolom Kiri: Antrean Laporan Warga */}
        <DirectionalMotion as="section" direction="left" className="complaint-queue">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-[#1A2721]">Antrean Laporan Warga</h2>
            <span className="text-[11px] text-[#5E3122]/70">Diperbarui otomatis</span>
          </div>

          {loading ? (
            <div></div>
          ) : (
            <div className="complaint-list">
              {filteredItems.map((item) => {
                const isSelected = selected?.id === item.id;
                return (
                  <article key={item.id} className={`complaint-row ${isSelected ? "selected" : ""}`}>
                    <button type="button" className="complaint-select" onClick={() => setSelected(item)} aria-pressed={isSelected}>
                      <span className="complaint-row-heading">
                        <strong>{item.judul}</strong>
                        <span
                          className={`badge ${item.status === "selesai" ? "success" : item.status === "koordinasi" ? "neutral" : "warning"}`}
                        >
                          {item.status === "selesai" ? "Selesai" : item.status === "koordinasi" ? "Koordinasi" : "Diproses"}
                        </span>
                      </span>
                      <p>{item.deskripsi}</p>
                      <span className="complaint-meta">
                        <span>{item.pelapor} · {item.lokasi}</span>
                        <time dateTime={item.dibuatPada}>{new Date(item.dibuatPada).toLocaleDateString("id-ID")}</time>
                      </span>
                    </button>
                    <div className="complaint-actions">
                      <button type="button" onClick={() => startEdit(item)} aria-label={`Edit pengaduan ${item.judul}`}><Pencil size={15} /></button>
                      <button type="button" onClick={() => void remove(item)} aria-label={`Hapus pengaduan ${item.judul}`}><Trash2 size={15} /></button>
                    </div>
                  </article>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="empty complaint-empty">
                  Belum ada pengaduan. Terbitkan warta atau catat laporan pertama.
                </div>
              )}
            </div>
          )}
        </DirectionalMotion>

        {/* Kolom Kanan: Disposisi Aduan & Warta Siaran */}
        <DirectionalMotion as="section" direction="right" className="complaint-detail-column">
          {/* Panel Disposisi Aduan RT */}
          <div className="disposition-panel">
            <div className="disposition-heading">
              <h2 className="font-bold">Detail pengaduan</h2>
              {selected && <span className={`badge ${selected.status === "selesai" ? "success" : selected.status === "koordinasi" ? "neutral" : "warning"}`}>
                {selected.status === "selesai" ? "Selesai" : selected.status === "koordinasi" ? "Koordinasi" : "Diproses"}
              </span>}
            </div>

            {selected ? (
              <div className="disposition-content">
                <h3 className="font-bold">{selected.judul}</h3>
                <p>{selected.deskripsi}</p>
                <dl>
                  <div><dt>Pelapor</dt><dd>{selected.pelapor}</dd></div>
                  <div><dt>Lokasi</dt><dd><MapPin size={14} /> {selected.lokasi}</dd></div>
                  <div><dt>Dilaporkan</dt><dd><time dateTime={selected.dibuatPada}>{new Date(selected.dibuatPada).toLocaleString("id-ID")}</time></dd></div>
                </dl>
                <button type="button" className="button  flex flex-row gap-2 items-center justify-center font-bold" onClick={() => startEdit(selected)}>
                  <Pencil size={15} /> Ubah pengaduan
                </button>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-[#5E3122]/70">Pilih salah satu laporan di sebelah kiri untuk melihat disposisi.</div>
            )}
          </div>

          {/* Panel Warta Siaran Aktif */}
          <div className="warta-panel">
            <div className="flex items-center justify-between border-b border-background pb-2">
              <h2 className="text-xs font-bold text-[#1A2721] uppercase tracking-wider">WARTA SIARAN AKTIF</h2>
              <span className="text-[10px] text-[#5E3122]/70">Minggu, 27 Okt</span>
            </div>

            <strong className="text-xs font-bold text-[#1A2721]">Jadwal Fogging Nyamuk & Kerja Bakti Lingkungan</strong>
            <p className="text-xs text-[#5E3122]/80 leading-relaxed">
              Pelaksanaan gotong royong serentak RT 04 mulai pukul 07.00 WIB. Mohon perwakilan tiap KK mempersiapkan wadah sampah di depan rumah.
            </p>

            <div className="flex items-center justify-between text-[11px] text-[#5E3122]/70 pt-2 border-t border-background">
              <span>Tersiar ke 84 KK</span>
              <button onClick={() => startEdit()} className="font-bold text-[#1D4533] hover:underline">
                Kelola Warta →
              </button>
            </div>
          </div>
        </DirectionalMotion>
      </div>

      {showForm && (
        <Modal
          title={editing ? "Edit pengaduan atau warta" : "Terbitkan pengaduan atau warta"}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
            setForm(kosong);
          }}
        >
              <form ref={formRef} onSubmit={(event) => void submit(event)} noValidate className="modal-form">
              <div className="form-grid">
                <Field name="judul" label="Judul" value={form.judul} placeholder="Contoh: Lampu jalan padam" onChange={(v) => setForm({ ...form, judul: v })} error={errors.judul} />
                <Field
                  name="pelapor"
                  label="Nama pelapor / pengurus"
                  value={form.pelapor}
                  placeholder="Masukkan nama pelapor"
                  onChange={(v) => setForm({ ...form, pelapor: v })}
                  error={errors.pelapor}
                />
                <Field name="lokasi" label="Lokasi" value={form.lokasi} placeholder="Contoh: Gang 2, Blok B" onChange={(v) => setForm({ ...form, lokasi: v })} error={errors.lokasi} />

                <label className="field">
                  <span>Status</span>
                  <select
                    name="status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as typeof form.status })}
                  >
                    <option value="" disabled hidden>Pilih status</option>
                    <option value="diproses">Diproses</option>
                    <option value="koordinasi">Koordinasi</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </label>

                <label className="field full-field">
                  <span>Deskripsi</span>
                  <textarea
                    name="deskripsi"
                    rows={4}
                    value={form.deskripsi}
                    onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                    placeholder="Jelaskan kondisi dan kebutuhan tindak lanjut"
                  />
                  {errors.deskripsi && <small className="field-error">{errors.deskripsi}</small>}
                </label>
              </div>

              <div className="form-actions">
                <button disabled={busy} className="button primary">
                  {busy ? "Menyimpan…" : editing ? "Simpan perubahan" : "Terbitkan"}
                </button>
              </div>
            </form>
        </Modal>
      )}
    </div>
  );
}

function Field({
  name,
  label,
  value,
  placeholder,
  onChange,
  error,
}: {
  name: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <small className="field-error">{error}</small>}
    </label>
  );
}
