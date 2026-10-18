"use client";

import type { NavKey } from "@/lib/nav";
import { DashboardClient } from "@/components/portal-pages/dashboard-view";
import { WargaClient } from "@/components/portal-pages/warga-view";
import { KeuanganClient } from "@/components/portal-pages/keuangan-view";
import { SuratClient } from "@/components/portal-pages/surat-view";
import { ComplaintsPage } from "@/components/portal-pages/pengaduan-view";
import { SettingsPage } from "@/components/portal-pages/pengaturan-view";

/** Entry point tunggal untuk memilih halaman portal berdasarkan section. */
export function PortalClient({ section }: { section: NavKey }) {
  if (section === "dashboard") return <DashboardClient />;
  if (section === "warga") return <WargaClient />;
  if (section === "keuangan") return <KeuanganClient />;
  if (section === "surat") return <SuratClient />;
  if (section === "pengaduan") return <ComplaintsPage />;
  return <SettingsPage />;
}
