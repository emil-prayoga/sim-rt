import { connection } from "next/server";
import type { NavKey } from "@/lib/nav";
import { PeriodChip } from "@/components/period-chip";
import { ResponsiveSidebar } from "@/components/responsive-sidebar";

type AppShellProps = {
  active: NavKey;
  children: React.ReactNode;
};

export async function AppShell({ active, children }: AppShellProps) {
  await connection();
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      <ResponsiveSidebar active={active} />
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
