import { Suspense } from "react";
import { getOperationsStats, getLiveDeliveries } from "@/lib/admin-actions";
import OpsMetrics from "./ops-metrics";
import LiveDeliveriesTable from "./live-deliveries-table";
import { RefreshButton } from "./refresh-button";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Truck, Zap, ShieldCheck, Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Logistics Control Dashboard
 * Real-time operational intelligence matrix
 */
export default async function OperationsDashboard() {
  return (
    <DashboardShell
        title="OPERATIONS_CONTROL"
        subtitle="Real-time logistics, fulfillment latency & escalation management intelligence"
        breadcrumbs={[{ label: 'MASTER_CONTROL', href: '/admin' }, { label: 'OPERATIONS_CONTROL' }]}
    >
      <div className="space-y-16">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 px-4">
            <div className="flex items-center gap-8">
                <div className="h-16 w-16 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                    <Activity className="h-8 w-8 text-brand-teal" />
                </div>
                <div className="space-y-3">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Operational Metrics Matrix</h2>
                    <div className="flex items-center gap-4">
                        <div className="h-1 w-8 bg-brand-teal rounded-full" />
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Global logistics health & fulfillment velocity monitoring</p>
                    </div>
                </div>
            </div>
            <RefreshButton />
        </div>

        <Suspense fallback={<MetricsSkeleton />}>
            <OpsMetricsLoader />
        </Suspense>

        <div className="rounded-[40px] border border-slate-100 bg-white shadow-2xl shadow-slate-900/5 p-12 overflow-hidden transition-none mx-4">
            <div className="flex items-center gap-8 mb-16 px-4">
                <div className="h-16 w-16 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                    <Truck className="h-8 w-8 text-brand-teal" />
                </div>
                <div className="space-y-3">
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Live Logistics Stream</h2>
                    <div className="flex items-center gap-4">
                        <div className="h-1 w-8 bg-brand-teal rounded-full" />
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Active fulfillment node tracking & protocol monitoring</p>
                    </div>
                </div>
            </div>
            <Suspense fallback={<TableSkeleton />}>
                <LiveDeliveriesLoader />
            </Suspense>
        </div>
      </div>
    </DashboardShell>
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
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 px-4">
            {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-40 w-full rounded-[40px] bg-slate-50/50" />
            ))}
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="p-16 space-y-16">
            <div className="space-y-10">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-full bg-slate-50/30" />
                ))}
            </div>
            <div className="flex flex-col items-center justify-center py-40 gap-8">
                <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center animate-pulse">
                    <Loader2 className="h-10 w-10 text-brand-teal animate-spin" />
                </div>
                <div className="space-y-3 text-center">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] leading-none">SYNCHRONIZING_LOGISTICS_MATRIX</p>
                    <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.3em]">Calibrating global operational telemetry from all fulfillment nodes...</p>
                </div>
            </div>
        </div>
    );
}
