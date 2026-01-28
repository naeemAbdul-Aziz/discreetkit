import { getPharmacyRefillSubscriptions } from "@/lib/pharmacy-actions";
import { PharmacyRefillsTable } from "./pharmacy-refills-table";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default async function PharmacyRefillsPage() {
  const subscriptions = await getPharmacyRefillSubscriptions();

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/pharmacy" },
          { label: "Refill Subscriptions" },
        ]}
      />
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Refill Subscriptions
        </h2>
        <p className="text-muted-foreground">
          Manage your assigned refill patients and due dates.
        </p>
      </div>

      <PharmacyRefillsTable initialSubscriptions={subscriptions} />
    </div>
  );
}
