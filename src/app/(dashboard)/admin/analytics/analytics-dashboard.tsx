"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSSE } from "@/hooks/use-sse";
import {
  Download, TrendingUp, Users, ShoppingBag, Activity,
  Clock, Package, MapPin, Loader2, ArrowUpRight,
  Shield, RefreshCw, AlertTriangle, Repeat2, Pill,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";

// ─── Colour tokens ──────────────────────────────────────────────────────────
const CAT_COLORS = ["#4f46e5", "#0d9488", "#f59e0b", "#8b5cf6", "#64748b"];

// ─── Tooltip components ─────────────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-[15px] font-bold text-slate-900 tabular-nums">
        GHS {Number(payload[0]?.value ?? 0).toLocaleString()}
      </p>
    </div>
  );
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="text-[13px] font-bold text-slate-900">{payload[0].value} orders</p>
    </div>
  );
};

// ─── Types ──────────────────────────────────────────────────────────────────
interface AnalyticsDashboardProps {
  data: {
    totalRevenue: number;
    totalOrders: number;
    activeOrders: number;
    activePatients: number;
    fulfillmentVelocity: string;
    revenueChart: any[];
    topProducts: any[];
    topPharmacies: any[];
    orderStatusBreakdown: { name: string; key: string; value: number; color: string }[];
    categoryBreakdown: { name: string; value: number }[];
    topAreas: { name: string; value: number }[];
    peakHours: { hour: string; orders: number }[];
    totalUniqueCustomers: number;
    repeatCustomers: number;
    refillActive: number;
    refillPaused: number;
    refillCancelled: number;
    lowStockAlerts: { product: string; pharmacy: string; stockLevel: number; reorderLevel: number }[];
  };
}

