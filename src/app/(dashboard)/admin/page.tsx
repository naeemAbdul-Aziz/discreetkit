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
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
  revenueSeries: { date: string; revenue: number; orders?: number }[];
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
        if (refreshTrigger === 0) setLoading(true);
        const { getDashboardStats, getOrders } = await import("@/lib/admin-actions");
        
        // Use centralized stats for consistency
        const stats = await getDashboardStats();
        const orders = await getOrders(); // Still needed for the full list if we want it, but we can prioritize stats

        setData({
          metrics: {
            totalRevenue: stats.metrics.totalRevenue,
            totalSales: stats.metrics.totalOrders,
            avgOrderValue: stats.metrics.totalOrders > 0 ? stats.metrics.totalRevenue / stats.metrics.totalOrders : 0,
            newCustomers: stats.metrics.activePatients,
            activeOrders: stats.metrics.activeOrders,
            fulfillmentVelocity: stats.metrics.fulfillmentVelocity,
          },
          recentOrders: orders.slice(0, 5).map((o: any) => ({
            id: o.id,
            code: o.code,
            status: o.status,
            total_price: Number(o.total_price_ghs || 0) || Number(o.total_price || 0),
            created_at: o.created_at,
          })),
          revenueSeries: stats.revenueChart.map((d: any) => ({
            ...d,
            revenue: Number(d.revenue || 0)
          })),
          statusBreakdown: stats.categoryChart.map((c: any) => ({
            status: c.name,
            count: c.value
          })),
          topPharmacies: stats.topPharmacies,
          topProducts: stats.topProducts,
          regionChart: stats.regionChart,
          pulseFeed: stats.pulseFeed,
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data. Check database connectivity.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [rangePreset, refreshTrigger]);

  useSSE("/api/admin/realtime/orders", {
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "orders") {
          router.refresh();
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-[2rem]" />
          ))}
        </div>
        <Skeleton className="h-[400px] rounded-[2rem]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">System Link Failed</h3>
        <p className="text-slate-400 text-sm max-w-sm mx-auto font-medium">{error || "The operational data stream is currently inaccessible."}</p>
        <Button onClick={() => setRefreshTrigger(prev => prev + 1)} variant="outline" className="rounded-xl font-bold">Reconnect Matrix</Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={`₵${data.metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            description="Live revenue from all orders"
          />
          <StatCard
            title="Gross Sales"
            value={data.metrics.totalSales}
            icon={ShoppingCart}
            description="Total orders recorded"
          />
          <StatCard
            title="Operational Velocity"
            value={`${data.metrics.fulfillmentVelocity}h`}
            icon={Activity}
            description="Avg. fulfillment speed"
          />
          <StatCard
            title="Active Traffic"
            value={data.metrics.activeOrders}
            icon={Users}
            description="Live system orders"
          />
        </div>

        <div className="bg-white border border-slate-200/50 shadow-sm rounded-3xl overflow-hidden flex flex-col group transition-all hover:shadow-md">
          <div className="flex items-center justify-between p-6 border-b border-slate-50">
            <div className="space-y-0.5">
              <h2 className="text-[10px] font-bold tracking-[0.1em] uppercase text-slate-400 flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-brand-indigo/60" />
                Operational Activity Stream
              </h2>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100/50">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
              <span className="text-[8px] uppercase tracking-wider font-bold text-slate-500">
                Live Data Link
              </span>
            </div>
          </div>
          
          <div className="max-h-[450px] overflow-y-auto w-full custom-scrollbar">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50/50 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400">
                  <th className="py-4 px-6 font-black w-32">Temporal Index</th>
                  <th className="py-4 px-6 font-black w-40">Matrix ID</th>
                  <th className="py-4 px-6 font-black w-32">Status</th>
                  <th className="py-4 px-6 font-black">Event Descriptor</th>
                  <th className="py-4 px-6 text-right font-black w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs text-foreground font-medium">
                {(data.pulseFeed || []).map((event: any, i: number) => {
                  const isAlert = String(event.status).includes("ALERT");
                  return (
                    <tr key={event.id || i} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6 text-slate-400 whitespace-nowrap font-mono tabular-nums text-[10px]">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      
                      <td className="py-4 px-6">
                        <button 
                          onClick={() => {
                            setSelectedOrder({
                              id: event.orderId || event.id,
                              code: event.orderCode,
                              status: event.status,
                              total_price: 0, // Fallback
                              created_at: event.timestamp
                            });
                            setDrawerOpen(true);
                          }}
                          className="font-mono font-black text-brand-indigo bg-indigo-50/30 border border-indigo-100/50 px-2.5 py-1.5 rounded-md text-[10px] shadow-sm hover:bg-brand-indigo hover:text-white transition-all whitespace-nowrap"
                        >
                          {event.orderCode}
                        </button>
                      </td>
                      
                      <td className="py-4 px-6">
                        <Badge variant={isAlert ? "destructive" : "secondary"} className={cn(
                          "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border-none",
                          !isAlert && "bg-slate-100 text-slate-600"
                        )}>
                          {event.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      
                      <td className="py-4 px-6 w-full text-slate-500">
                        {event.note ? (
                          <span className={cn(
                            "block max-w-sm xl:max-w-2xl transition-colors font-semibold truncate",
                            isAlert ? 'text-rose-600' : 'group-hover:text-slate-900'
                          )}>
                            {event.note.replace('⚠️ ALERT: ', '')}
                          </span>
                        ) : (
                          <span className="opacity-20">—</span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all duration-300">
                          {isAlert ? (
                            <Button className="h-8 px-4 text-[9px] font-black text-white bg-rose-600 hover:bg-rose-700 rounded-lg uppercase tracking-widest">
                              Resolve
                            </Button>
                          ) : (
                            <Button variant="ghost" className="h-8 px-4 text-[9px] font-black text-brand-indigo hover:bg-indigo-50 rounded-lg uppercase tracking-widest">
                              Inspect
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                
                {(!data.pulseFeed || data.pulseFeed.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-20 text-center space-y-2">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Activity className="h-5 w-5 text-slate-200" />
                      </div>
                      <p className="text-slate-400 text-sm font-black uppercase tracking-widest">Awaiting Incoming Data Stream</p>
                      <p className="text-slate-300 text-xs font-medium">The operational environment is currently stable.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <RankingList
            title="High-Yield Partners"
            description="Contribution to network revenue"
            type="pharmacy"
            items={(data.topPharmacies || []).map((p) => ({
              name: p.name,
              value: `₵${p.revenue.toLocaleString()}`,
            }))}
          />
          <RankingList
            title="High-Velocity Assets"
            description="Market demand by fulfillment"
            type="product"
            items={(data.topProducts || []).map((p) => ({
              name: p.name,
              value: `${p.quantity} dispatched`,
              meta: `₵${p.revenue.toLocaleString()}`,
            }))}
          />
          
          <Card className="border border-slate-200/50 shadow-sm bg-white overflow-hidden rounded-3xl p-6 group">
            <CardHeader className="p-0 pb-4">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-brand-teal/60" />
                Privacy Hotspots
              </CardTitle>
              <CardDescription className="text-[10px] font-medium text-slate-400 pt-0.5">Distribution by regional density</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="h-[160px] w-full bg-slate-50/50 rounded-2xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.regionChart}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.05}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-xl shadow-xl">
                              <p className="text-[8px] font-bold uppercase tracking-wider text-slate-500">{payload[0].payload.name}</p>
                              <p className="text-sm font-bold text-white">{payload[0].value} <span className="text-[8px] opacity-40 font-medium">UNIT</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#4f46e5" 
                      strokeWidth={2}
                      strokeOpacity={0.4}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {data.regionChart?.slice(0, 4).map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/50 border border-slate-100/50 transition-colors hover:bg-white hover:border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate w-40">{r.name}</span>
                    <span className="text-[11px] font-bold text-slate-900 tabular-nums">{r.value} units</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="rounded-t-[3rem] p-10">
          <DrawerHeader className="p-0 space-y-6">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-3xl font-extrabold tracking-tight">Operation Insight</DrawerTitle>
              <DrawerClose asChild>
                <Button variant="ghost" className="rounded-full h-10 w-10 p-0 hover:bg-slate-100">
                  <XCircle className="h-6 w-6 text-slate-300" />
                </Button>
              </DrawerClose>
            </div>
            <DrawerDescription className="p-0">
              {selectedOrder ? (
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Matrix Code</span>
                      <span className="text-2xl font-black text-slate-900 font-mono tracking-tighter">{selectedOrder.code}</span>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Operational Status</span>
                      <Badge className="bg-brand-indigo text-white px-4 py-1 rounded-lg font-black uppercase text-[10px] tracking-widest border-none">
                        {String(selectedOrder.status).replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Financial Settlement</span>
                      <span className="text-2xl font-black text-slate-900 tabular-nums font-mono tracking-tighter">₵{selectedOrder.total_price.toFixed(2)}</span>
                    </div>
                    <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block mb-2">Timestamp</span>
                      <span className="text-lg font-bold text-slate-900">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-20 text-center">
                  <span className="text-slate-400 font-black uppercase tracking-widest">No order selected.</span>
                </div>
              )}
            </DrawerDescription>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    </>
  );
}
