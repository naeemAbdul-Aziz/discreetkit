import { Suspense } from "react";
import { 
    MetricsGrid, 
    RevenueTimeline, 
    RankingsGrid, 
    ActivityPulse 
} from "./dashboard-components";
import { 
    MetricsSkeleton, 
    ChartSkeleton, 
    RankingsSkeleton, 
    PulseSkeleton 
} from "./skeletons";
import { AdminRealtimeRefresh } from "./realtime-refresh";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

/**
 * High-Performance Admin Dashboard (Server-Side Streaming)
 * @description Transitions the core admin experience to sub-second LCP
 *              via parallel data fetching and progressive hydration.
 */
export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const range = params.range || "30d";

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* Real-time sync bridge (Lightweight Client Component) */}
      <AdminRealtimeRefresh />

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase tracking-widest">
            Management Dashboard
        </h1>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">
            Real-time Operational Overview & Strategic Data Link
        </p>
      </div>

      {/* Phase 1: Summary Metrics (Highest Speed) */}
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsGrid />
      </Suspense>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Phase 2: Revenue Timeline (Progressive Loading) */}
        <div className="lg:col-span-2">
            <Suspense fallback={<ChartSkeleton />}>
                <RevenueTimeline />
            </Suspense>
        </div>

        {/* Phase 3: Operations Pulse (Activity Feed) */}
        <div className="lg:col-span-1">
            <Suspense fallback={<PulseSkeleton />}>
                <ActivityPulse />
            </Suspense>
        </div>
      </div>

      {/* Phase 4: Rankings & Cross-Platform Performance */}
      <Suspense fallback={<RankingsSkeleton />}>
        <RankingsGrid />
      </Suspense>
    </div>
  );
}
