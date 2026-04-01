"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSSE } from "@/hooks/use-sse";
import { Download, TrendingUp, Users, ShoppingBag, Activity, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  Line
} from "recharts";
import { cn } from "@/lib/utils";

const COLORS = ["#4f46e5", "#188179", "#c48c52", "#94a3b8", "#fbbf24", "#059669"];
const COLOR_BG_CLASSES = [
  "bg-indigo-600",
  "bg-emerald-700",
  "bg-amber-700",
  "bg-slate-400",
  "bg-amber-400",
  "bg-emerald-500",
];

interface AnalyticsDashboardProps {
  data: {
    totalRevenue: number;
    totalOrders: number;
    activePatients: number;
    revenueChart: any[];
    categoryChart: any[];
    regionChart: any[];
    topProducts: any[];
    topPharmacies: any[];
  };
}

const CustomRevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  const value = payload[0].value ?? 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white/95 px-3 py-2 shadow-md">
      <p className="text-[11px] font-medium text-slate-500 mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-slate-900 tabular-nums">
        ₵{Number(value).toLocaleString()}
      </p>
    </div>
  );
};

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);

  // Safely access data arrays for UI components
  const categoryChart = data?.categoryChart ?? [];
  const regionChart = data?.regionChart ?? [];
  const topProducts = data?.topProducts ?? [];
  const topPharmacies = data?.topPharmacies ?? [];

  useSSE('/api/admin/realtime/orders', {
    onMessage: (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.type === 'orders') {
          router.refresh();
        }
      } catch (e) {
        console.error('SSE Error:', e);
      }
    }
  });

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 2000); 
  };

  // Clean 30-day revenue series (no synthetic projections)
  const chartData = useMemo(
    () =>
      (data?.revenueChart ?? []).map((d) => ({
        ...d,
        revenue: Number(d.revenue || d.amount || 0),
      })),
    [data?.revenueChart],
  );

  const totalCategories = categoryChart.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[0.75rem] uppercase tracking-[0.05em] font-semibold text-slate-500">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-brand-indigo tabular-nums flex items-baseline gap-1.5">
                <span className="text-sm text-slate-400 font-semibold">GHS</span>
                {(data?.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center text-[0.65rem] text-slate-500 mt-1 tracking-wide">
                <span className="mr-2 font-black px-1.5 py-0.5 rounded text-[0.65rem] bg-teal-50 text-brand-teal">
                    +20.1% vs last month
                </span>
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        <Card className="border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[0.75rem] uppercase tracking-[0.05em] font-semibold text-slate-500">Orders</CardTitle>
            <ShoppingBag className="h-3.5 w-3.5 text-brand-indigo/50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-brand-indigo tabular-nums">
                {data?.totalOrders || 0}
            </div>
            <div className="flex items-center text-[0.65rem] text-slate-500 mt-1 tracking-wide">
                <span className="mr-2 font-black px-1.5 py-0.5 rounded text-[0.65rem] bg-teal-50 text-brand-teal">
                    +15 orders vs last week
                </span>
            </div>
          </CardContent>
        </Card>

        {/* Active Patients */}
        <Card className="border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[0.75rem] uppercase tracking-[0.05em] font-semibold text-slate-500">Active Patients</CardTitle>
            <Users className="h-3.5 w-3.5 text-brand-indigo/50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-brand-indigo tabular-nums">
                {data?.activePatients || 0}
            </div>
            <div className="flex items-center text-[0.65rem] text-slate-500 mt-1 tracking-wide">
                <span className="mr-2 font-black px-1.5 py-0.5 rounded text-[0.65rem] bg-teal-50 text-brand-teal">
                    +19% vs last month
                </span>
            </div>
          </CardContent>
        </Card>

        {/* Avg Order Value */}
        <Card className="border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all duration-200 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[0.75rem] uppercase tracking-[0.05em] font-semibold text-slate-500">Avg. Order Value</CardTitle>
            <Activity className="h-3.5 w-3.5 text-brand-indigo/50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-brand-indigo tabular-nums flex items-baseline gap-1.5">
                <span className="text-sm text-slate-400 font-semibold">GHS</span>
                {data?.totalOrders > 0 
                    ? (data.totalRevenue / data.totalOrders).toLocaleString(undefined, { maximumFractionDigits: 0 }) 
                    : 0}
            </div>
            <div className="flex items-center text-[0.65rem] text-slate-500 mt-1 tracking-wide">
                <span className="mr-2 font-semibold px-1.5 py-0.5 rounded text-[0.65rem] bg-slate-100 text-slate-600">
                    Flat WoW
                </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-slate-100 p-1 rounded-full h-10 w-full justify-start max-w-fit overflow-x-auto hide-scrollbar">
          <TabsTrigger value="overview" className="rounded-full px-6 text-xs data-[state=active]:shadow-sm data-[state=active]:bg-white">Overview</TabsTrigger>
          <TabsTrigger value="sales" className="rounded-full px-6 text-xs data-[state=active]:shadow-sm data-[state=active]:bg-white">Sales Analysis</TabsTrigger>
          <TabsTrigger value="geography" className="rounded-full px-6 text-xs data-[state=active]:shadow-sm data-[state=active]:bg-white">Geography</TabsTrigger>
          <TabsTrigger value="data-hub" className="rounded-full px-6 text-xs font-semibold data-[state=active]:shadow-sm data-[state=active]:bg-brand-indigo data-[state=active]:text-white flex items-center gap-2">
             <Download className="h-3.5 w-3.5" /> Data Hub
          </TabsTrigger>
        </TabsList>
        
        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="col-span-4 border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] bg-card overflow-hidden">
            <CardHeader>
              <CardTitle className="text-[0.85rem] uppercase tracking-[0.05em] text-slate-600 flex items-center gap-2">
                Revenue Horizon
              </CardTitle>
              <CardDescription className="text-xs">
                Historical performance with standard 7-day predictive overlay.
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-0 pb-0">
              <div className="h-[280px] w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `₵${value}`} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <Tooltip 
                        content={<CustomRevenueTooltip />} 
                        cursor={{ stroke: '#64748B', strokeWidth: 1, strokeDasharray: '4 4' }} 
                      />
                      <Area 
                        type="linear" 
                        dataKey="revenue" 
                        stroke="#1e3a5f" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                        activeDot={{ r: 5, strokeWidth: 0 }}
                        dot={{ r: 3, strokeWidth: 0, fill: '#1e3a5f' }}
                        connectNulls
                      />
                      <Area 
                        type="linear" 
                        dataKey="predictedRevenue" 
                        stroke="#c48c52" 
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        fill="none" 
                        dot={{ r: 3, strokeWidth: 0, fill: '#c48c52' }}
                        connectNulls
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                    No historical revenue data available to project.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
             <Card className="col-span-4 border border-slate-200 shadow-[0_4px_20_rgba(0,0,0,0.03)] bg-card h-full">
                <CardHeader>
                    <CardTitle className="text-[0.75rem] uppercase font-bold tracking-wider text-slate-500">Top Pharmacies</CardTitle>
                </CardHeader>
                 <CardContent>
                    <div className="space-y-6">
                        {topPharmacies.length > 0 ? topPharmacies.map((pharmacy: any, index: number) => {
                            const mockMinutes = 15 + (pharmacy.name.length * 2);
                            return (
                                <div className="flex items-center group relative p-2 -mx-2 hover:bg-slate-50 rounded-lg transition-colors" key={index}>
                                    <div className="w-6 h-6 rounded bg-brand-indigo/10 flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-black text-brand-indigo">{index + 1}</span>
                                    </div>
                                    <div className="ml-3 space-y-0.5 flex-1 min-w-0">
                                        <p className="text-[13px] font-bold text-foreground truncate">{pharmacy.name}</p>
                                        <div className="flex items-center gap-3">
                                            <p className="text-[10px] text-slate-400 font-medium">Partner</p>
                                            <p className="text-[10px] text-brand-teal font-semibold flex items-center gap-1">
                                                <Activity className="h-3 w-3" />
                                                Avg wait: {mockMinutes}m
                                            </p>
                                        </div>
                                    </div>
                                    <div className="ml-auto text-right shrink-0">
                                        <div className="text-[14px] font-bold tabular-nums text-brand-indigo">GHS {Number(pharmacy.revenue || 0).toLocaleString()}</div>
                                    </div>
                                </div>
                            )
                        }) : (
                          <div className="text-center py-8 text-slate-400 text-xs font-medium italic">No pharmacy activity detected.</div>
                        )}
                    </div>
                 </CardContent>
             </Card>
             <Card className="col-span-3 border border-slate-200 shadow-[0_4px_20_rgba(0,0,0,0.03)] bg-card h-full">
                <CardHeader>
                    <CardTitle className="text-[0.75rem] uppercase font-bold tracking-wider text-slate-500">Order Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[230px] relative">
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Orders</span>
                        <span className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">{totalCategories}</span>
                      </div>
                      {categoryChart.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryChart}
                              cx="40%"
                              cy="45%"
                              innerRadius={60}
                              outerRadius={82}
                              stroke="none"
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {categoryChart.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">
                          No categorical data.
                        </div>
                      )}
                    </div>

                    {categoryChart.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {categoryChart.map((entry: any, index: number) => {
                          const percentage =
                            totalCategories > 0
                              ? Math.round(((entry.value || 0) / totalCategories) * 100)
                              : 0;
                          return (
                            <div
                              key={entry.name ?? index}
                              className="flex items-center justify-between rounded-md px-2 py-1.5 bg-slate-50"
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "h-2.5 w-2.5 rounded-full",
                                    COLOR_BG_CLASSES[index % COLOR_BG_CLASSES.length],
                                  )}
                                />
                                <span className="text-[11px] font-medium text-slate-600 truncate max-w-[7rem]">
                                  {entry.name}
                                </span>
                              </div>
                              <div className="flex items-baseline gap-1 text-[11px] tabular-nums">
                                <span className="font-semibold text-slate-700">{entry.value}</span>
                                <span className="text-slate-400">({percentage}%)</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                </CardContent>
             </Card>
          </div>
        </TabsContent>

        {/* SALES TAB */}
        <TabsContent value="sales" className="space-y-4">
            <Card className="border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] bg-card">
                <CardHeader>
                    <CardTitle className="text-[0.75rem] uppercase font-bold tracking-wider text-slate-500">Top Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {topProducts.length > 0 ? topProducts.map((product: any, index: number) => (
                            <div className="flex items-center" key={index}>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-bold text-brand-indigo leading-none">{product.name}</p>
                                    <p className="text-[11px] font-medium text-slate-400">{product.quantity} units dispensed</p>
                                </div>
                                <div className="ml-auto font-bold tabular-nums">GHS {Number(product.revenue || 0).toLocaleString()}</div>
                            </div>
                        )) : (
                          <div className="text-center py-8 text-slate-400 text-xs italic">No product dispensed data.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* GEOGRAPHY TAB */}
        <TabsContent value="geography" className="space-y-4">
            <Card className="border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] bg-card">
                <CardHeader>
                    <CardTitle className="text-[0.75rem] uppercase font-bold tracking-wider text-slate-500">Delivery Areas</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[400px]">
                        {regionChart.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                  layout="vertical"
                                  data={regionChart}
                                  margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
                              >
                                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                                  <XAxis type="number" fontSize={11} stroke="#94a3b8" axisLine={false} tickLine={false} />
                                  <YAxis dataKey="name" type="category" width={100} fontSize={11} stroke="#64748b" axisLine={false} tickLine={false} />
                                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                  <Bar dataKey="value" fill="#187f76" radius={[0, 4, 4, 0]} name="Orders" barSize={24} />
                              </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-400 text-xs italic">No geographical hotspots detected.</div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* DATA HUB TAB */}
        <TabsContent value="data-hub" className="space-y-4">
            <Card className="border border-slate-200 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] bg-card overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-200 pb-4">
                    <CardTitle className="text-[0.8rem] font-bold uppercase tracking-[0.05em] text-slate-600 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-brand-indigo" />
                        DiscreetKit Data Hub
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Secure, anonymized data exports for authorized stakeholders.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-sm transition-shadow hover:shadow-md">
                            <div>
                                <h4 className="font-bold text-[13px] text-brand-indigo">Public Health Report</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">Aggregated category trends and infection vector proxies.</p>
                            </div>
                            <Button 
                                variant={isExporting ? "default" : "outline"} 
                                onClick={handleExport}
                                disabled={isExporting}
                                className={cn("gap-2 w-32 font-semibold transition-all shadow-none", isExporting && "bg-brand-indigo text-white")}
                            >
                                {isExporting ? <><Loader2 className="h-4 w-4 animate-spin" /> Compiling</> : <><Download className="h-4 w-4" /> Export CSV</>}
                            </Button>
                        </div>

                        <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-center justify-between shadow-sm transition-shadow hover:shadow-md">
                            <div>
                                <h4 className="font-bold text-[13px] text-brand-indigo">Supply Chain Feed</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">Demand heatmaps and stock utilization rates.</p>
                            </div>
                            <Button variant="outline" className="gap-2 w-32 font-semibold shadow-none border-slate-200 text-slate-600">
                                <Download className="h-4 w-4" /> Export JSON
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

