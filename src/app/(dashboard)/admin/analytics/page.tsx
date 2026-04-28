import { Suspense } from "react";
import { getDashboardStats, getDetailedAnalytics } from "@/lib/admin-actions";
import AnalyticsDashboard from "./analytics-dashboard";
import { MetricsSkeleton } from "../skeletons";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  // Fire all data fetches in parallel
  const [stats, detailed, ledger] = await Promise.all([
    getDashboardStats(),
    getDetailedAnalytics(),
    getOperationalLedger(undefined, 10), // Fetch latest 10 for the "pulse" view
  ]);

  const data = {
    // Core KPIs
    totalRevenue:       stats.metrics?.totalRevenue        ?? 0,
    totalOrders:        stats.metrics?.totalOrders         ?? 0,
    activeOrders:       stats.metrics?.activeOrders        ?? 0,
    activePatients:     stats.metrics?.activePatients      ?? 0,
    fulfillmentVelocity: stats.metrics?.fulfillmentVelocity ?? "0.0",
    revenueChart:       stats.revenueChart                 ?? [],
    topProducts:        stats.topProducts                  ?? [],
    topPharmacies:      stats.topPharmacies                ?? [],

    // Detailed analytics
    orderStatusBreakdown: detailed.orderStatusBreakdown,
    categoryBreakdown:    detailed.categoryBreakdown,
    topAreas:             detailed.topAreas,
    peakHours:            detailed.peakHours,
    totalUniqueCustomers: detailed.totalUniqueCustomers,
    repeatCustomers:      detailed.repeatCustomers,
    refillActive:         detailed.refillActive,
    refillPaused:         detailed.refillPaused,
    refillCancelled:      detailed.refillCancelled,
    lowStockAlerts:       detailed.lowStockAlerts,
    
    // New Ledger Data
    recentLedger:         ledger,
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase tracking-widest">
          Analytics
        </h2>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">
          Platform performance & health insights
        </p>
      </div>

      <Suspense fallback={<MetricsSkeleton />}>
        <AnalyticsDashboard data={data} />
      </Suspense>
    </div>
  );
}