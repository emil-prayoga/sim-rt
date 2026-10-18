"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { KeyRound, Save, ShieldCheck, UserRound } from "lucide-react";
import { fetchPengaturanRT, PENGATURAN_DEFAULT, type PengaturanRT } from "@/lib/data";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { savePengaturanRT } from "@/lib/mutations";
import { pengaturanRTSchema, zodFieldErrors } from "@/lib/validation";
import { PageHeader } from "@/components/page-header";
const credentials = { email: "admin@sirt.demo", password: "SirtDemo04!" };
const keys: Array<[keyof PengaturanRT, string]> = [
  ["namaWilayah", "Nama wilayah"],
  ["rt", "Nomor RT"],
  ["rw", "Nomor RW"],
  ["kelurahan", "Kelurahan"],
  ["kecamatan", "Kecamatan"],
  ["ketua", "Nama ketua RT"],
  ["kontak", "Nomor kontak"],
  ["alamat", "Alamat sekretariat"],
];

export function SettingsPage() {
  const [settings, setSettings] = useState<PengaturanRT>(PENGATURAN_DEFAULT);
  const [email, setEmail] = useState("Akun demo lokal");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    let active = true;
    void Promise.all([
      fetchPengaturanRT(),
      getSupabaseBrowserClient()?.auth.getUser() ?? Promise.resolve(null),
    ])
      .then(([data, auth]) => {
        if (active) {
          setSettings(data);
          if (auth && !auth.error) setEmail(auth.data.user?.email ?? "Akun Supabase");
        }
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Pengaturan gagal dimuat.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = pengaturanRTSchema.safeParse(
      Object.fromEntries(new FormData(event.currentTarget).entries())
    );
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    setFieldErrors({});
    try {
      await savePengaturanRT(parsed.data);
      setSettings(parsed.data);
      setNotice("Profil RT tersimpan di Supabase.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Pengaturan gagal disimpan.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="portal-content">
      <PageHeader
        title="Sistem dan Tata Kelola"
        description="Atur profil wilayah RT dan tinjau informasi akses pengelola."
      />
      {error && (
        <div className="callout error-callout shadow-sm rounded-xl border-0" role="alert">
          {error}
        </div>
      )}
      {notice && (
        <div className="callout shadow-sm rounded-xl border-0" role="status">
          {notice}
        </div>
      )}
      <div className="settings-layout">
        <section className="panel settings-panel settings-profile">
          <div className="panel-title border-b-gray-100 border-b">
            <h2 className="mb-4">
              <UserRound size={18} /> Profil wilayah RT
            </h2>
            <span>Disimpan di Database</span>
          </div>
          {loading ? (
            <p className="muted">Memuat pengaturan…</p>
          ) : (
            <form ref={formRef} onSubmit={(event) => void submit(event)} noValidate className="settings-form -mt-4">
              <fieldset className="settings-field-group">
                <div className="form-grid">
                  {keys.slice(0, 5).map(([key, label]) => (
                    <label className="field" key={key}>
                      <span>{label}</span>
                      <input name={key} defaultValue={settings[key]} placeholder={`Masukkan ${label.toLowerCase()}`} />
                      {fieldErrors[key] && <small className="field-error">{fieldErrors[key]}</small>}
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="settings-field-group">
                <legend>Pengurus dan kontak</legend>
                <div className="form-grid">
                  {keys.slice(5).map(([key, label]) => (
                    <label className={`field ${key === "alamat" ? "full-field" : ""}`} key={key}>
                      <span>{label}</span>
                      {key === "alamat" ? (
                        <textarea name={key} rows={2} defaultValue={settings[key]} placeholder="Masukkan alamat sekretariat RT" />
                      ) : (
                        <input name={key} defaultValue={settings[key]} placeholder={`Masukkan ${label.toLowerCase()}`} />
                      )}
                      {fieldErrors[key] && <small className="field-error">{fieldErrors[key]}</small>}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="form-actions mt-4">
                <button
                  className="button primary flex flex-row gap-2 items-center justify-center"
                  disabled={busy}
                >
                  <Save size={16} />
                  {busy ? "Menyimpan…" : "Simpan profil RT"}
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="panel settings-panel settings-access">
          <div className="panel-title">
            <h2>
              <ShieldCheck size={18} /> Akun dan akses
            </h2>
            <span className="badge success">Terverifikasi</span>
          </div>
          <div className="account-card">
            <span className="stat-icon">
              <KeyRound size={20} />
            </span>
            <div>
              <small>Akun yang sedang masuk</small>
              <strong>{email}</strong>
              <p className="muted">Akses data dibatasi untuk pengguna Supabase Auth yang terdaftar.</p>
            </div>
          </div>
          <div className="access-note">
            <strong>Akun pengelola awal</strong>
            <span>Email: {credentials.email}</span>
            <span>Password: {credentials.password}</span>
            <small>
              Jalankan <code>node scripts/create-admin.mjs</code> setelah mengisi SUPABASE_URL dan
              SUPABASE_SERVICE_ROLE_KEY di .env.local. Ganti kata sandi setelah masuk.
            </small>
          </div>
          <div className="access-note">
            <strong>Hak akses pengguna</strong>
            <span>
              Tambah atau nonaktifkan pengguna melalui Supabase Dashboard → Authentication → Users.
              Service role hanya digunakan skrip provisioning lokal.
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
