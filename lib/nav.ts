export const NAV_ITEMS = [
  {
    key: "dashboard",
    href: "/",
    label: "Ringkasan & Dashboard",
    icon: "dashboard",
  },
  { key: "warga", href: "/warga", label: "Data Warga & KK", icon: "group" },
  {
    key: "keuangan",
    href: "/keuangan",
    label: "Keuangan & Iuran",
    icon: "account_balance_wallet",
  },
  {
    key: "surat",
    href: "/surat",
    label: "Surat & Administrasi",
    icon: "description",
  },
  {
    key: "pengaduan",
    href: "/pengaduan",
    label: "Pengaduan & Warta",
    icon: "campaign",
  },
  {
    key: "pengaturan",
    href: "/pengaturan",
    label: "Pengaturan & Hak Akses",
    icon: "admin_panel_settings",
  },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]["key"];
