"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NAV_ITEMS, type NavKey } from "@/lib/nav";
import { UiIcon } from "@/components/ui-icon";
import { SignOutButton } from "@/components/sign-out-button";

type ResponsiveSidebarProps = { active: NavKey };

const MOBILE_NAV_LABELS: Record<NavKey, string> = {
  dashboard: "Ikhtisar", warga: "Warga", keuangan: "Keuangan",
  surat: "Surat", pengaduan: "Aduan", pengaturan: "Setelan",
};

export function ResponsiveSidebar({ active }: ResponsiveSidebarProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <>
      <button type="button" className="sidebar-menu-toggle"
        aria-label="Buka menu navigasi"
        aria-expanded={open} aria-controls="main-sidebar"
        onClick={() => setOpen((value) => !value)}>
        <UiIcon name="menu" size={22} />
      </button>
      {open && <button type="button" className="sidebar-scrim"
        aria-label="Tutup menu navigasi" onClick={() => setOpen(false)} />}
      <aside id="main-sidebar" className={`app-sidebar${open ? " is-open" : ""}`} aria-label="Menu utama">
        <div className="sidebar-top">
          <div className="sidebar-brand ">
            <div className="sidebar-brand-icon"><UiIcon name="location_city" /></div>
            <div className="sidebar-brand-copy">
              <span className="sidebar-brand-name">SiRT</span>
              <span className="sidebar-brand-meta">RT 04 / RW 08</span>
            </div>
            <button type="button" className="sidebar-close"
              aria-label="Tutup menu navigasi" onClick={() => setOpen(false)}>
              <UiIcon name="close" size={20} />
            </button>
          </div>
          <div className="sidebar-navigation">
            <span className="sidebar-section-label">Menu Administrasi</span>
            <nav aria-label="Navigasi utama">
              {NAV_ITEMS.map((item) => {
                const selected = item.key === active;
                return <Link key={item.key} href={item.href} aria-label={item.label}
                  aria-current={selected ? "page" : undefined}
                  className={`sidebar-link${selected ? " is-active" : ""}`}
                  onClick={() => setOpen(false)}>
                  <UiIcon name={item.icon} />
                  <span>{item.label}</span>
                  <span className="sidebar-link-short">{MOBILE_NAV_LABELS[item.key]}</span>
                </Link>;
              })}
            </nav>
          </div>
        </div>
        <div className="sidebar-footer">
          <div className="sidebar-footer-copy">
            <span>Kelurahan Sukamaju</span>
            <span>Kecamatan Cilandak</span>
          </div>
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}
