"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Download, Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Modal } from "@/components/modal";
import { Toast } from "@/components/toast";
import { fetchWargaData } from "@/lib/data";
import { deleteKepalaKeluarga, insertKepalaKeluarga, updateKepalaKeluarga } from "@/lib/mutations";
import { downloadCsv } from "@/lib/csv";
import { addKepalaKeluargaSchema, zodFieldErrors } from "@/lib/validation";
import type { Warga, WargaData } from "@/lib/types";

type Notice = { message: string; tone: "success" | "error" } | null;

export function WargaClient() {
  const [data, setData] = useState<WargaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<Notice>(null);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Warga | null>(null);
  const [editing, setEditing] = useState<Warga | null>(null);
  
  const searchRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setData(await fetchWargaData());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Data warga gagal dimuat.");
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
    const parsed = addKepalaKeluargaSchema.safeParse(Object.fromEntries(new FormData(event.currentTarget).entries()));
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    setBusy(true);
    setErrors({});
    try {
      if (editing) await updateKepalaKeluarga(editing.id, parsed.data);
      else await insertKepalaKeluarga(parsed.data);
      setNotice({ message: editing ? "Data warga diperbarui." : "Data warga disimpan.", tone: "success" });
      setShowForm(false);
      setEditing(null);
      await refresh();
    } catch (e) {
      setNotice({ message: e instanceof Error ? e.message : "Penyimpanan gagal.", tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: Warga) {
    if (!window.confirm(`Hapus data ${item.namaKepala} beserta anggota dan tagihannya?`)) return;
    try {
      await deleteKepalaKeluarga(item.id);
      setNotice({ message: "Data warga dihapus.", tone: "success" });
      await refresh();
    } catch (e) {
      setNotice({ message: e instanceof Error ? e.message : "Penghapusan gagal.", tone: "error" });
    }
  }

  function exportCsv() {
    if (!data) return;
    downloadCsv(
      "data-warga-rt.csv",
      ["NIK", "Nama", "Nomor KK", "Blok", "Rumah", "Domisili", "Anggota", "WhatsApp", "Pekerjaan", "Bansos"],
      data.warga.map((w) => [w.nikKepala, w.namaKepala, w.noKk, w.blok, w.noRumah, w.statusDomisili, w.jumlahAnggota, w.noWa, w.pekerjaan, w.bansos])
    );
  }

  function openForm(item?: Warga) {
    setEditing(item ?? null);
    setErrors({});
    setShowForm(true);
  }

  const filteredWarga = (data?.warga ?? []).filter((w) =>
    `${w.namaKepala} ${w.noKk} ${w.nikKepala} ${w.blok} ${w.noRumah}`
      .toLocaleLowerCase("id-ID")
      .includes(query.trim().toLocaleLowerCase("id-ID"))
  );

  return (
    <div className="portal-content">
      <PageHeader
        title="Data Warga & Kartu Keluarga"
        description="Kelola data keluarga, status domisili, dan verifikasi dokumen warga."
        actions={
          <>
            <button className="py-2.5 px-3 rounded-xl font-bold  bg-white  hover:text-white hover:bg-[#1D4533] flex flex-row gap-2 items-center justify-center shadow-sm" onClick={exportCsv} disabled={!data || loading}>
              <Download size={16} /> Ekspor CSV
            </button>
            <button 
              className="button primary hover:opacity-95 transition-opacity  flex flex-row gap-2 items-center justify-center shadow-sm" 
              style={{ backgroundColor: "#1D4533", color: "#FFFFFF" }} 
              onClick={() => openForm()}
            >
              <Plus size={16} /> Tambah KK
            </button>
          </>
        }
      />

      {loading && <div className="callout shadow-sm rounded-xl">Memuat data warga…</div>}
      {error && (
        <div className="callout error-callout shadow-sm rounded-xl">
          {error}
          <button className="button flex flex-row gap-2 items-center justify-center shadow-sm" onClick={() => void refresh()}>
            Coba lagi
          </button>
        </div>
      )}

      {!loading && data && !error && (
        <>
          <div className="stat-grid compact-stats">
            {[
              ["Kepala keluarga", data.stats.totalKk],
              ["Total jiwa", data.stats.totalJiwa],
              ["Warga tetap", data.stats.wargaTetap],
              ["Verifikasi", `${(data.stats.verifikasiPersen * 100).toFixed(0)}%`],
            ].map(([label, value]) => (
              <article className="stat-card" key={label}>
                <span className="stat-label">{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>

        
            <section className="table-toolbar">
              <div>
                <h2>Direktori keluarga</h2>
                <p className="muted">Data kependudukan warga RT 04 / RW 08</p>
              </div>
              <label className="search-box">
                <Search size={17} />
                <span className="sr-only">Cari data keluarga</span>
                <input ref={searchRef} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Nama, NIK, nomor KK, atau alamat" />
              </label>
            </section>

            <div className="table-scroll">
              <table>
                <thead className="text-white">
                  <tr>
                    <th>Kepala keluarga</th>
                    <th>Nomor KK</th>
                    <th>Alamat</th>
                    <th>Anggota</th>
                    <th>Domisili</th>
                    <th>Verifikasi</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredWarga.map((w) => (
                      <tr key={w.id}>
                        <td>
                          <strong>{w.namaKepala}</strong>
                          <small>{w.pekerjaan ?? "Pekerjaan belum dicatat"}</small>
                        </td>
                        <td className="mono">{w.noKk}</td>
                        <td>Blok {w.blok} · {w.noRumah}</td>
                        <td>{w.jumlahAnggota} jiwa</td>
                        <td>
                          <span className="badge neutral">{w.statusDomisili}</span>
                        </td>
                        <td>
                          <span className={`badge ${w.ktpVerified && w.kkVerified ? "success" : "warning"}`}>
                            {w.ktpVerified && w.kkVerified ? "Terverifikasi" : "Perlu verifikasi"}
                          </span>
                        </td>
                        <td className="flex items-center gap-1.5 h-16 py-4">
                          <button className="icon-action hover:bg-[#CFE2D7]" onClick={() => setSelected(w)} aria-label="Lihat detail warga">
                            <Eye size={15} />
                          </button>
                          <button className="icon-action text-amber-500" onClick={() => openForm(w)} aria-label="Edit warga">
                            <Pencil size={15} />
                          </button>
                          <button className="icon-action danger-action" onClick={() => void remove(w)} aria-label="Hapus warga">
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  {!filteredWarga.length && (
                          <tr>
                      <td colSpan={7} className="table-empty">Tidak ada keluarga yang cocok dengan pencarian.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        </>
      )}

      {/* Modal Form */}
      {showForm && (
        <Modal title={editing ? "Edit kepala keluarga" : "Tambah kepala keluarga"} onClose={() => setShowForm(false)} className="modal-wide">
            <form key={editing?.id ?? "new"} ref={formRef} onSubmit={(e) => void save(e)} noValidate className="modal-form">
              <div className="form-grid">
                <TextField label="Nama kepala keluarga" name="namaKepala" value={editing?.namaKepala} placeholder="Masukkan nama lengkap" />
                <TextField label="NIK (16 digit)" name="nik" value={editing?.nikKepala} placeholder="Masukkan 16 digit NIK" />
                <TextField label="Nomor KK (16 digit)" name="noKk" value={editing?.noKk} placeholder="Masukkan 16 digit nomor KK" />
                <SelectField label="Blok" name="blok" value={editing?.blok ?? ""} placeholder="Pilih blok" options={[["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"]]} />
                <TextField label="Nomor rumah" name="noRumah" value={editing?.noRumah} placeholder="Contoh: 12 atau 12A" />
                <SelectField label="Status domisili" name="statusDomisili" value={editing?.statusDomisili ?? ""} placeholder="Pilih status domisili" options={[["tetap", "Tetap"], ["kontrak", "Kontrak"], ["sementara", "Sementara"]]} />
                <TextField label="Status hunian" name="kepemilikan" value={editing?.kepemilikan ?? ""} placeholder="Contoh: Milik sendiri" />
                <TextField label="WhatsApp" name="noWa" value={editing?.noWa ?? ""} placeholder="Contoh: 081234567890" />
                <TextField label="Jumlah anggota" name="jumlahAnggota" type="number" value={editing ? String(editing.jumlahAnggota) : ""} placeholder="Masukkan jumlah jiwa" />
                <TextField label="Pekerjaan" name="pekerjaan" required={false} value={editing?.pekerjaan ?? ""} placeholder="Masukkan pekerjaan (opsional)" />
                <SelectField label="Status bansos" name="bansos" value={editing?.bansos ?? ""} placeholder="Pilih status bansos" options={[["pending", "Belum dinilai"], ["eligible", "Layak"], ["non_eligible", "Tidak layak"]]} />
              </div>

              <div className="verification-fields">
                <strong className="text-sm font-semibold">Status verifikasi dokumen</strong>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" name="ktpVerified" defaultChecked={editing?.ktpVerified ?? false} className="w-4 h-4 rounded border-outline text-primary focus:ring-primary" />
                    <span>KTP terverifikasi</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" name="kkVerified" defaultChecked={editing?.kkVerified ?? false} className="w-4 h-4 rounded border-outline text-primary focus:ring-primary" />
                    <span>Kartu Keluarga terverifikasi</span>
                  </label>
                </div>
              </div>

              {Object.entries(errors).map(([key, msg]) => (
                <small className="field-error block mt-2" key={key}>{key}: {msg}</small>
              ))}

              <div className="form-actions mt-6 flex justify-center gap-2">
                <button className="w-full button primary shadow-sm" style={{ backgroundColor: "#1D4533", color: "#FFFFFF" }} disabled={busy}>
                  {busy ? "Menyimpan…" : "Simpan data"}
                </button>
              </div>
            </form>
        </Modal>
      )}

      {/* Modal Detail Warga */}
      {selected && (
        <Modal title={selected.namaKepala} onClose={() => setSelected(null)}>
            <div className="detail-grid">
              {[
                ["NIK", selected.nikKepala],
                ["Nomor KK", selected.noKk],
                ["Nama", selected.namaKepala],
                ["Pekerjaan", selected.pekerjaan ?? "Belum dicatat"],
                ["Usia", selected.usia === null ? "Belum dicatat" : selected.usia + " tahun"],
                ["Alamat", "Blok " + selected.blok + " · " + selected.noRumah],
                ["Status domisili", selected.statusDomisili],
                ["Kepemilikan", selected.kepemilikan ?? "Belum dicatat"],
                ["Jumlah anggota", selected.jumlahAnggota + " jiwa"],
                ["WhatsApp", selected.noWa ?? "Belum dicatat"],
                ["Verifikasi KTP", selected.ktpVerified ? "Terverifikasi" : "Belum diverifikasi"],
                ["Verifikasi KK", selected.kkVerified ? "Terverifikasi" : "Belum diverifikasi"],
                ["Status bansos", selected.bansos],
              ].map(([label, value]) => (
                <div key={label}>
                  <span >{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
        </Modal>
      )}

      {notice && <Toast message={notice.message} tone={notice.tone} onDismiss={() => setNotice(null)} />}
    </div>
  );
}

function TextField({ label, name, type = "text", value, placeholder, required = true }: { label: string; name: string; type?: string; value?: string | null; placeholder: string; required?: boolean }) {
  return (
    <label className="field">
      <span>{label}{required ? " *" : ""}</span>
      <input name={name} type={type} defaultValue={value ?? ""} placeholder={placeholder} />
    </label>
  );
}

function SelectField({ label, name, value, placeholder, options }: { label: string; name: string; value: string; placeholder: string; options: [string, string][] }) {
  return (
    <label className="field">
      <span>{label} *</span>
      <select name={name} defaultValue={value}>
        <option value="" disabled hidden>{placeholder}</option>
        {options.map(([v, l]) => (
          <option key={v} value={v} style={{ backgroundColor: "#FFFFFF", color: "#202924" }}>{l}</option>
        ))}
      </select>
    </label>
  );
}
