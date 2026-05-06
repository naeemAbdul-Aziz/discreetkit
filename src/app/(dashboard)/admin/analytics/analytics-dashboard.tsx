"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSSE } from "@/hooks/use-sse";
import { StatCard } from "@/components/dashboard/stat-card";
import { Icon as DKIcon } from "@/components/ui/icon";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";

// ─── Standardized Colour tokens ────────────────────────────────────────────────
const CAT_COLORS = ["#0f172a", "#14b8a6", "#64748b", "#94a3b8", "#cbd5e1"];

// ─── Tooltip components ─────────────────────────────────────────────────────
const RevenueTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[20px] border border-slate-100 bg-white px-5 py-4 shadow-2xl shadow-slate-900/10 transition-none">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">{label}</p>
      <p className="text-[18px] font-black text-slate-900 tabular-nums uppercase tracking-tighter">
        ₵{Number(payload[0]?.value ?? 0).toLocaleString()}
      </p>
    </div>
  );
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[20px] border border-slate-100 bg-white px-4 py-3 shadow-2xl shadow-slate-900/10 transition-none">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{label}</p>
      <p className="text-[15px] font-black text-slate-900 uppercase tracking-tight">{payload[0].value} ORDERS_MAPPED</p>
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
    badgeColor: "bg-teal-50 text-teal-600 border-teal-100",
  },
  {
    id: "gac",
    stakeholder: "Ghana AIDS Commission",
    title: "HIV & STI Access Report",
    description: "HIV test kit demand trends, geographic hotspots, and anonymized access frequency. UNAIDS 95-95-95 cascade proxy indicators.",
    format: "CSV",
    badge: "GAC Ready",
    badgeColor: "bg-slate-50 text-slate-600 border-slate-100",
  },
  {
    id: "msi",
    stakeholder: "Marie Stopes Ghana",
    title: "SRH Adherence & Reach",
    description: "Contraceptive and SRH product demand with refill subscription adherence rates. Aligned with MSI evidence framework.",
    format: "CSV",
    badge: "MSI Ready",
    badgeColor: "bg-slate-50 text-slate-600 border-slate-100",
  },
  {
    id: "pharmacy",
    stakeholder: "Pharmacy Partners",
    title: "Partner Network Summary",
    description: "Pharmacy-level revenue, order volume, and low-stock alerts. Suitable for procurement planning and stock optimization.",
    format: "PDF",
    badge: "Partner Report",
    badgeColor: "bg-teal-50 text-teal-600 border-teal-100",
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

  const peakBlocks = useMemo(() => {
    const blocks = [
      { label: "00:00–04:00", hours: [0,1,2,3] },
      { label: "04:00–08:00", hours: [4,5,6,7] },
      { label: "08:00–12:00", hours: [8,9,10,11] },
      { label: "12:00–16:00", hours: [12,13,14,15] },
      { label: "16:00–20:00", hours: [16,17,18,19] },
      { label: "20:00–00:00", hours: [20,21,22,23] },
    ];
    return blocks.map(b => ({
      label: b.label,
      orders: b.hours.reduce((s, h) => s + (data.peakHours[h]?.orders ?? 0), 0),
    }));
  }, [data.peakHours]);

  const handleExport = (id: string) => {
    setExporting(id);
    setTimeout(() => setExporting(null), 2000);
  };

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-12 transition-none">

      {/* ── KPI STRIP ──────────────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          title="Total Sales"
          value={`₵${data.totalRevenue.toLocaleString()}`}
          icon="payments"
          description="Total confirmed revenue"
        />
        <StatCard
          title="Total Orders"
          value={data.totalOrders}
          icon="shopping_cart"
          description="Success count"
        />
        <StatCard
          title="Customers"
          value={data.totalUniqueCustomers}
          icon="group"
          description={`${repeatRate}% Repeat Ratio`}
        />
        <StatCard
          title="Processing"
          value={data.activeOrders}
          icon="query_stats"
          description="Active fulfillment"
        />
        <StatCard
          title="Avg. Order"
          value={`₵${avgOrder}`}
          icon="trending_up"
          description="Yield per node"
        />
        <StatCard
          title="Avg. Wait Time"
          value={`${data.fulfillmentVelocity}h`}
          icon="inventory_2"
          description="Latency nominal"
        />
      </div>

      {/* ── TABS ───────────────────────────────────────────────────────── */}
      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="bg-slate-100/50 p-1.5 rounded-2xl h-14 w-fit gap-1 border border-slate-200/60 shadow-sm">
          {[
            { value: "overview",  label: "Overview" },
            { value: "health",    label: "Public Health" },
            { value: "network",   label: "Pharmacy Network" },
            { value: "hub",       label: "Data Hub" },
          ].map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                "rounded-xl px-6 h-11 text-[11px] font-bold tracking-wide transition-all data-[state=active]:bg-white data-[state=active]:text-brand-indigo data-[state=active]:shadow-sm text-slate-500 hover:text-slate-900",
              )}
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-8 focus-visible:outline-none">
          {/* Revenue chart */}
          <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Sales Over Time</CardTitle>
                  <CardDescription className="text-xs text-slate-500 mt-1">Operational yield across the global network matrix</CardDescription>
                </div>
                <Badge variant="outline" className="bg-slate-50 text-brand-teal border-teal-100 font-bold px-3 py-1">
                  Live Pulse
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="h-[320px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevAnalytics" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} minTickGap={28} dy={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `₵${v}`} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <Tooltip content={<RevenueTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#4f46e5" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorRevAnalytics)" 
                        dot={false} 
                        activeDot={{ r: 4, strokeWidth: 0, fill: "#4f46e5" }} 
                        connectNulls 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300 text-[11px] font-medium">
                    <DKIcon name="history" className="h-10 w-10 mb-4 opacity-20" />
                    No historical data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order status donut | Category demand */}
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Status donut */}
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Order Status Breakdown</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-1">Lifecycle distribution across fulfillment nodes</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                {data.orderStatusBreakdown.length > 0 ? (
                  <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="relative h-[200px] w-[200px] shrink-0">
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                        <span className="text-3xl font-bold text-slate-900 tabular-nums tracking-tight leading-none">{totalStatusOrders}</span>
                      </div>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={data.orderStatusBreakdown} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={70} 
                            outerRadius={95} 
                            stroke="none" 
                            paddingAngle={4} 
                            dataKey="value"
                          >
                            {data.orderStatusBreakdown.map((entry, i) => <Cell key={i} fill={entry.color === "#4f46e5" ? "#0f172a" : entry.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 30px -10px rgb(0 0 0 / 0.1)", fontWeight: 600, fontSize: 11 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 w-full space-y-4">
                      {data.orderStatusBreakdown.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-[24px] bg-slate-50/50 border border-slate-50 transition-none group hover:bg-white hover:border-slate-100 hover:shadow-lg hover:shadow-slate-900/5">
                          <div className="flex items-center gap-4">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color === "#4f46e5" ? "#0f172a" : s.color }} />
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">{s.name}</span>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="text-[14px] font-black text-slate-900 tabular-nums">{s.value}</span>
                            <div className="h-8 px-4 rounded-full bg-white border border-slate-100 flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest tabular-nums">
                              {totalStatusOrders > 0 ? Math.round((s.value / totalStatusOrders) * 100) : 0}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-200 uppercase tracking-[0.3em] text-[11px] font-black italic">NO_DATA_MAPPED</div>
                )}
              </CardContent>
            </Card>

            {/* SRH category demand */}
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Category Demand</CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-1">Units dispensed by clinical classification</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                {data.categoryBreakdown.length > 0 ? (
                  <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="h-[200px] w-[200px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data.categoryBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90} stroke="none" paddingAngle={4} dataKey="value">
                            {data.categoryBreakdown.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 w-full space-y-5 pt-2">
                      {data.categoryBreakdown.map((c, i) => (
                        <div key={i} className="group">
                          <div className="flex justify-between text-[11px] font-black mb-2 uppercase tracking-[0.2em]">
                            <span className="text-slate-400 flex items-center gap-3">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }} />
                              {c.name}
                            </span>
                            <span className="text-slate-900 tabular-nums">{c.value} UNITS</span>
                          </div>
                          <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                            <div className="h-full rounded-full transition-none" style={{ width: `${Math.round((c.value / (data.categoryBreakdown[0]?.value || 1)) * 100)}%`, backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-200 uppercase tracking-[0.3em] text-[11px] font-black italic">NO_DATA_MAPPED</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── PUBLIC HEALTH TAB ─────────────────────────────────────────── */}
        <TabsContent value="health" className="space-y-8 focus-visible:outline-none">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Geographic coverage */}
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                  <DKIcon name="location_on" className="text-brand-indigo/60" opticalSize={16} />
                  Regional Delivery Matrix
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-1">Protocol volume mapped by regional terminal nodes</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                {data.topAreas.length > 0 ? (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={data.topAreas} margin={{ top: 0, right: 30, left: 80, bottom: 0 }}>
                        <XAxis type="number" fontSize={10} stroke="#cbd5e1" axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" fontSize={10} stroke="#64748b" axisLine={false} tickLine={false} width={80} textAnchor="end" />
                        <Tooltip content={<BarTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="value" fill="#14b8a6" radius={[0, 10, 10, 0]} barSize={24} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-200 uppercase tracking-[0.3em] text-[11px] font-black italic">NO_DATA_MAPPED</div>
                )}
              </CardContent>
            </Card>

            {/* Peak ordering times */}
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                  <DKIcon name="schedule" className="text-brand-indigo/60" opticalSize={16} />
                  Temporal Order Density
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-1">Temporal mapping of protocol initialization frequency</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakBlocks} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                      <XAxis dataKey="label" fontSize={9} stroke="#cbd5e1" axisLine={false} tickLine={false} />
                      <YAxis fontSize={10} stroke="#cbd5e1" axisLine={false} tickLine={false} />
                      <Tooltip content={<BarTooltip />} cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="orders" fill="#0f172a" radius={[10, 10, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Refill adherence | Repeat customers */}
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Refill adherence */}
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                  <DKIcon name="sync" className="text-brand-indigo/60" opticalSize={16} />
                  Refill Adherence Rate
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-1">Sustained clinical continuity proxy</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                {totalRefills > 0 ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 rounded-[32px] bg-slate-50/50 border border-slate-50">
                      <span className="text-5xl font-black text-slate-900 tracking-tighter">{adherenceRate}%</span>
                      <div className="text-right">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">NETWORK_ADHERENCE</p>
                          <div className="h-1.5 w-24 bg-brand-teal rounded-full shadow-[0_0_10px_rgba(20,184,166,0.6)] ml-auto" />
                      </div>
                    </div>
                    {[
                      { label: "Active Subscriptions",    value: data.refillActive,    color: "#14b8a6" },
                      { label: "Paused",                  value: data.refillPaused,    color: "#64748b" },
                      { label: "Discontinued",            value: data.refillCancelled, color: "#0f172a" },
                    ].map(({ label, value, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-[11px] font-black mb-2 uppercase tracking-[0.2em]">
                          <span className="text-slate-400">{label}</span>
                          <span className="text-slate-900 tabular-nums">{value} STREAMS</span>
                        </div>
                        <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                          <div className="h-full rounded-full transition-none" style={{ width: `${totalRefills > 0 ? Math.round((value / totalRefills) * 100) : 0}%`, backgroundColor: color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-slate-200 uppercase tracking-[0.3em] text-[11px] font-black italic">NO_SUBSCRIPTION_DATA</div>
                )}
              </CardContent>
            </Card>

            {/* Repeat customers */}
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                  <DKIcon name="group" className="text-brand-indigo/60" opticalSize={16} />
                  Customer Retention Index
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-1">Proxy for health equity and program stickiness</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                <div className="space-y-8 pt-2">
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { label: "UNIQUE_CUSTOMERS",   value: data.totalUniqueCustomers, color: "text-slate-900" },
                      { label: "RETURNING_NODES",    value: data.repeatCustomers,      color: "text-brand-teal" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 text-center shadow-inner">
                        <p className={cn("text-4xl font-black tabular-nums tracking-tighter", color)}>{value}</p>
                        <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.2em]">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex justify-between text-[12px] font-black mb-3 uppercase tracking-[0.3em]">
                      <span className="text-slate-400">NETWORK_RETURN_VELOCITY</span>
                      <span className="text-slate-900">{repeatRate}%</span>
                    </div>
                    <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner p-1">
                      <div className="h-full rounded-full bg-slate-900 transition-none" style={{ width: `${repeatRate}%` }} />
                    </div>
                    <p className="text-[10px] font-black text-slate-300 mt-4 uppercase tracking-[0.2em] leading-relaxed">
                      Higher return velocity indicates sustained access to clinical SRH products — key equity metric.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── PHARMACY NETWORK TAB ─────────────────────────────────────── */}
        <TabsContent value="network" className="space-y-8 focus-visible:outline-none">
          <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                <DKIcon name="hub" className="text-brand-indigo/60" opticalSize={16} />
                Partner Performance Ranking
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">Node ranking by cumulative fiscal contribution</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              {data.topPharmacies.length > 0 ? (
                <div className="space-y-6">
                  {data.topPharmacies.map((p: any, i: number) => {
                    const maxRev = data.topPharmacies[0]?.revenue || 1;
                    const pct = Math.round((p.revenue / maxRev) * 100);
                    return (
                      <div key={i} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-[12px] font-black shrink-0 shadow-lg shadow-slate-900/20">{i + 1}</span>
                            <span className="text-base font-black text-slate-800 uppercase tracking-tight">{p.name}</span>
                          </div>
                          <span className="text-[18px] font-black text-slate-900 tabular-nums uppercase tracking-tighter">₵{Number(p.revenue).toLocaleString()}</span>
                        </div>
                        <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 shadow-inner">
                          <div className="h-full rounded-full bg-slate-900 transition-none" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-200 uppercase tracking-[0.3em] text-[11px] font-black italic">NO_TERMINAL_DATA</div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-10 lg:grid-cols-2">
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                  <DKIcon name="medication" className="text-brand-indigo/60" opticalSize={16} />
                  Top Selling Products
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-1">Best selling clinical items across node matrix</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                {data.topProducts.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-50 rounded-2xl mb-4 border border-slate-100">
                      <span className="col-span-1 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">#</span>
                      <span className="col-span-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">SKU_IDENTITY</span>
                      <span className="col-span-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">UNITS</span>
                      <span className="col-span-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">YIELD</span>
                    </div>
                    {data.topProducts.map((p: any, i: number) => (
                      <div key={i} className="grid grid-cols-12 gap-4 px-4 py-4 rounded-[24px] hover:bg-slate-50 transition-none items-center group">
                        <span className="col-span-1 text-[12px] font-black text-slate-300">{i + 1}</span>
                        <div className="col-span-5">
                          <p className="text-[13px] font-black text-slate-900 uppercase tracking-tight truncate group-hover:text-brand-teal transition-colors">{p.name}</p>
                        </div>
                        <div className="col-span-3 text-right">
                          <span className="text-[14px] font-black text-slate-700 tabular-nums">×{p.quantity}</span>
                        </div>
                        <div className="col-span-3 text-right">
                          <span className="text-[14px] font-black text-slate-900 tabular-nums">₵{Number(p.revenue || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-200 uppercase tracking-[0.3em] text-[11px] font-black italic">NO_SKU_DATA</div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                  <DKIcon name="warning" className="text-amber-500/70" opticalSize={16} />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-1">Critical inventory depletion (&lt;5 Units)</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                {data.lowStockAlerts.length > 0 ? (
                  <div className="space-y-4">
                    {data.lowStockAlerts.map((alert, i) => (
                      <div key={i} className="flex items-center justify-between p-5 rounded-[32px] bg-amber-50/30 border border-amber-100 group transition-none">
                        <div>
                          <p className="text-sm font-bold text-slate-900 tracking-tight">{alert.product}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mt-1 flex items-center gap-2">
                              <DKIcon name="terminal" opticalSize={14} />
                              {alert.pharmacy}
                          </p>
                        </div>
                        <div className="h-8 px-4 rounded-full bg-amber-100 text-amber-700 flex items-center text-[10px] font-bold uppercase tracking-wider">
                          {alert.stockLevel} Units
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-slate-300 text-[11px] font-medium">
                    Inventory levels nominal
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── DATA HUB TAB ─────────────────────────────────────────────── */}
        <TabsContent value="hub" className="space-y-8 focus-visible:outline-none">
          {/* Disclaimer */}
          <div className="rounded-3xl border border-slate-200/60 bg-slate-50/50 p-8 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-indigo" />
            <div className="flex items-start gap-6">
              <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200/60 flex items-center justify-center shrink-0 shadow-sm">
                <DKIcon name="shield" className="h-6 w-6 text-brand-indigo" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">Anonymized Data Hub</h3>
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed max-w-4xl">
                  All exports are stripped of personally identifiable information (PII). Patient identifiers,
                  phone numbers, and delivery addresses are removed before export. Aggregation follows
                  Ghana Data Protection Act standards and UNAIDS privacy guidelines.
                </p>
              </div>
            </div>
          </div>

          {/* Export cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {EXPORT_CARDS.map(({ id, stakeholder, title, description, format, badge, badgeColor }) => (
              <Card key={id} className="border border-slate-200/60 shadow-sm bg-white hover:bg-slate-50 transition-colors rounded-3xl overflow-hidden group">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">{stakeholder}</p>
                    <Badge variant="outline" className={cn("px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider", badgeColor)}>
                        {badge}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2 mb-8">
                    <h4 className="text-xl font-bold text-brand-indigo tracking-tight leading-tight">{title}</h4>
                    <p className="text-[11px] font-medium text-slate-500 leading-relaxed">{description}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleExport(id)}
                    disabled={exporting === id}
                    className="w-full h-12 rounded-xl gap-2 text-xs font-bold uppercase tracking-widest border-slate-200 bg-white text-slate-600 hover:bg-brand-indigo hover:text-white transition-all shadow-sm"
                  >
                    {exporting === id
                      ? <><DKIcon name="sync" className="h-4 w-4 animate-spin" /> Initializing...</>
                      : <><DKIcon name="download" className="h-4 w-4" /> Export {format}</>}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Platform snapshot for exports */}
          <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl">
            <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                  <DKIcon name="database" className="text-brand-indigo/60" opticalSize={16} />
                  Global Manifest Snapshot
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 mt-1">Aggregated anonymized figures included in all manifest dispatches</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "Total Orders",       value: data.totalOrders, icon: "shopping_cart" },
                  { label: "Individuals Served", value: data.totalUniqueCustomers, icon: "group" },
                  { label: "Yield Generated",  value: `₵${data.totalRevenue.toLocaleString()}`, icon: "payments" },
                  { label: "Refill Adherence",   value: `${adherenceRate}%`, icon: "sync" },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center group transition-all hover:bg-white hover:shadow-lg hover:shadow-slate-900/5">
                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center mb-4 shadow-sm">
                        <DKIcon name={icon} className="h-5 w-5 text-slate-400 group-hover:text-brand-teal transition-colors" />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-lg font-bold text-slate-900 tabular-nums tracking-tight">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Footer Sync Alert */}
      <div className="pt-12 border-t border-slate-100 flex items-center gap-8 px-4">
        <div className="h-12 w-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 shadow-sm">
            <ShieldCheck className="h-7 w-7 text-teal-600" />
        </div>
        <div>
            <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em] leading-none mb-1.5">GLOBAL_ANALYTICS_PROTOCOL_SYNCHRONIZED</p>
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] leading-none">Security clearance verified. Operational telemetry stream synchronized with master network matrix.</p>
        </div>
      </div>
    </div>
  );
}

function ShieldCheck(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
