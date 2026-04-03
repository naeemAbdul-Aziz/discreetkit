import { Suspense } from "react";
import { getDashboardStats } from "@/lib/admin-actions";
import AnalyticsDashboard from "./analytics-dashboard";
import { MetricsGrid, RevenueTimeline, RankingsGrid } from "../dashboard-components";
import { MetricsSkeleton, ChartSkeleton, RankingsSkeleton } from "../skeletons";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Platform Analytics Hub (Server-Side Streaming)
 */
export default async function AdminAnalyticsPage() {
  // Pre-fetch some global stats for the interactive dashboard wrapper if needed,
  // but prioritize streaming the heavy components.
  const statsPromise = getDashboardStats();

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase tracking-widest">
            Analytics Overview
        </h2>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">
            Detailed Performance Metrics & Platform Operational Data
        </p>
      </div>

      {/* Summary Metrics (Fastest) */}
      <Suspense fallback={<MetricsSkeleton />}>
        <MetricsGrid />
      </Suspense>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Revenue Timeline */}
        <div className="lg:col-span-2">
            <Suspense fallback={<ChartSkeleton />}>
                <RevenueTimeline />
            </Suspense>
        </div>

        {/* High-Yield Rankings */}
        <div className="lg:col-span-1">
            <Suspense fallback={<RankingsSkeleton />}>
                <RankingsGrid />
            </Suspense>
        </div>
      </div>

      {/* Legacy Analytics Interface (Hydrated wrapper) */}
      <Suspense fallback={<div className="h-48 animate-pulse bg-slate-50 rounded-3xl" />}>
          <AnalyticsDataSync statsPromise={statsPromise} />
      </Suspense>
    </div>
  );
}

async function AnalyticsDataSync({ statsPromise }: { statsPromise: Promise<any> }) {
    const stats = await statsPromise;
    const flatStats = {
        totalRevenue: stats.metrics.totalRevenue,
        totalOrders: stats.metrics.totalOrders,
        activePatients: stats.metrics.activePatients,
        revenueChart: stats.revenueChart,
        categoryChart: stats.categoryChart,
        regionChart: stats.regionChart,
        topProducts: stats.topProducts,
        topPharmacies: stats.topPharmacies,
    };

    return <AnalyticsDashboard data={flatStats} />;
}