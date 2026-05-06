import { Suspense } from "react";
import { getUnifiedPulse, getDetailedAnalytics, getOperationalLedger } from "@/lib/admin-actions";
import AnalyticsDashboard from "./analytics-dashboard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * FAANG-Level Strategic Intelligence Center
 * Focused on long-term trends and public health reporting.
 */
export default async function AdminAnalyticsPage() {
  // Fire all data fetches in parallel for high performance
  const [pulse, detailed, ledger] = await Promise.all([
    getUnifiedPulse(),
    getDetailedAnalytics(),
    getOperationalLedger(undefined, 10),
  ]);

  const data = {
    // Core KPIs
    totalRevenue:       pulse.metrics.totalRevenue,
    totalOrders:        pulse.metrics.totalOrders,
    activeOrders:       pulse.metrics.activeOrders,
    activePatients:     pulse.metrics.activePatients,
    fulfillmentVelocity: pulse.metrics.fulfillmentVelocity,
    revenueChart:       pulse.charts                       ?? [],
    topProducts:        pulse.rankings.topProducts         ?? [],
    topPharmacies:      pulse.rankings.topPharmacies       ?? [],

    // Detailed analytics (Strategic)
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
    
    // Ledger for context
    recentLedger:         ledger,
  };

  return (
    <DashboardShell
      title="INTELLIGENCE_PULSE"
      subtitle="Strategic performance, health outcomes & global stakeholder reporting matrix"
      breadcrumbs={[{ label: 'MASTER_CONTROL', href: '/admin' }, { label: 'INTELLIGENCE_PULSE' }]}
    >
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsDashboard data={data} />
      </Suspense>
    </DashboardShell>
  );
}

function AnalyticsSkeleton() {
    return (
        <div className="p-16 space-y-16 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-900/5">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-3xl bg-slate-50/30" />
                ))}
            </div>
            <Skeleton className="h-[480px] w-full rounded-[32px] bg-slate-50/50" />
            <div className="grid gap-12 lg:grid-cols-2">
                <Skeleton className="h-80 w-full rounded-[32px] bg-slate-50/30" />
                <Skeleton className="h-80 w-full rounded-[32px] bg-slate-50/30" />
            </div>
            <div className="flex flex-col items-center justify-center py-20 gap-10">
                <div className="h-20 w-20 rounded-3xl bg-slate-50/50 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-brand-teal animate-spin" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-300">Synchronizing Strategic Intelligence Matrix...</p>
            </div>
        </div>
    );
}