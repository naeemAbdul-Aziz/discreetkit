    getRankingStats, 
    getPulseFeed,
    getOrders
} from "@/lib/admin-actions";
import { OrdersTable } from "./orders/orders-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { RankingList } from "@/components/dashboard/ranking-list";
import { 
    DollarSign, 
    ShoppingCart, 
    Activity, 
    Users, 
    TrendingUp, 
    Package 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';
import type { DashboardChartsClientProps } from "./dashboard-charts-client";

// Explicitly type the dynamic import to fix IntrinsicAttributes error
const DashboardChartsClient = dynamic<DashboardChartsClientProps>(
    () => import("./dashboard-charts-client").then(mod => mod.default), 
    { 
        ssr: false,
        loading: () => <div className="h-[300px] w-full bg-slate-50 animate-pulse rounded-xl" />
    }
);

export async function MetricsGrid() {
    const metrics = await getSummaryMetrics();

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
                title="Total Revenue"
                value={`₵${metrics.totalRevenue.toLocaleString()}`}
                icon={DollarSign}
                description="Live revenue from all orders"
            />
            <StatCard
                title="Total Orders"
                value={metrics.totalOrders}
                icon={ShoppingCart}
                description="Total orders recorded"
            />
            <StatCard
                title="Active Patients"
                value={metrics.activePatients}
                icon={Users}
                description="Unique patients served"
            />
            <StatCard
                title="Active Orders"
                value={metrics.activeOrders}
                icon={Activity}
                description="Orders in fulfillment"
            />
            <StatCard
                title="Avg. Order"
                value={`₵${metrics.totalOrders > 0 ? (metrics.totalRevenue / metrics.totalOrders).toFixed(0) : 0}`}
                icon={TrendingUp}
                description="Based on current order book"
            />
            <StatCard
                title="Velocity"
                value={`${metrics.fulfillmentVelocity}h`}
                icon={Package}
                description="Avg. fulfillment time"
            />
        </div>
    );
}

export async function OrdersLoader({ page, limit }: { page: number, limit: number }) {
  const result = await getOrders(page, limit);
  // Casting to 'any' temporarily if TS cache is still being stubborn about props
  const Table = OrdersTable as any;
  return <Table initialOrders={result.orders} totalOrders={result.total} page={page} />;
}

export async function RevenueTimeline() {
    const chartData = await getChartsData();
    return (
        <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Revenue Timeline</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
                <DashboardChartsClient data={chartData} />
            </CardContent>
        </Card>
    );
}

export async function RankingsGrid() {
    const { topPharmacies, topProducts } = await getRankingStats();

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <RankingList
                title="Top Pharmacies"
                description="Highest revenue generators"
                type="pharmacy"
                items={topPharmacies.map(p => ({
                    name: p.name,
                    value: `₵${p.revenue.toLocaleString()}`,
                    meta: 'Revenue'
                }))}
            />
            <RankingList
                title="Top Products"
                description="Most ordered medical items"
                type="product"
                items={topProducts.map(p => ({
                    name: p.name,
                    value: p.quantity,
                    meta: 'Units'
                }))}
            />
        </div>
    );
}

export async function ActivityPulse() {
    const pulse = await getPulseFeed();

    return (
        <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="p-6 pb-4 border-b border-slate-50">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-brand-indigo/60" />
                    Operations Pulse
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-slate-50">
                    {pulse?.map((item, idx) => (
                        <div key={idx} className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold",
                                item.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-indigo/5 text-brand-indigo'
                            )}>
                                {item.orderCode.slice(-2)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[13px] font-bold text-brand-indigo truncate">Order {item.orderCode}</p>
                                    <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Badge variant="outline" className="text-[8px] h-4 uppercase tracking-wider font-bold border-slate-100 text-slate-500 bg-slate-50/50">
                                        {item.status.replace(/_/g, ' ')}
                                    </Badge>
                                    {item.note && <span className="text-[10px] text-slate-500 truncate italic">"{item.note}"</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
