/**
 * @file src/app/(dashboard)/admin/page.tsx
 * @description The main dashboard page for administrators, showing full-access
 *              metrics and data.
 */
"use client";

import { StatCard } from "@/components/dashboard/stat-card";
import { RankingList } from "@/components/dashboard/ranking-list";
import {
  DollarSign,
  ShoppingCart,
  Activity,
  Users,
  AlertCircle,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer";
import { useSSE } from "@/hooks/use-sse";
import { useRouter } from "next/navigation";

type RecentOrder = {
  id: number;
  code: string;
  status: string;
  total_price: number;
  created_at: string;
};
type DashboardData = {
  metrics: {
    totalRevenue: number;
    totalSales: number;
    avgOrderValue: number;
    newCustomers: number;
    activeOrders: number;
    fulfillmentVelocity: string;
  };
  recentOrders: RecentOrder[];
  revenueSeries: { date: string; amount: number }[];
  statusBreakdown?: { status: string; count: number }[];
  topPharmacies?: { name: string; revenue: number }[];
  topProducts?: { name: string; quantity: number; revenue: number }[];
  regionChart?: { name: string; value: number }[];
  pulseFeed?: { id: any; orderCode: string; status: string; timestamp: string; note?: string }[];
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangePreset, setRangePreset] = useState<"7d" | "30d" | "90d">("30d");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [from, to] = useMemo(() => {
    const now = new Date();
    const days = rangePreset === "7d" ? 7 : rangePreset === "90d" ? 90 : 30;
    const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return [start, now];
  }, [rangePreset]);

  useEffect(() => {
    async function loadData() {
      try {
        // Set loading only on first load or manual range change, not background refresh
        if (refreshTrigger === 0) setLoading(true);
        const { getOrders, getDashboardStats } =
          await import("@/lib/admin-actions");
        const orders = await getOrders();
        const stats = await getDashboardStats(orders);

        // Calculate metrics
        const totalRevenue = orders.reduce(
          (sum: number, o: any) => sum + (o.total_price || 0),
          0,
        );
        const totalSales = orders.length;
        const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

        // Active orders (processing or out_for_delivery)
        const activeOrders = orders.filter((o: any) =>
          ["processing", "out_for_delivery"].includes(o.status),
        ).length;

        // New customers (unique emails in period) - simplified for now
        const uniqueCustomers = new Set(orders.map((o: any) => o.email)).size;

        // Recent orders
        const recentOrders = orders.slice(0, 5).map((o: any) => ({
          id: o.id,
          code: o.code,
          status: o.status,
          total_price: o.total_price,
          created_at: o.created_at,
        }));

        // Revenue series (last 30 days)
        const seriesMap = new Map<string, number>();
        const now = new Date();
        for (let i = 29; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          seriesMap.set(d.toISOString().slice(0, 10), 0);
        }

        orders.forEach((o: any) => {
          const date = new Date(o.created_at).toISOString().slice(0, 10);
          if (seriesMap.has(date)) {
            seriesMap.set(
              date,
              (seriesMap.get(date) || 0) + (o.total_price || 0),
            );
          }
        });

        const revenueSeries = Array.from(seriesMap.entries()).map(
          ([date, amount]) => ({ date, amount }),
        );

        // Status breakdown
        const statusCounts: Record<string, number> = {};
        orders.forEach((o: any) => {
          statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
        });
        const statusBreakdown = Object.entries(statusCounts).map(
          ([status, count]) => ({ status, count }),
        );

        setData({
          metrics: {
            totalRevenue,
            totalSales,
            avgOrderValue,
            newCustomers: uniqueCustomers,
            activeOrders,
            fulfillmentVelocity: stats.metrics?.fulfillmentVelocity ?? '—',
          },
          recentOrders,
          revenueSeries,
          statusBreakdown,
          topPharmacies: stats.topPharmacies,
          topProducts: stats.topProducts,
          regionChart: stats.regionChart,
          pulseFeed: stats.pulseFeed,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [rangePreset, refreshTrigger]);

  // SSE for real-time updates
  useSSE("/api/admin/realtime/orders", {
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "orders") {
          router.refresh();
          // Also re-fetch client-side stats
          // We need to define loadData outside useEffect or trigger it via a state change
          // Simplest hack: toggle a dummy state or move loadData out.
          // Let's increment a refresh counter.
          setRefreshTrigger((prev) => prev + 1);
        }
      } catch (e) {
        console.error("SSE parse error", e);
      }
    },
  });

  const [activeStatuses, setActiveStatuses] = useState<string[]>([
    "pending_payment",
    "received",
    "processing",
    "out_for_delivery",
  ]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RecentOrder | null>(null);

  const filteredBreakdown = useMemo(() => {
    if (!data?.statusBreakdown) return [];
    return data.statusBreakdown.filter((s) =>
      activeStatuses.includes(s.status),
    );
  }, [data, activeStatuses]);

  const colors = ["#f97316", "#3b82f6", "#a855f7", "#f59e0b", "#10b981"];
  const colorClasses = [
    "bg-orange-500",
    "bg-blue-500",
    "bg-purple-500",
    "bg-amber-500",
    "bg-emerald-500",
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || "No data"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={`GHS ${data.metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            trend={{ value: 20.1, label: "from last month", positive: true }}
          />
          <StatCard
            title="Sales"
            value={data.metrics.totalSales}
            icon={ShoppingCart}
            trend={{ value: 180.1, label: "from last month", positive: true }}
          />
          <StatCard
            title="Anxiety Meter"
            value={`${data.metrics.fulfillmentVelocity}h`}
            icon={Activity}
            description="Avg. fulfillment speed"
            trend={{ value: 12, label: "faster than avg", positive: true }}
          />
          <StatCard
            title="Active Now"
            value={data.metrics.activeOrders}
            icon={Users}
            description="Orders in system"
          />
        </div>

        {/* High-Density Operational Log */}
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col mt-4">
          <div className="flex items-center justify-between p-4 border-b bg-muted/20">
            <h2 className="text-sm font-semibold tracking-tight text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand-indigo" />
              Operational Activity Stream
            </h2>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-600">
                Live
              </span>
            </div>
          </div>
          
          <div className="max-h-[350px] overflow-y-auto w-full custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <tbody className="divide-y divide-border/50 text-xs text-foreground font-medium">
                {(data.pulseFeed || []).map((event: any, i: number) => {
                  const isAlert = String(event.status).includes("ALERT");
                  return (
                    <tr key={event.id || i} className="hover:bg-muted/40 transition-colors group">
                      {/* Timestamp */}
                      <td className="py-2.5 px-4 w-[90px] text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      
                      {/* Order Code */}
                      <td className="py-2.5 px-4 w-[120px]">
                        <span className="font-mono font-bold bg-muted px-1.5 py-0.5 rounded text-[11px] border border-border group-hover:bg-background">
                          {event.orderCode}
                        </span>
                      </td>
                      
                      {/* Status */}
                      <td className="py-2.5 px-4 w-[160px]">
                        <span className={`text-[10px] uppercase font-bold tracking-widest ${isAlert ? 'text-rose-500' : 'text-brand-indigo'}`}>
                          {event.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      
                      {/* Event Note */}
                      <td className="py-2.5 px-4 w-full text-muted-foreground">
                        {event.note ? (
                          <span className={`truncate block max-w-md xl:max-w-2xl group-hover:text-foreground transition-colors ${isAlert ? 'font-semibold text-rose-500/80' : ''}`}>
                            {event.note.replace('⚠️ ALERT: ', '')}
                          </span>
                        ) : (
                          <span className="opacity-40">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                
                {(!data.pulseFeed || data.pulseFeed.length === 0) && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground text-sm font-medium">
                      System is silent. Awaiting incoming traffic streams.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <RankingList
            title="Top Pharmacies"
            description="By total revenue generated"
            type="pharmacy"
            items={(data.topPharmacies || []).map((p) => ({
              name: p.name,
              value: `GHS ${p.revenue.toLocaleString()}`,
            }))}
          />
          <RankingList
            title="Top Products"
            description="By quantity sold"
            type="product"
            items={(data.topProducts || []).map((p) => ({
              name: p.name,
              value: `${p.quantity} sold`,
              meta: `GHS ${p.revenue.toLocaleString()}`,
            }))}
          />
          
          <Card className="border-0 shadow-sm bg-card/50 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                Privacy Density
              </CardTitle>
              <CardDescription className="text-xs">Demand by regional hotspot</CardDescription>
            </CardHeader>
            <CardContent className="h-[240px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.regionChart}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="name" 
                    hide 
                  />
                  <YAxis hide />
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background/90 border border-border/10 p-2 rounded-lg shadow-xl backdrop-blur-md">
                            <p className="text-[10px] font-bold uppercase text-muted-foreground">{payload[0].payload.name}</p>
                            <p className="text-sm font-black text-primary">{payload[0].value} Orders</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-2 space-y-1">
                {data.regionChart?.slice(0, 3).map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground truncate w-32">{r.name}</span>
                    <span className="font-bold">{r.value} pkts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Order Details</DrawerTitle>
            <DrawerDescription>
              {selectedOrder ? (
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Order Code:</span>{" "}
                    {selectedOrder.code}
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span>{" "}
                    <span className="capitalize">
                      {String(selectedOrder.status).replace("_", " ")}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Total:</span> GHS{" "}
                    {selectedOrder.total_price.toFixed(2)}
                  </div>
                  <div>
                    <span className="font-semibold">Created:</span>{" "}
                    {new Date(selectedOrder.created_at).toLocaleString()}
                  </div>
                </div>
              ) : (
                <span>No order selected.</span>
              )}
            </DrawerDescription>
            <DrawerClose asChild>
              <button className="mt-4 px-4 py-2 rounded bg-primary text-white">
                Close
              </button>
            </DrawerClose>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    </>
  );
}
