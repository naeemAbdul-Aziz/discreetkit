import { getOperationsStats, getLiveDeliveries } from "@/lib/admin-actions";
import OpsMetrics from "./ops-metrics";
import LiveDeliveriesTable from "./live-deliveries-table";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link"; // Changed from 'next/link' to standard import for refresh button if needed,
// actually using a simple refresh link is easiest for server components without client logic.

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
        <Link href="/admin/operations">
          <Button variant="outline" size="sm">
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </Link>
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
