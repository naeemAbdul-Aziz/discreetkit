import { getOperationsStats, getLiveDeliveries } from "@/lib/admin-actions";
import OpsMetrics from "./ops-metrics";
import LiveDeliveriesTable from "./live-deliveries-table";
import { RefreshButton } from "./refresh-button";

export const dynamic = "force-dynamic";

export default async function OperationsDashboard() {
  const stats = await getOperationsStats();
  const liveOrders = await getLiveDeliveries();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Operations Control
          </h1>
          <p className="text-muted-foreground">
            Real-time logistics and escalation management.
          </p>
        </div>
        <RefreshButton />
      </div>

      <OpsMetrics stats={stats} />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Live Deliveries
        </h2>
        <LiveDeliveriesTable orders={liveOrders} />
      </div>
    </div>
  );
}
