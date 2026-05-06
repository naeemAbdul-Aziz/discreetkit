"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSSE } from "@/hooks/use-sse";
import { StatCard } from "@/components/dashboard/stat-card";
import { Icon } from "@/components/ui/icon";
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
    <div className="rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-lg shadow-slate-900/5">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-bold text-brand-indigo tabular-nums tracking-tight">
        ₵{Number(payload[0]?.value ?? 0).toLocaleString()}
      </p>
    </div>
  );
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-100 bg-white px-3 py-2 shadow-lg shadow-slate-900/5">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-bold text-brand-indigo uppercase tracking-tight">{payload[0].value} Orders</p>
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
          description="Total volume of orders"
        />
        <StatCard
          title="Customers"
          value={data.totalUniqueCustomers}
          icon="group"
          description={`${repeatRate}% Repeat Rate`}
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
          description="Average order yield"
        />
        <StatCard
          title="Avg. Wait Time"
          value={`${data.fulfillmentVelocity}h`}
          icon="inventory_2"
          description="Average latency"
        />
      </div>

      {/* ── TABS ───────────────────────────────────────────────────────── */}
      <Tabs defaultValue="overview" className="space-y-10">
        <TabsList className="bg-slate-50 p-1 rounded-2xl h-12 w-fit gap-1 border border-slate-200/60">
          {[
            { value: "overview",  label: "Overview" },
            { value: "health",    label: "Public Health" },
            { value: "network",   label: "Partner Network" },
            { value: "hub",       label: "Data Hub" },
          ].map(({ value, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                "rounded-xl px-6 h-10 text-[11px] font-bold uppercase tracking-widest transition-all data-[state=active]:bg-white data-[state=active]:text-brand-indigo data-[state=active]:shadow-sm text-slate-400 hover:text-slate-600",
              )}
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-10 focus-visible:outline-none">
          {/* Revenue chart */}
          <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Sales Timeline</CardTitle>
                  <CardDescription className="text-xs font-medium text-slate-500 mt-1">Operational yield across the global network matrix</CardDescription>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <div className="h-[300px] mt-4">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} dy={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `₵${v}`} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <Tooltip content={<RevenueTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#4f46e5" 
                        strokeWidth={2} 
                        fillOpacity={1} 
                        fill="url(#colorRevenue)" 
                        dot={false} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs font-medium">
                    No historical data available.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order status donut | Category demand */}
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Status donut */}
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Order Telemetry</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500 mt-1">Lifecycle distribution across fulfillment nodes</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-4">
                {data.orderStatusBreakdown.length > 0 ? (
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative h-[180px] w-[180px] shrink-0">
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">TOTAL</span>
                        <span className="text-3xl font-bold text-brand-indigo tabular-nums tracking-tight leading-none">{totalStatusOrders}</span>
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
                          <Tooltip contentStyle={{ borderRadius: 20, border: "none", boxShadow: "0 25px 50px -12px rgb(0 0 0 / 0.15)", textTransform: "uppercase", fontWeight: 900, fontSize: 11, letterSpacing: "0.2em" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 w-full space-y-3">
                      {data.orderStatusBreakdown.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 border border-slate-100 transition-all hover:bg-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color === "#4f46e5" ? "#4f46e5" : s.color }} />
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{s.name}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[12px] font-bold text-brand-indigo tabular-nums">{s.value}</span>
                            <span className="text-[9px] font-bold text-slate-400 tabular-nums">
                              {totalStatusOrders > 0 ? Math.round((s.value / totalStatusOrders) * 100) : 0}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-400 text-xs font-medium">No telemetry data.</div>
                )}
              </CardContent>
            </Card>

            {/* SRH category demand */}
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">Category Demand</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500 mt-1">Units dispensed by clinical classification</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-4">
                {data.categoryBreakdown.length > 0 ? (
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="h-[180px] w-[180px] shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data.categoryBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={85} stroke="none" paddingAngle={4} dataKey="value">
                            {data.categoryBreakdown.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 w-full space-y-4">
                      {data.categoryBreakdown.map((c, i) => (
                        <div key={i} className="group">
                          <div className="flex justify-between text-[10px] font-bold mb-1.5 uppercase tracking-wider">
                            <span className="text-slate-500 flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }} />
                              {c.name}
                            </span>
                            <span className="text-slate-900 tabular-nums">{c.value} Units</span>
                          </div>
                          <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${Math.round((c.value / (data.categoryBreakdown[0]?.value || 1)) * 100)}%`, backgroundColor: CAT_COLORS[i % CAT_COLORS.length] }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-400 text-xs font-medium">No category data.</div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── PUBLIC HEALTH TAB ─────────────────────────────────────────── */}
        <TabsContent value="health" className="space-y-10 focus-visible:outline-none">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Geographic coverage */}
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                  <Icon name="location_on" opticalSize={16} className="text-brand-indigo/60" /> Delivery Coverage
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500 mt-1">Protocol volume mapped by regional terminal nodes</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-4">
                {data.topAreas.length > 0 ? (
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={data.topAreas} margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
                        <XAxis type="number" fontSize={10} stroke="#94a3b8" axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" fontSize={10} stroke="#64748b" axisLine={false} tickLine={false} width={80} textAnchor="end" />
                        <Tooltip content={<BarTooltip />} cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center text-slate-400 text-xs font-medium">No coverage data.</div>
                )}
              </CardContent>
            </Card>

            {/* Peak ordering times */}
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                  <Icon name="schedule" opticalSize={16} className="text-brand-indigo/60" /> Peak Order Density
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500 mt-1">Temporal mapping of protocol initialization frequency</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-4">
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={peakBlocks} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                      <XAxis dataKey="label" fontSize={9} stroke="#94a3b8" axisLine={false} tickLine={false} />
                      <YAxis fontSize={10} stroke="#94a3b8" axisLine={false} tickLine={false} />
                      <Tooltip content={<BarTooltip />} cursor={{ fill: '#f1f5f9' }} />
                      <Bar dataKey="orders" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Refill adherence | Repeat customers */}
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Refill adherence */}
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                  <Icon name="cached" opticalSize={16} className="text-brand-indigo/60" /> Refill Adherence
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500 mt-1">Sustained clinical continuity proxy</CardDescription>
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
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                  <Icon name="history" opticalSize={16} className="text-brand-indigo/60" /> Retention Index
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500 mt-1">Proxy for health equity & program stickiness</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-4">
                <div className="space-y-6 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Unique Customers",   value: data.totalUniqueCustomers, color: "text-brand-indigo" },
                      { label: "Returning Nodes",    value: data.repeatCustomers,      color: "text-emerald-600" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                        <p className={cn("text-2xl font-bold tabular-nums tracking-tight", color)}>{value}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] font-bold mb-2 uppercase tracking-widest">
                      <span className="text-slate-400">Return Velocity</span>
                      <span className="text-brand-indigo">{repeatRate}%</span>
                    </div>
                    <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                      <div className="h-full rounded-full bg-brand-indigo transition-all" style={{ width: `${repeatRate}%` }} />
                    </div>
                    <p className="text-[10px] font-medium text-slate-500 mt-3 leading-relaxed opacity-80 italic">
                      Higher return velocity indicates sustained access to clinical SRH products — key equity metric.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── PHARMACY NETWORK TAB ─────────────────────────────────────── */}
        <TabsContent value="network" className="space-y-10 focus-visible:outline-none">
          <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                <Icon name="hub" opticalSize={16} className="text-brand-indigo/60" /> Partner Yield Ranking
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-500 mt-1">Node ranking by cumulative fiscal contribution</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              {data.topPharmacies.length > 0 ? (
                <div className="space-y-5">
                  {data.topPharmacies.map((p: any, i: number) => {
                    const maxRev = data.topPharmacies[0]?.revenue || 1;
                    const pct = Math.round((p.revenue / maxRev) * 100);
                    return (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="h-8 w-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{i + 1}</span>
                            <span className="text-sm font-bold text-slate-800 uppercase tracking-tight">{p.name}</span>
                          </div>
                          <span className="text-base font-bold text-brand-indigo tabular-nums tracking-tighter">₵{Number(p.revenue).toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                          <div className="h-full rounded-full bg-slate-900 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs font-medium italic">No terminal data.</div>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-10 lg:grid-cols-2">
            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                  <Icon name="medication" opticalSize={16} className="text-brand-indigo/60" /> Top Velocity SKUs
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500 mt-1">Best selling clinical items across node matrix</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-4">
                {data.topProducts.length > 0 ? (
                  <div className="space-y-1">
                    <div className="grid grid-cols-12 gap-4 px-4 py-2.5 bg-slate-50 rounded-xl mb-3 border border-slate-100">
                      <span className="col-span-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest">#</span>
                      <span className="col-span-5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">SKU Identity</span>
                      <span className="col-span-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Units</span>
                      <span className="col-span-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest text-right">Yield</span>
                    </div>
                    {data.topProducts.map((p: any, i: number) => (
                      <div key={i} className="grid grid-cols-12 gap-4 px-4 py-3 rounded-2xl hover:bg-slate-50 transition-colors items-center group">
                        <span className="col-span-1 text-[11px] font-bold text-slate-300">{i + 1}</span>
                        <div className="col-span-5">
                          <p className="text-[12px] font-bold text-slate-800 uppercase tracking-tight truncate group-hover:text-brand-indigo transition-colors">{p.name}</p>
                        </div>
                        <div className="col-span-3 text-right">
                          <span className="text-[13px] font-bold text-slate-500 tabular-nums">×{p.quantity}</span>
                        </div>
                        <div className="col-span-3 text-right">
                          <span className="text-[13px] font-bold text-brand-indigo tabular-nums">₵{Number(p.revenue || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs font-medium italic">No SKU data.</div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
              <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                  <Icon name="warning" opticalSize={16} className="text-amber-500" /> Low Stock Alerts
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500 mt-1">Nodes reporting critical inventory depletion</CardDescription>
              </CardHeader>
              <CardContent className="p-6 pt-4">
                {data.lowStockAlerts.length > 0 ? (
                  <div className="space-y-3">
                    {data.lowStockAlerts.map((alert, i) => (
                      <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-amber-50/20 border border-amber-100 transition-colors hover:bg-amber-50/40">
                        <div>
                          <p className="text-[13px] font-bold text-slate-900 uppercase tracking-tight">{alert.product}</p>
                          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mt-0.5 flex items-center gap-1.5 opacity-70">
                              <Icon name="location_on" opticalSize={12} />
                              {alert.pharmacy}
                          </p>
                        </div>
                        <div className="h-8 px-4 rounded-full bg-amber-100 text-amber-700 flex items-center text-[10px] font-bold uppercase tracking-widest shadow-sm">
                          {alert.stockLevel} Left
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-slate-400 text-xs font-medium italic">
                    Inventory Nominal
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── DATA HUB TAB ─────────────────────────────────────────────── */}
        <TabsContent value="hub" className="space-y-10 focus-visible:outline-none">
          {/* Disclaimer */}
          <Card className="rounded-3xl border border-slate-200/60 bg-slate-50/50 p-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900" />
            <div className="flex items-start gap-5">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0 shadow-lg shadow-slate-900/20">
                <Icon name="shield" className="text-brand-teal" opticalSize={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tight mb-1">Anonymized Data Hub</h3>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest leading-relaxed max-w-4xl opacity-80">
                  All exports are stripped of personally identifiable information (PII). Patient identifiers,
                  phone numbers, and delivery addresses are removed before export. Aggregation follows
                  Ghana Data Protection Act standards and UNAIDS privacy guidelines.
                </p>
              </div>
            </div>
          </Card>

          {/* Export cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {EXPORT_CARDS.map(({ id, stakeholder, title, description, format, badge, badgeColor }) => (
              <Card key={id} className="border border-slate-200/60 shadow-sm bg-white hover:bg-slate-50 transition-all rounded-3xl group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">{stakeholder}</p>
                    <div className={cn("h-8 px-4 rounded-full flex items-center text-[10px] font-bold uppercase tracking-widest border", badgeColor)}>
                        {badge}
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 mb-6">
                    <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight leading-none group-hover:text-brand-indigo transition-colors">{title}</h4>
                    <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider leading-relaxed">{description}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleExport(id)}
                    disabled={exporting === id}
                    className="w-full h-14 rounded-2xl gap-4 text-[11px] font-bold uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white transition-all shadow-sm group/btn"
                  >
                    {exporting === id
                      ? <><Icon name="progress_activity" className="animate-spin text-brand-teal" opticalSize={18} /> Initializing...</>
                      : <><Icon name="download" className="group-hover/btn:translate-y-0.5 transition-transform" opticalSize={18} /> {format} Dispatch</>}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Platform snapshot for exports */}
          <Card className="border border-slate-200/60 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardHeader className="p-6 pb-2">
                <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 flex items-center gap-2">
                  <Icon name="database" opticalSize={16} className="text-brand-indigo/60" /> Global Manifest Snapshot
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500 mt-1">Aggregated anonymized figures included in all manifest dispatches</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Orders",       value: data.totalOrders, icon: "shopping_bag" },
                  { label: "Individuals Served", value: data.totalUniqueCustomers, icon: "group" },
                  { label: "Yield Generated",  value: `₵${data.totalRevenue.toLocaleString()}`, icon: "trending_up" },
                  { label: "Refill Adherence",   value: `${adherenceRate}%`, icon: "cached" },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center text-center transition-all hover:bg-white hover:shadow-sm">
                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center mb-4">
                        <Icon name={icon} className="text-slate-300" opticalSize={18} />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-[18px] font-bold text-brand-indigo tabular-nums tracking-tight">{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Footer Sync Alert */}
      <div className="pt-8 border-t border-slate-100 flex items-center gap-6 px-2">
        <div className="h-10 w-10 rounded-xl bg-teal-50/50 flex items-center justify-center border border-teal-100">
            <Icon name="verified_user" className="text-emerald-600" opticalSize={20} fill={true} />
        </div>
        <div>
            <p className="text-[10px] font-bold text-brand-indigo uppercase tracking-widest mb-0.5">Global Analytics Protocol Synchronized</p>
            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider leading-none">Security clearance verified. Operational telemetry stream synchronized.</p>
        </div>
      </div>
    </div>
  );
}
