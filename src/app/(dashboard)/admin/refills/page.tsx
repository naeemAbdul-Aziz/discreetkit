import { getRefillSubscriptions, getPharmacies } from "@/lib/admin-actions";
import { RefillsTable } from "./refills-table";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default async function RefillsPage() {
  const [subscriptions, pharmacies] = await Promise.all([
    getRefillSubscriptions(),
    getPharmacies(),
  ]);

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Refill Subscriptions" },
        ]}
      />
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Refill Management</h2>
        <p className="text-muted-foreground">
          Verify prescriptions and assign refill subscriptions to partner
          pharmacies.
        </p>
      </div>

      <RefillsTable
        initialSubscriptions={subscriptions}
      />
    </div>
  );
}
