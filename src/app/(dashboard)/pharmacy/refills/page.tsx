import { getAssignedSubscriptions } from "@/lib/pharmacy-actions";
import { PharmacyRefillsTable } from "./pharmacy-refills-table";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default async function PharmacyRefillsPage() {
  const subscriptions = await getAssignedSubscriptions();

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/pharmacy" },
          { label: "Refills & Subscriptions" },
        ]}
      />
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Refill Requests</h2>
        <p className="text-muted-foreground">
          View assigned subscriptions and log medication fulfillment.
        </p>
      </div>

      <PharmacyRefillsTable initialSubscriptions={subscriptions} />
    </div>
  );
}
