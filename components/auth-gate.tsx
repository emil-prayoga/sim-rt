"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Zap,
  Smartphone,
  ShieldAlert,
} from "lucide-react";
import { isSupabaseConfigured } from "@/lib/env";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { loginSchema, zodFieldErrors } from "@/lib/validation";

type AccessState =
  | "loading"
  | "signed-out"
  | "signed-in"
  | "demo-loading"
  | "demo-signed-out"
  | "demo-signed-in";

const DEMO_EMAIL = "admin@sirt.demo";
const DEMO_PASSWORD = "SirtDemo04!";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const [access, setAccess] = useState<AccessState>(() =>
    isSupabaseConfigured() ? "loading" : "demo-loading"
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      const timer = window.setTimeout(() => {
        setAccess(
          window.sessionStorage.getItem("sirt-demo-session") === "active"
            ? "demo-signed-in"
            : "demo-signed-out"
        );
      }, 0);
      return () => window.clearTimeout(timer);
    }
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) setAccess(data.session ? "signed-in" : "signed-out");
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccess(session ? "signed-in" : "signed-out");
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const parsed = loginSchema.safeParse(values);
    
    if (!parsed.success) {
      setFieldErrors(zodFieldErrors(parsed.error));
      return;
    }
    
    const supabase = getSupabaseBrowserClient();
    setBusy(true);
    setMessage("");
    setFieldErrors({});

    if (!supabase) {
      if (
        parsed.data.email.toLowerCase() === DEMO_EMAIL &&
        parsed.data.password === DEMO_PASSWORD
      ) {
        window.sessionStorage.setItem("sirt-demo-session", "active");
        setAccess("demo-signed-in");
      } else {
        setMessage("Akun demo tidak cocok. Gunakan kredensial demo yang tertera.");
      }
      setBusy(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) setMessage("Email atau kata sandi salah, atau akun belum terdaftar.");
    setBusy(false);
  }

  if (access === "demo-signed-in" || access === "signed-in") {
    return <>{children}</>;
  }

  if (access === "loading" || access === "demo-loading") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-[#1D4533] font-semibold text-lg bg-white px-6 py-4 rounded-2xl shadow-md">
          <ShieldCheck size={24} />
          Memeriksa sesi admin…
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page min-h-screen w-full flex flex-col md:flex-row bg-background font-sans">
      {/* SISI KIRI - Hero Section (Marun) */}
      <section className="auth-hero-panel md:w-1/2 bg-[#1D4533] rounded-xl md:rounded-none text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden min-h-[400px] md:min-h-screen">
        {/* Pattern Dots Atas Kiri */}
        <div className="absolute top-8 left-8 opacity-20 pointer-events-none">
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
            ))}
          </div>
        </div>

        {/* Badge Top Left */}
        <div className="relative z-10 flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-200 font-medium">
          <span className="w-2.5 h-2.5 bg-emerald-400" />
          Sistem Informasi RT
        </div>

        {/* Branding Central Content */}
        <div className="relative z-10 my-auto text-center max-w-md mx-auto flex flex-col items-center">
          {/* Logo Icon */}
          <div className="w-16 h-16 mb-6 flex items-center justify-center text-white">
            <svg
              className="w-14 h-14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3">
            SiRT Digital
          </h1>
          <p className="text-emerald-100/80 text-sm md:text-base leading-relaxed mb-8">
            Layanan administrasi dan kependudukan RT modern, cepat, serta terpercaya dalam satu sentuhan.
          </p>

          {/* Indicator bar kecil */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 rounded-full bg-white/30" />
            <div className="w-2 h-2 rounded-full bg-white" />
            <div className="w-8 h-1 rounded-full bg-white/30" />
          </div>
        </div>

        {/* Feature Badges Bottom Left */}
        <div className="relative z-10 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-200">
              <Zap size={18} />
            </div>
            <span className="text-xs font-medium text-emerald-100">Modern & Cepat</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-200">
              <Smartphone size={18} />
            </div>
            <span className="text-xs font-medium text-emerald-100">Akses Fleksibel</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-200">
              <ShieldAlert size={18} />
            </div>
            <span className="text-xs font-medium text-emerald-100">Aman Terlindungi</span>
          </div>
        </div>
      </section>

      {/* SISI KANAN - Form Card (Krem/Putih) */}
      <section className="md:w-1/2 p-6 md:p-12 flex items-center justify-center">
        <div className="login-panel w-full max-w-md bg-white rounded-3xl p-8 md:p-10 shadow-xl shadow-black/5 border border-black/5">
          <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1D4533] tracking-tight">
              Selamat Datang Kembali
            </h2>
          <p className="text-xs text-[#26150f] mt-1">
              Masukkan kredensial Anda untuk melanjutkan
            </p>
          </div>

          <form onSubmit={signIn} noValidate className="space-y-5">
            {/* Input Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#321c15] block">
                Email
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 text-[#321c15]" size={18} />
                <input
                  name="email"
                  type="email"
                  autoComplete="username"
                  defaultValue={access === "demo-signed-out" ? DEMO_EMAIL : undefined}
                  placeholder={
                    access === "demo-signed-out" ? DEMO_EMAIL : "nama@email.com"
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4533]/20 focus:border-[#1D4533] transition-all"
                />
              </div>
              {fieldErrors.email && (
                <small className="text-xs text-red-600 block">{fieldErrors.email}</small>
              )}
            </div>

            {/* Input Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#321c15] block">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 text-[#321c15]" size={18} />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  defaultValue={access === "demo-signed-out" ? DEMO_PASSWORD : undefined}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4533]/20 focus:border-[#1D4533] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-[#321c15] hover:text-[#1D4533]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <small className="text-xs text-red-600 block">{fieldErrors.password}</small>
              )}
            </div>

            {/* Ingat Saya & Lupa Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#5E3122]">
                <input
                  type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-[#1D4533] focus:ring-[#1D4533]"
                />
                Ingat saya
              </label>
              <button
                type="button"
                className="font-medium text-[#1D4533] hover:underline"
              >
                Lupa password?
              </button>
            </div>

            {/* Error Message */}
            {message && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600">
                {message}
              </div>
            )}

            {/* Tombol Masuk */}
            <button
              type="submit"
              disabled={busy}
              className="w-full py-3 bg-[#1D4533] hover:bg-[#163427] text-white font-medium rounded-xl text-sm shadow-md shadow-[#1D4533]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {busy ? (
                "Memeriksa…"
              ) : (
                <>
                  Masuk
                </>
              )}
            </button>
          </form>

          {/* Banner Akun Demo jika Supabase Belum Terhubung */}
          {access === "demo-signed-out" && (
            <div className="mt-6 p-3.5 bg-[#F7EAE0] border border-[#1D4533]/10 rounded-2xl text-xs space-y-1">
              <span className="font-semibold text-[#1D4533] block">Kredensial Demo Admin:</span>
              <div className="text-[#5E3122]">Email: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#F9D2BA]">{DEMO_EMAIL}</code></div>
              <div className="text-[#5E3122]">Password: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#F9D2BA]">{DEMO_PASSWORD}</code></div>
            </div>
          )}

          {/* Footer Card */}
          <p className="text-center text-xs text-[#5E3122] mt-8">
            Belum punya akun?{" "}
            <span className="font-semibold text-[#1D4533] cursor-pointer hover:underline">
              Daftar sekarang
            </span>
          </p>
        </div>
      </section>
    </main>
  );
}
