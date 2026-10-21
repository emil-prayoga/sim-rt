"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
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
  const [isMobile, setIsMobile] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const [animateEntry, setAnimateEntry] = useState(false);
  const reduceMotion = useReducedMotion();
  const entryHandled = useRef(false);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 760px)");
    const updateViewport = () => setIsMobile(mobileQuery.matches);
    updateViewport();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMotionReady(true);
    mobileQuery.addEventListener("change", updateViewport);
    return () => mobileQuery.removeEventListener("change", updateViewport);
  }, []);

  useEffect(() => {
    if (entryHandled.current) return;
    entryHandled.current = true;

    const shouldAnimateEntry = window.sessionStorage.getItem("sirt-sidebar-entry") === "pending";
    if (shouldAnimateEntry) window.sessionStorage.removeItem("sirt-sidebar-entry");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnimateEntry(shouldAnimateEntry && window.location.pathname === "/" && !window.matchMedia("(max-width: 760px)").matches);
  }, []);

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
      <motion.aside
        id="main-sidebar"
        className={`app-sidebar${motionReady ? " motion-ready" : ""}`}
        aria-label="Menu utama"
        initial={false}
        animate={animateEntry ? { x: [-96, 0] } : { x: isMobile ? (open ? 0 : "-105%") : 0 }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 190, damping: 28, mass: 1.25 }}
        onAnimationComplete={() => { if (animateEntry) setAnimateEntry(false); }}
      >
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
      </motion.aside>
    </>
  );
}
