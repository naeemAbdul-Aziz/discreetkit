import { Suspense } from "react";
import { 
    MetricsGrid, 
    RevenueTimeline, 
    RankingsGrid, 
} from "./dashboard-components";
import { 
    MetricsSkeleton, 
    ChartSkeleton, 
    RankingsSkeleton, 
} from "./skeletons";
import { AdminRealtimeRefresh } from "./realtime-refresh";
import { getOperationsStats, getLiveDeliveries } from "@/lib/admin-actions";
import OpsMetrics from "./operations/ops-metrics";
import LiveDeliveriesTable from "./operations/live-deliveries-table";
import { RefreshButton } from "./operations/refresh-button";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

/**
 * High-Performance Admin Command Center (FAANG Aesthetic)
 */
export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const range = params.range || "30d";

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      {/* Real-time sync bridge */}
      <AdminRealtimeRefresh />

      {/* ── HEADER ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase tracking-[0.2em] leading-none">
            Operations Control
          </h1>
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.3em]">
            Real-time logistics & escalation management intelligence
          </p>
        </div>
        <RefreshButton />
      </div>

      {/* ── LIVE OPERATIONS PULSE ─────────────────────────────────── */}
      <div className="space-y-6">
        <Suspense fallback={<OpsMetricsSkeleton />}>
            <OpsMetricsLoader />
        </Suspense>

        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">
                    Live Logistics Stream
                </h3>
            </div>
            <Suspense fallback={<TableSkeleton />}>
                <LiveDeliveriesLoader />
            </Suspense>
        </div>
      </div>

      {/* ── FINANCIAL & PERFORMANCE INTEL ─────────────────────────── */}
      <div className="pt-10 border-t border-slate-100 space-y-8">
        <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase tracking-widest">
                Platform Intelligence
            </h2>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">
                Fiscal performance & unit ranking aggregates
            </p>
        </div>

        <Suspense fallback={<MetricsSkeleton />}>
            <MetricsGrid />
        </Suspense>

        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Suspense fallback={<ChartSkeleton />}>
                    <RevenueTimeline />
                </Suspense>
            </div>
            <div className="lg:col-span-1">
                <Suspense fallback={<RankingsSkeleton />}>
                    <RankingsGrid />
                </Suspense>
            </div>
        </div>
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

function OpsMetricsSkeleton() {
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
                <Skeleton key={i} className="h-16 w-full rounded-3xl bg-slate-50/50" />
            ))}
        </div>
    );
}
