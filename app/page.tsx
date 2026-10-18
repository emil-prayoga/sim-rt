import { RouteShell } from "@/components/route-shell";
import { PortalClient } from "@/components/portal-client";

export default function DashboardPage() {
  return <RouteShell active="dashboard"><PortalClient section="dashboard" /></RouteShell>;
}
