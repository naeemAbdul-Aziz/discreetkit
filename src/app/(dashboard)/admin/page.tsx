import { Suspense } from "react";
import { 
    getUnifiedPulse, 
    getOperationalLedger,
    getRankingStats,
    getChartsData
} from "@/lib/admin-actions";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { AdminRealtimeRefresh } from "./realtime-refresh";
import { RefreshButton } from "./operations/refresh-button";
import { RankingList } from "@/components/dashboard/ranking-list";
import { DynamicCharts } from "./dynamic-charts";
import { LedgerTable } from "@/components/dashboard/ledger-table";
import { 
    Bike, 
    Clock, 
    AlertTriangle, 
    Package, 
    ShoppingCart, 
    Users, 
    TrendingUp,
    Activity,
    CreditCard,
    Zap,
    Network,
    History,
    ShieldCheck,
    Terminal,
    ArrowRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminDashboardPage() {
  return (
    <DashboardShell
      title="MASTER_CONTROL"
      subtitle="Operational intelligence & real-time logistics synchronization matrix"
      headerAction={<RefreshButton />}
    >
      <AdminRealtimeRefresh />

      {/* --- OPERATIONAL PULSE --- */}
      <section className="space-y-16">
        <div className="flex items-center gap-6 px-4">
            <div className="h-2 w-2 rounded-full bg-brand-teal shadow-[0_0_12px_rgba(20,184,166,0.6)]" />
            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-400">
                OPERATIONAL_PULSE_MONITOR
            </h3>
        </div>
        
        <Suspense fallback={<StatsSkeleton count={4} />}>
            <OpsPulseLoader />
        </Suspense>

        <div className="space-y-16 mt-20">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 px-4">
                <div className="flex items-center gap-8">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                        <Terminal className="h-7 w-7 text-brand-teal" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 leading-none">
                            Unified Protocol Ledger
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 leading-none">Global event stream & operational audit trail</p>
                    </div>
                </div>
                <Link href="/admin/orders">
                    <Button variant="outline" className="h-16 px-12 rounded-full font-black text-[11px] uppercase tracking-widest border-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-none gap-6 shadow-sm border-none bg-slate-50/50">
                        EXHAUSTIVE_AUDIT_LOGS
                        <ArrowRight className="h-5 w-5 text-brand-teal" />
                    </Button>
                </Link>
            </div>
            <Suspense fallback={<TableSkeleton />}>
                <LedgerLoader />
            </Suspense>
        </div>
      </section>

      {/* --- STRATEGIC INTELLIGENCE --- */}
      <section className="pt-60 border-t border-slate-50 space-y-24 mt-20">
        <div className="flex items-center gap-10 px-4">
            <div className="h-20 w-20 rounded-[32px] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                <Zap className="h-10 w-10 text-brand-teal" />
            </div>
            <div className="space-y-4">
                <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                    STRATEGIC_INTELLIGENCE
                </h2>
                <div className="flex items-center gap-6">
                    <div className="h-1.5 w-12 bg-slate-900 rounded-full" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">
                        Platform fiscal performance & aggregate unit telemetry mapping
                    </p>
                </div>
            </div>
        </div>

        <Suspense fallback={<StatsSkeleton count={4} />}>
            <PlatformIntelLoader />
        </Suspense>

        <div className="grid gap-20 xl:grid-cols-3">
            <div className="xl:col-span-2">
                <Suspense fallback={<ChartSkeleton />}>
                    <RevenueChartLoader />
                </Suspense>
            </div>
            <div className="xl:col-span-1">
                <Suspense fallback={<RankingsSkeleton />}>
                    <RankingsLoader />
                </Suspense>
            </div>
        </div>
      </section>
    </DashboardShell>
  );
}

async function OpsPulseLoader() {
    const { ops } = await getUnifiedPulse();
    return (
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="ACTIVE_RIDERS" value={ops.activeRiders} icon={Bike} description="LOGISTICS_READY" />
            <StatCard title="PROCESSING" value={ops.processingCount} icon={Clock} description="NODE_SYNCHRONIZATION" />
            <StatCard title="IN_TRANSIT" value={ops.outForDeliveryCount} icon={Package} description="FULFILLMENT_ACTIVE" />
            <StatCard 
                title="CRITICAL_ALERTS" 
                value={ops.stuckCount + ops.unassignedCount} 
                icon={AlertTriangle} 
                description="PROTOCOL_VIOLATION"
                className={cn(
                  "border-none transition-none shadow-2xl shadow-slate-900/5",
                  ops.stuckCount + ops.unassignedCount > 0 ? "bg-rose-500/5 text-rose-600 border border-rose-500/10 shadow-rose-500/10" : "bg-white"
                )}
            />
        </div>
    );
}

async function PlatformIntelLoader() {
    const { metrics } = await getUnifiedPulse();
    const avgOrderValue = metrics.totalOrders > 0 ? (metrics.totalRevenue / metrics.totalOrders).toFixed(0) : 0;

    return (
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="TOTAL_REVENUE" value={`₵${metrics.totalRevenue.toLocaleString()}`} icon={CreditCard} description="FISCAL_LIQUIDITY" />
            <StatCard title="TOTAL_STREAMS" value={metrics.totalOrders} icon={ShoppingCart} description="LIFETIME_CYCLES" />
            <StatCard title="IDENTITY_REACH" value={metrics.activePatients} icon={Users} description="NODE_IDENTITY" />
            <StatCard title="CYCLE_VALUE" value={`₵${avgOrderValue}`} icon={TrendingUp} description="MEAN_YIELD" />
        </div>
    );
}

async function LedgerLoader() {
    const ledger = await getOperationalLedger(undefined, 10);
    return (
        <div className="rounded-[40px] border border-slate-100 bg-white shadow-2xl shadow-slate-900/5 overflow-hidden p-12">
            <LedgerTable entries={ledger} hideControls={true} />
        </div>
    );
}

async function RevenueChartLoader() {
    const chartData = await getChartsData();
    return (
      <Card className="border border-slate-100 bg-white rounded-[40px] shadow-2xl shadow-slate-900/5 overflow-hidden transition-none">
          <CardHeader className="bg-slate-50/30 p-12 border-b border-slate-50">
                <div className="flex items-center gap-8">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                        <History className="h-7 w-7 text-brand-teal" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">Revenue Velocity</CardTitle>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 leading-none">30D Temporal Timeline Protocol</p>
                    </div>
                </div>
          </CardHeader>
          <CardContent className="p-16">
              <DynamicCharts data={chartData} />
          </CardContent>
      </Card>
    );
}

async function RankingsLoader() {
    const { topPharmacies, topProducts } = await getRankingStats();
    return (
        <div className="space-y-16">
            <div className="rounded-[40px] border border-slate-100 bg-white shadow-2xl shadow-slate-900/5 p-16 space-y-12 transition-none">
                <div className="flex items-center gap-8">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                        <Network className="h-7 w-7 text-brand-teal" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">Node Rankings</h4>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 leading-none">Unit Performance Matrix</p>
                    </div>
                </div>
                <RankingList
                    title=""
                    type="pharmacy"
                    items={topPharmacies.map(p => ({
                        name: p.name.toUpperCase(),
                        value: `₵${p.revenue.toLocaleString()}`,
                        meta: 'YIELD'
                    }))}
                />
            </div>
            <div className="rounded-[40px] border border-slate-100 bg-white shadow-2xl shadow-slate-900/5 p-16 space-y-12 transition-none">
                <div className="flex items-center gap-8">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                        <ShieldCheck className="h-7 w-7 text-brand-teal" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">SKU Velocity</h4>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 leading-none">Inventory Turnover Matrix</p>
                    </div>
                </div>
                <RankingList
                    title=""
                    type="product"
                    items={topProducts.map(p => ({
                        name: p.name.toUpperCase(),
                        value: p.quantity,
                        meta: 'UNITS'
                    }))}
                />
            </div>
        </div>
    );
}

function StatsSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(count)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full rounded-[40px] bg-slate-50/50" />
            ))}
        </div>
    );
}

function TableSkeleton() {
    return (
        <div className="p-16 space-y-10 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-900/5">
            {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-28 w-full rounded-full bg-slate-50/30" />
            ))}
        </div>
    );
}

function ChartSkeleton() {
    return <Skeleton className="h-[800px] w-full rounded-[40px] bg-slate-50/50 shadow-2xl shadow-slate-900/5" />;
}

function RankingsSkeleton() {
    return (
        <div className="space-y-16">
            <Skeleton className="h-[640px] w-full rounded-[40px] bg-slate-50/50 shadow-2xl shadow-slate-900/5" />
            <Skeleton className="h-[640px] w-full rounded-[40px] bg-slate-50/50 shadow-2xl shadow-slate-900/5" />
        </div>
    );
}
