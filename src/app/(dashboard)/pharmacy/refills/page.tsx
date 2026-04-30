import { getAssignedSubscriptions } from "@/lib/pharmacy-actions";
import { PharmacyRefillsTable } from "./pharmacy-refills-table";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default async function PharmacyRefillsPage() {
  const subscriptions = await getAssignedSubscriptions();

  return (
    <DashboardShell
        title="REFILL_MATRIX"
        subtitle="Manage assigned enrollees and log real-time medication fulfillment"
        breadcrumbs={[{ label: 'PHARMACY_ROOT', href: '/pharmacy/dashboard' }, { label: 'REFILL_MATRIX' }]}
    >
      <PharmacyRefillsTable initialSubscriptions={subscriptions} />
    </DashboardShell>
  );
}
