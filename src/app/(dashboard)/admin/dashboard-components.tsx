import { 
    getSummaryMetrics, 
    getChartsData, 
    getRankingStats, 
    getPulseFeed,
    getOrders
} from "@/lib/admin-actions";
import { OrdersTable } from "./orders/orders-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { RankingList } from "@/components/dashboard/ranking-list";
import { Icon } from "@/components/ui/icon";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DynamicCharts } from "./dynamic-charts";

export async function MetricsGrid() {
    const metrics = await getSummaryMetrics() || {
        totalRevenue: 0,
        totalOrders: 0,
        activePatients: 0,
        activeOrders: 0,
        fulfillmentVelocity: "0.0",
        activePharmacists: 0,
        activeRiders: 0
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
                title="Total Sales"
                value={`₵${metrics.totalRevenue.toLocaleString()}`}
                icon="payments"
                description="Live revenue from all orders"
            />
            <StatCard
                title="Total Orders"
                value={metrics.totalOrders}
                icon="shopping_cart"
                description="Total orders recorded"
            />
            <StatCard
                title="Active Customers"
                value={metrics.activePatients}
                icon="group"
                description="Unique patients served"
            />
            <StatCard
                title="Processing Orders"
                value={metrics.activeOrders}
                icon="query_stats"
                description="Orders in fulfillment"
            />
            <StatCard
                title="Avg. Order Value"
                value={`₵${metrics.totalOrders > 0 ? (metrics.totalRevenue / metrics.totalOrders).toFixed(0) : 0}`}
                icon="trending_up"
                description="Based on current order book"
            />
            <StatCard
                title="Avg. Wait Time"
                value={`${metrics.fulfillmentVelocity}h`}
                icon="inventory_2"
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
                <CardTitle className="text-xs font-bold text-slate-400">Sales Over Time</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
                <DynamicCharts data={chartData} />
            </CardContent>
        </Card>
    );
}

export async function RankingsGrid() {
    const { topPharmacies, topProducts } = await getRankingStats();

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <RankingList
                title="Top Sellers"
                description="Best performing pharmacies"
                type="pharmacy"
                items={topPharmacies.map(p => ({
                    name: p.name,
                    value: `₵${p.revenue.toLocaleString()}`,
                    meta: 'Revenue'
                }))}
            />
            <RankingList
                title="Best Selling Products"
                description="Most ordered items"
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
                <CardTitle className="text-xs font-bold text-slate-400 flex items-center gap-2">
                    <Icon name="query_stats" className="text-brand-indigo/60" opticalSize={16} />
                    Recent Activity
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                <div className="divide-y divide-slate-50">
                    {pulse?.map((item, idx) => (
                        <div key={idx} className="p-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors">
                            <div className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold",
                                item.status === 'completed' ? 'bg-slate-100 text-slate-700' : 'bg-white border border-slate-200/60 shadow-[0_1px_2px_rgba(0,0,0,0.02)] text-slate-600'
                            )}>
                                {item.orderCode ? item.orderCode.slice(-2) : '??'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                    <p className="text-[13px] font-bold text-brand-indigo truncate">Order {item.orderCode}</p>
                                    <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
                                        {item.timestamp && !isNaN(new Date(item.timestamp).getTime()) 
                                            ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                            : '--:--'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Badge variant="outline" className="text-[9px] h-4 font-bold border-slate-100 text-slate-500 bg-slate-50/50">
                                        {(item.status || 'unknown').replace(/_/g, ' ')}
                                    </Badge>
                                    {item.note && <span className="text-[10px] text-slate-500 truncate italic">&quot;{item.note}&quot;</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