// ─── Export cards config ────────────────────────────────────────────────────
const EXPORT_CARDS = [
  {
    id: "moh",
    stakeholder: "Ministry of Health",
    title: "SRH Coverage Report",
    description: "Aggregated category demand, regional order volume, and fulfillment rates. Aligned with Ghana HSSP 2022-2025 CORE indicators.",
    format: "CSV",
    badge: "MOH Ready",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "gac",
    stakeholder: "Ghana AIDS Commission",
    title: "HIV & STI Access Report",
    description: "HIV test kit demand trends, geographic hotspots, and anonymized access frequency. UNAIDS 95-95-95 cascade proxy indicators.",
    format: "CSV",
    badge: "GAC Ready",
    badgeColor: "bg-violet-50 text-violet-700 border-violet-200",
  },
  {
    id: "msi",
    stakeholder: "Marie Stopes Ghana",
    title: "SRH Adherence & Reach",
    description: "Contraceptive and SRH product demand with refill subscription adherence rates. Aligned with MSI evidence framework.",
    format: "CSV",
    badge: "MSI Ready",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-200",
  },
  {
    id: "pharmacy",
    stakeholder: "Pharmacy Partners",
    title: "Partner Network Summary",
    description: "Pharmacy-level revenue, order volume, and low-stock alerts. Suitable for procurement planning and stock optimization.",
    format: "PDF",
    badge: "Partner Report",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
] as const;

// ─── Main component ─────────────────────────────────────────────────────────
export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const router = useRouter();
  const [exporting, setExporting] = useState<string | null>(null);

  useSSE('/api/admin/realtime/orders', {
    onMessage: (e) => {
      try { if (JSON.parse(e.data)?.type === 'orders') router.refresh(); } catch {}
    },
  });

  const avgOrder = data.totalOrders > 0
    ? Math.round(data.totalRevenue / data.totalOrders)
    : 0;

  const repeatRate = data.totalUniqueCustomers > 0
    ? Math.round((data.repeatCustomers / data.totalUniqueCustomers) * 100)
    : 0;

  const totalRefills = data.refillActive + data.refillPaused + data.refillCancelled;
  const adherenceRate = totalRefills > 0
    ? Math.round((data.refillActive / totalRefills) * 100)
    : 0;

  const totalStatusOrders = data.orderStatusBreakdown.reduce((s, i) => s + i.value, 0);

  const chartData = useMemo(
    () => (data.revenueChart ?? []).map(d => ({ ...d, revenue: Number(d.revenue || 0) })),
    [data.revenueChart],
  );

  // Compact peak hours — group into labelled 4-hour blocks
  const peakBlocks = useMemo(() => {
    const blocks = [
      { label: "Midnight–4am", hours: [0,1,2,3] },
      { label: "4–8am",        hours: [4,5,6,7] },
      { label: "8am–Noon",     hours: [8,9,10,11] },
      { label: "Noon–4pm",     hours: [12,13,14,15] },
      { label: "4–8pm",        hours: [16,17,18,19] },
      { label: "8pm–Midnight", hours: [20,21,22,23] },
    ];
    return blocks.map(b => ({
      label: b.label,
      orders: b.hours.reduce((s, h) => s + (data.peakHours[h]?.orders ?? 0), 0),
    }));
  }, [data.peakHours]);

  const handleExport = (id: string) => {
    setExporting(id);
    setTimeout(() => setExporting(null), 2500);
  };

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── KPI STRIP ──────────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Total Sales",       value: `GHS ${data.totalRevenue.toLocaleString()}`, sub: "All confirmed orders",        icon: TrendingUp,  color: "text-indigo-600",  bg: "bg-indigo-50" },
          { label: "Total Orders",      value: data.totalOrders,                            sub: "Orders recorded",             icon: ShoppingBag, color: "text-teal-600",    bg: "bg-teal-50" },
          { label: "Customers",         value: data.totalUniqueCustomers,                   sub: `${repeatRate}% are returning`, icon: Users,       color: "text-violet-600",  bg: "bg-violet-50" },
          { label: "Processing",        value: data.activeOrders,                           sub: "Orders in fulfillment",       icon: Activity,    color: "text-amber-600",   bg: "bg-amber-50" },
          { label: "Avg. Order",        value: `GHS ${avgOrder}`,                           sub: "Revenue per order",           icon: Package,     color: "text-indigo-600",  bg: "bg-indigo-50" },
          { label: "Avg. Wait Time",    value: `${data.fulfillmentVelocity}h`,             sub: "Order to delivery",           icon: Clock,       color: "text-teal-600",    bg: "bg-teal-50" },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <Card key={label} className="border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", bg)}>
                  <Icon className={cn("h-4 w-4", color)} />
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-200" />
              </div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
              <p className="text-[20px] font-black text-slate-900 tabular-nums leading-tight">{value}</p>
              <p className="text-[10px] text-slate-400 mt-1">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── TABS ───────────────────────────────────────────────────────── */}
      <Tabs defaultValue="overview" className="space-y-5">
        <TabsList className="bg-slate-100 p-1 rounded-full h-10 w-fit gap-0.5">
          {[
            { value: "overview",  label: "Overview" },
            { value: "health",    label: "Public Health" },
            { value: "network",   label: "Pharmacy Network" },
            { value: "hub",       label: "Data Hub", special: true },
          ].map(({ value, label, special }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                "rounded-full px-5 text-xs font-semibold data-[state=active]:shadow-sm data-[state=active]:bg-white",
                special && "data-[state=active]:bg-indigo-600 data-[state=active]:text-white",
              )}
            >
              {special && <Shield className="h-3 w-3 mr-1.5 inline-block" />}
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-6">
          {/* Revenue chart */}
          <Card className="border border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[13px] font-bold text-slate-700">Daily Sales — Last 30 Days</CardTitle>
                  <CardDescription className="text-[11px] mt-0.5">Revenue across all partner pharmacies</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] border-emerald-200 text-emerald-600 bg-emerald-50/50 font-semibold">Live</Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pl-0 pb-2">
              <div className="h-[240px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.12} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} minTickGap={28} />
                      <YAxis stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `₵${v}`} width={44} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <Tooltip content={<RevenueTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#gradRev)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} connectNulls />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">No sales data for this period.</div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order status donut | Category demand */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Status donut */}
            <Card className="border border-slate-200/80 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-[13px] font-bold text-slate-700">Order Status Breakdown</CardTitle>
                <CardDescription className="text-[11px]">Current distribution across fulfillment stages</CardDescription>
              </CardHeader>
              <CardContent>
                {data.orderStatusBreakdown.length > 0 ? (
                  <div className="flex items-center gap-6">
                    <div className="relative h-[160px] w-[160px] shrink-0">
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total</span>
                        <span className="text-2xl font-black text-slate-900">{totalStatusOrders}</span>
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data.orderStatusBreakdown} cx="50%" cy="50%" innerRadius={52} outerRadius={72} stroke="none" paddingAngle={2} dataKey="value">
                            {data.orderStatusBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                          </Pie>
                          <Tooltip formatter={(v: any) => [`${v} orders`, ""]} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-3">
                      {data.orderStatusBreakdown.map((s, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                            <span className="text-[12px] font-medium text-slate-600">{s.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-bold text-slate-800 tabular-nums">{s.value}</span>
                            <span className="text-[10px] text-slate-400 w-8 text-right">
                              {totalStatusOrders > 0 ? Math.round((s.value / totalStatusOrders) * 100) : 0}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-400 text-xs">No order data.</div>
                )}
              </CardContent>
            </Card>

            {/* SRH category demand */}
            <Card className="border border-slate-200/80 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-[13px] font-bold text-slate-700">SRH Product Demand</CardTitle>
                <CardDescription className="text-[11px]">Units dispensed by health category</CardDescription>
              </CardHeader>
              <CardContent>
                {data.categoryBreakdown.length > 0 ? (
                  <div className="flex items-start gap-4">
                    <div className="h-[160px] w-[160px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data.categoryBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={70} stroke="none" paddingAngle={2} dataKey="value">
                            {data.categoryBreakdown.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v: any) => [`${v} units`, ""]} contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-3 pt-2">
                      {data.categoryBreakdown.map((c, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-[11px] mb-1">
                            <span className="font-medium text-slate-600 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }} />
                              {c.name}
                            </span>
                            <span className="font-bold text-slate-800 tabular-nums">{c.value} units</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.round((c.value / (data.categoryBreakdown[0]?.value || 1)) * 100)}%`, backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-400 text-xs">No product data to classify.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── PUBLIC HEALTH TAB ─────────────────────────────────────────── */}
        <TabsContent value="health" className="space-y-6">
          {/* Geo coverage + peak hours */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Geographic coverage */}
            <Card className="border border-slate-200/80 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-600" />
                  <CardTitle className="text-[13px] font-bold text-slate-700">Delivery Coverage by Area</CardTitle>
                </div>
                <CardDescription className="text-[11px]">Order volume per area — useful for identifying underserved regions</CardDescription>
              </CardHeader>
              <CardContent>
                {data.topAreas.length > 0 ? (
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={data.topAreas} margin={{ top: 0, right: 12, left: 70, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" fontSize={10} stroke="#cbd5e1" axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" fontSize={10} stroke="#64748b" axisLine={false} tickLine={false} width={70} />
                        <Tooltip content={<BarTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="value" fill="#0d9488" radius={[0, 5, 5, 0]} barSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-400 text-xs">No delivery area data available.</div>
                )}
              </CardContent>
            </Card>

            {/* Peak ordering times */}
            <Card className="border border-slate-200/80 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-[13px] font-bold text-slate-700">When People Order</CardTitle>
                <CardDescription className="text-[11px]">Order frequency by time of day — informs staffing and outreach timing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakBlocks} margin={{ top: 0, right: 12, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="label" fontSize={9} stroke="#cbd5e1" axisLine={false} tickLine={false} />
                      <YAxis fontSize={10} stroke="#cbd5e1" axisLine={false} tickLine={false} />
                      <Tooltip content={<BarTooltip />} cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="orders" fill="#4f46e5" radius={[5, 5, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Refill adherence | Repeat customers */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Refill adherence */}
            <Card className="border border-slate-200/80 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 text-violet-600" />
                  <CardTitle className="text-[13px] font-bold text-slate-700">Medication Refill Adherence</CardTitle>
                </div>
                <CardDescription className="text-[11px]">Proxy for treatment continuity — key indicator for MOH & Marie Stopes</CardDescription>
              </CardHeader>
              <CardContent>
                {totalRefills > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-black text-slate-900">{adherenceRate}%</span>
                      <span className="text-[11px] text-slate-400">adherence rate</span>
                    </div>
                    {[
                      { label: "Active Subscriptions",    value: data.refillActive,    color: "#10b981" },
                      { label: "Paused",                  value: data.refillPaused,    color: "#f59e0b" },
                      { label: "Discontinued",            value: data.refillCancelled, color: "#f43f5e" },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="font-medium text-slate-600">{label}</span>
                          <span className="font-bold text-slate-800">{value}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${totalRefills > 0 ? Math.round((value / totalRefills) * 100) : 0}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-slate-400 text-xs">No refill subscription data.</div>
                )}
              </CardContent>
            </Card>

            {/* Repeat customers */}
            <Card className="border border-slate-200/80 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Repeat2 className="h-3.5 w-3.5 text-indigo-600" />
                  <CardTitle className="text-[13px] font-bold text-slate-700">Customer Retention</CardTitle>
                </div>
                <CardDescription className="text-[11px]">Proxy for sustained access to SRH care — measures program stickiness</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Unique Customers",   value: data.totalUniqueCustomers, color: "text-indigo-600" },
                      { label: "Returning Customers", value: data.repeatCustomers,      color: "text-teal-600" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
                        <p className={cn("text-2xl font-black tabular-nums", color)}>{value}</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1.5">
                      <span className="text-slate-500 font-medium">Return rate</span>
                      <span className="font-bold text-slate-800">{repeatRate}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-500 transition-all duration-700" style={{ width: `${repeatRate}%` }} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">
                      A higher return rate indicates sustained access to SRH products — a key health equity signal.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── PHARMACY NETWORK TAB ─────────────────────────────────────── */}
        <TabsContent value="network" className="space-y-6">
          {/* Partner performance */}
          <Card className="border border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-[13px] font-bold text-slate-700">Partner Pharmacy Performance</CardTitle>
              <CardDescription className="text-[11px]">Ranked by total revenue contribution</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topPharmacies.length > 0 ? (
                <div className="space-y-4">
                  {data.topPharmacies.map((p: any, i: number) => {
                    const maxRev = data.topPharmacies[0]?.revenue || 1;
                    const pct = Math.round((p.revenue / maxRev) * 100);
                    return (
                      <div key={i} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="h-6 w-6 rounded-md bg-indigo-50 text-indigo-700 flex items-center justify-center text-[10px] font-black shrink-0">{i + 1}</span>
                            <span className="text-[13px] font-semibold text-slate-800 truncate max-w-[200px]">{p.name}</span>
                          </div>
                          <span className="text-[13px] font-bold text-slate-800 tabular-nums shrink-0">GHS {Number(p.revenue).toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">No pharmacy data available.</div>
              )}
            </CardContent>
          </Card>

          {/* Top products table + Low stock alerts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border border-slate-200/80 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Pill className="h-3.5 w-3.5 text-violet-600" />
                  <CardTitle className="text-[13px] font-bold text-slate-700">Best Selling Products</CardTitle>
                </div>
                <CardDescription className="text-[11px]">Most ordered items across all partner pharmacies</CardDescription>
              </CardHeader>
              <CardContent>
                {data.topProducts.length > 0 ? (
                  <div className="space-y-1">
                    <div className="grid grid-cols-12 gap-2 px-2 py-1.5">
                      <span className="col-span-1 text-[9px] font-bold text-slate-400 uppercase">#</span>
                      <span className="col-span-5 text-[9px] font-bold text-slate-400 uppercase">Product</span>
                      <span className="col-span-3 text-[9px] font-bold text-slate-400 uppercase text-right">Units</span>
                      <span className="col-span-3 text-[9px] font-bold text-slate-400 uppercase text-right">Revenue</span>
                    </div>
                    {data.topProducts.map((p: any, i: number) => (
                      <div key={i} className="grid grid-cols-12 gap-2 px-2 py-2.5 rounded-lg hover:bg-slate-50 transition-colors items-center">
                        <span className="col-span-1 text-[11px] font-bold text-slate-300">{i + 1}</span>
                        <div className="col-span-5">
                          <p className="text-[12px] font-semibold text-slate-800 truncate">{p.name}</p>
                        </div>
                        <div className="col-span-3 text-right">
                          <span className="text-[12px] font-bold text-slate-700 tabular-nums">{p.quantity}</span>
                        </div>
                        <div className="col-span-3 text-right">
                          <span className="text-[12px] font-bold text-indigo-600 tabular-nums">GHS {Number(p.revenue || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">No product data.</div>
                )}
              </CardContent>
            </Card>

            {/* Low stock alerts */}
            <Card className="border border-slate-200/80 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  <CardTitle className="text-[13px] font-bold text-slate-700">Low Stock Alerts</CardTitle>
                </div>
                <CardDescription className="text-[11px]">
                  Products at &lt; 5 units — may require restocking
                  <span className="ml-1 text-slate-400 italic">(data may be up to 24h stale)</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.lowStockAlerts.length > 0 ? (
                  <div className="space-y-2">
                    {data.lowStockAlerts.map((alert, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                        <div>
                          <p className="text-[12px] font-semibold text-slate-800">{alert.product}</p>
                          <p className="text-[10px] text-slate-400">{alert.pharmacy}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px] border-amber-200 bg-amber-50 text-amber-700 font-bold">
                          {alert.stockLevel} left
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-slate-400 text-xs">
                    No low-stock items detected.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── DATA HUB TAB ─────────────────────────────────────────────── */}
        <TabsContent value="hub" className="space-y-6">
          {/* Disclaimer */}
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-indigo-900">Anonymized Data Hub</h3>
                <p className="text-[11px] text-indigo-700 mt-0.5 leading-relaxed max-w-2xl">
                  All exports are stripped of personally identifiable information (PII). Patient identifiers,
                  phone numbers, and delivery addresses are removed before export. Aggregation follows
                  Ghana Data Protection Act standards and UNAIDS privacy guidelines.
                  Designed for Ministry of Health, Ghana AIDS Commission, Marie Stopes, and pharmacy partner reporting.
                </p>
              </div>
            </div>
          </div>

          {/* Export cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {EXPORT_CARDS.map(({ id, stakeholder, title, description, format, badge, badgeColor }) => (
              <Card key={id} className="border border-slate-200/80 shadow-sm bg-white hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{stakeholder}</p>
                  <div className="flex items-start gap-2 mb-2">
                    <h4 className="text-[14px] font-bold text-slate-800 leading-snug">{title}</h4>
                    <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0 mt-0.5", badgeColor)}>{badge}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-4">{description}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(id)}
                    disabled={exporting === id}
                    className="w-full gap-2 text-[12px] font-semibold border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    {exporting === id
                      ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing…</>
                      : <><Download className="h-3.5 w-3.5" /> Export {format}</>}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Platform snapshot for exports */}
          <Card className="border border-slate-200/80 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-[13px] font-bold text-slate-700">What's Included in All Exports</CardTitle>
              <CardDescription className="text-[11px]">Aggregated, anonymized figures — no individual-level data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Orders",       value: data.totalOrders },
                  { label: "Individuals Served", value: data.totalUniqueCustomers },
                  { label: "Revenue Generated",  value: `GHS ${data.totalRevenue.toLocaleString()}` },
                  { label: "Refill Adherence",   value: `${adherenceRate}%` },
                ].map(({ label, value }) => (
                  <div key={label} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-[20px] font-black text-slate-900 tabular-nums">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
