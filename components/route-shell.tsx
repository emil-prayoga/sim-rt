import { Suspense, type ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { AuthGate } from "@/components/auth-gate";
import type { NavKey } from "@/lib/nav";

export function RouteShell({ active, children }: { active: NavKey; children: ReactNode }) {
  return <Suspense fallback={<div className="auth-screen"><div className="auth-loading">Memuat portal SiRT…</div></div>}><AuthGate><AppShell active={active}>{children}</AppShell></AuthGate></Suspense>;
}
