import Link from "next/link";
import { connection } from "next/server";
import { NAV_ITEMS, type NavKey } from "@/lib/nav";
import { isSupabaseConfigured } from "@/lib/env";
import { PeriodChip } from "@/components/period-chip";
import { UiIcon } from "@/components/ui-icon";
import { SignOutButton } from "@/components/sign-out-button";

type AppShellProps = {
  active: NavKey;
  children: React.ReactNode;
};

const MOBILE_NAV_LABELS: Record<NavKey, string> = {
  dashboard: "Ikhtisar",
  warga: "Warga",
  keuangan: "Keuangan",
  surat: "Surat",
  pengaduan: "Aduan",
  pengaturan: "Setelan",
};

export async function AppShell({ active, children }: AppShellProps) {
  await connection();
  const supabaseAktif = isSupabaseConfigured();

  return (
    // 1. Kunci layar utama agar tinggi tepat 100vh dan matikan scroll global
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      
      {/* 2. Sidebar dikunci di kiri (Fixed/Sticky-like dalam flex container) */}
      <aside className="w-72 h-full bg-primary text-on-primary z-50 flex flex-col justify-between shrink-0 shadow-lg select-none">
        <div className="flex flex-col min-h-0">
          {/* Header Sidebar */}
          <div className="p-space-lg flex items-center gap-space-sm border-b border-white/10 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <UiIcon name="location_city" />
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-white leading-none tracking-tight">
                SiRT
              </span>
              <span className="font-label-sm text-label-sm text-surface-container-high/80 uppercase tracking-wider mt-1">
                RT 04 / RW 08
              </span>
            </div>
          </div>

          {/* Menu Navigasi - Bisa di-scroll internal jika menu sangat banyak */}
          <div className="px-space-md pt-space-md overflow-y-auto flex-1">
            <span className="font-label-sm text-label-sm text-surface-container-high/60 uppercase tracking-wider px-space-sm mb-space-xs block">
              Menu Administrasi
            </span>
            <nav aria-label="Navigasi utama" className="flex flex-col gap-space-xs pb-4">
              {NAV_ITEMS.map((item) => {
                const aktif = item.key === active;
                return (
                  <Link
                    key={item.key}
                    aria-label={item.label}
                    aria-current={aktif ? "page" : undefined}
                    className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-xl transition-all duration-200 font-label-lg text-label-lg ${
                      aktif
                        ? "bg-white text-primary font-bold shadow-sm"
                        : "text-surface-container-low hover:bg-white/10 hover:text-white"
                    }`}
                    href={item.href}
                  >
                    <UiIcon name={item.icon} />
                    <span className="nav-label">
                      <span className="nav-label-full">{item.label}</span>
                      <span className="nav-label-short">{MOBILE_NAV_LABELS[item.key]}</span>
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer Sidebar - Selalu Nempel di Bawah Sidebar */}
        <div className="p-space-md bg-black/15 border-t border-white/10 flex items-center justify-between shrink-0">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="font-label-md text-label-md text-white font-medium truncate">
              Kelurahan Sukamaju
            </span>
            <span className="font-label-sm text-label-sm text-surface-container-high/70 truncate">
              Kecamatan Cilandak
            </span>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* 3. Area Konten Kanan - Terpisah dan memiliki Scrollbar Sendiri (overflow-y-auto) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
        <header className="shell-header sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shrink-0">
          <div className="shell-header-inner px-space-lg py-space-sm flex items-center justify-between">
            <div className="shell-identity">
              <div>
                <span className="shell-kicker text-xs text-on-surface-variant uppercase tracking-wider block">Portal administrasi</span>
                <h1 className="text-xl font-bold text-on-surface">RT 04 <span className="font-normal text-on-surface-variant">/ RW 08</span></h1>
              </div>
            </div>
            <div className="shell-meta flex items-center gap-2">
              <span className="shell-period"><PeriodChip /></span>
            </div>
          </div>
        </header>

        <main className="flex-1 px-space-lg py-space-lg flex flex-col gap-space-lg">
          {children}
        </main>
      </div>
    </div>
  );
}