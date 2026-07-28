import { getAssignedSubscriptions } from "@/lib/pharmacy-actions";
import { PharmacyRefillsTable } from "./pharmacy-refills-table";
import { Icon } from "@/components/ui/icon";

export default async function PharmacyRefillsPage() {
  const subscriptions = await getAssignedSubscriptions();

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
            Refill Requests
          </h1>
          <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <Icon name="bolt" className="text-brand-teal" opticalSize={16} fill />
            View assigned subscriptions and log medication fulfillment
          </p>
        </div>
      </div>

      <PharmacyRefillsTable initialSubscriptions={subscriptions} />
    </div>
  );
}

