import { Suspense } from "react";
import { getOperationsStats, getLiveDeliveries } from "@/lib/admin-actions";
import OpsMetrics from "./ops-metrics-grid";
import LiveDeliveriesTable from "./live-deliveries-table";
import { RefreshButton } from "./refresh-button";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

/**
 * Logistics Overview (Server-Side Streaming)
 */
export default async function OperationsDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900 leading-none">
            Operations Control
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Real-time logistics and escalation management intelligence
          </p>
        </div>
        <RefreshButton />
      </div>

      <Suspense fallback={<MetricsSkeleton />}>
        <OpsMetricsLoader />
      </Suspense>

      <div className="space-y-4">
        <h3 className="text-xl font-black tracking-tight text-slate-900">
          Live Logistics Stream
        </h3>
        <Suspense fallback={<TableSkeleton />}>
            <LiveDeliveriesLoader />
        </Suspense>
      </div>
    </div>
  );
}

async function OpsMetricsLoader() {
    const stats = await getOperationsStats();
    return <OpsMetrics stats={stats} />;
}

async function LiveDeliveriesLoader() {
    const liveOrders = await getLiveDeliveries();
    return <LiveDeliveriesTable orders={liveOrders} />;
}

function MetricsSkeleton() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-32 w-full rounded-[2rem] bg-slate-50" />
            ))}
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl bg-slate-50/50" />
            ))}
        </div>
    );
}

