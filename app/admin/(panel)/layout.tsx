import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { demoAdminCredentials, requireAdmin } from "@/lib/auth";
import { countPendingDonations } from "@/lib/donation-store";

export default async function PanelLayout({ children }: { children: ReactNode }) {
  await requireAdmin();
  const pendingDonations = await countPendingDonations();
  return <AdminShell email={demoAdminCredentials.email} pendingDonations={pendingDonations}>{children}</AdminShell>;
}
