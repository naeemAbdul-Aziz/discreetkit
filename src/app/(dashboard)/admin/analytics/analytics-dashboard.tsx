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
  Shield, RefreshCw, AlertTriangle, Repeat2, Pill, Network,
  Database, History, Terminal
} from "lucide-react";
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
        {[
          { label: "Total Sales",       value: `GHS ${data.totalRevenue.toLocaleString()}`, sub: "ALL_CONFIRMED_ORDERS",        icon: TrendingUp,  color: "text-slate-900",  bg: "bg-slate-50" },
          { label: "Total Orders",      value: data.totalOrders,                            sub: "PROTOCOL_SUCCESS_COUNT",      icon: ShoppingBag, color: "text-brand-teal", bg: "bg-teal-50/50" },
          { label: "Customers",         value: data.totalUniqueCustomers,                   sub: `${repeatRate}%_REPEAT_RATIO`, icon: Users,       color: "text-slate-900",  bg: "bg-slate-50" },
          { label: "Processing",        value: data.activeOrders,                           sub: "ACTIVE_FULFILLMENT",          icon: Activity,    color: "text-brand-teal", bg: "bg-teal-50/50" },
          { label: "Avg. Order",        value: `GHS ${avgOrder}`,                           sub: "YIELD_PER_MATRIX_NODE",       icon: Package,     color: "text-slate-900",  bg: "bg-slate-50" },
          { label: "Avg. Wait Time",    value: `${data.fulfillmentVelocity}h`,             sub: "LATENCY_NOMINAL",             icon: Clock,       color: "text-brand-teal", bg: "bg-teal-50/50" },
        ].map(({ label, value, sub, icon: Icon, color, bg }) => (
          <Card key={label} className="border border-slate-100 shadow-2xl shadow-slate-900/5 rounded-[32px] bg-white hover:shadow-slate-900/10 transition-none overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500", bg)}>
                  <Icon className={cn("h-5 w-5", color)} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-100 group-hover:text-brand-teal transition-colors" />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{label}</p>
              <p className="text-[24px] font-black text-slate-900 tabular-nums leading-none tracking-tighter">{value}</p>
              <p className="text-[10px] font-black text-slate-200 mt-2 uppercase tracking-[0.2em]">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── TABS ───────────────────────────────────────────────────────── */}
      <Tabs defaultValue="overview" className="space-y-10">
        <TabsList className="bg-slate-50 p-2 rounded-full h-16 w-fit gap-2 border border-slate-100 shadow-sm">
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
                "rounded-full px-8 h-12 text-[12px] font-black uppercase tracking-[0.25em] transition-none data-[state=active]:shadow-2xl data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-slate-900/40 text-slate-400 hover:text-slate-900",
              )}
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── OVERVIEW TAB ─────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-10 focus-visible:outline-none">
          {/* Revenue chart */}
          <Card className="border border-slate-100 shadow-2xl shadow-slate-900/5 bg-white rounded-[40px] overflow-hidden">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-6 mb-2">
                    <div className="h-1.5 w-12 bg-brand-teal rounded-full shadow-[0_0_10px_rgba(20,184,166,0.6)]" />
                    <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tighter">DAILY_SALES_MANIFEST</CardTitle>
                  </div>
                  <CardDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-18">Operational yield across global network matrix (Last 30 Cycles)</CardDescription>
                </div>
                <div className="h-12 px-6 rounded-full bg-slate-900 text-brand-teal flex items-center text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/40">
                  <Activity className="h-5 w-5 mr-3" />
                  LIVE_PULSE_SYNC
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-4 pl-0 pb-6">
              <div className="h-[320px]">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                      <XAxis dataKey="date" stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} minTickGap={28} dy={10} />
                      <YAxis stroke="#cbd5e1" fontSize={10} tickLine={false} axisLine={false} tickFormatter={v => `₵${v}`} width={60} />
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                      <Tooltip content={<RevenueTooltip />} cursor={{ stroke: '#14b8a6', strokeWidth: 2, strokeDasharray: '4 4' }} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#0f172a" 
                        strokeWidth={4} 
                        fillOpacity={0.05} 
                        fill="#0f172a" 
                        dot={false} 
                        activeDot={{ r: 6, strokeWidth: 0, fill: "#14b8a6" }} 
                        connectNulls 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-200 uppercase tracking-[0.3em] text-[11px] font-black">
                    <History className="h-10 w-10 mb-4 opacity-10" />
                    NO_HISTORICAL_STREAMS_MAPPED
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order status donut | Category demand */}
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Status donut */}
            <Card className="border border-slate-100 shadow-2xl shadow-slate-900/5 bg-white rounded-[40px]">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-6 mb-2">
                  <div className="h-1.5 w-12 bg-slate-900 rounded-full" />
                  <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tighter">ORDER_STATUS_TELEMETRY</CardTitle>
                </div>
                <CardDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-18">Lifecycle distribution across fulfillment nodes</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                {data.orderStatusBreakdown.length > 0 ? (
                  <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="relative h-[200px] w-[200px] shrink-0">
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">TOTAL</span>
                        <span className="text-4xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">{totalStatusOrders}</span>
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
                    <div className="flex-1 w-full space-y-4">
                      {data.orderStatusBreakdown.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-[24px] bg-slate-50/50 border border-slate-50 transition-none group hover:bg-white hover:border-slate-100 hover:shadow-lg hover:shadow-slate-900/5">
                          <div className="flex items-center gap-4">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color === "#4f46e5" ? "#0f172a" : s.color }} />
                            <span className="text-[12px] font-black text-slate-900 uppercase tracking-[0.2em]">{s.name}</span>
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
            <Card className="border border-slate-100 shadow-2xl shadow-slate-900/5 bg-white rounded-[40px]">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-6 mb-2">
                  <div className="h-1.5 w-12 bg-brand-teal rounded-full" />
                  <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tighter">SRH_CATEGORY_DEMAND</CardTitle>
                </div>
                <CardDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-18">Units dispensed by clinical classification</CardDescription>
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
        <TabsContent value="health" className="space-y-10 focus-visible:outline-none">
          <div className="grid gap-10 lg:grid-cols-2">
            {/* Geographic coverage */}
            <Card className="border border-slate-100 shadow-2xl shadow-slate-900/5 bg-white rounded-[40px]">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-6 mb-2">
                  <MapPin className="h-6 w-6 text-brand-teal" />
                  <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tighter">DELIVERY_COVERAGE_MATRIX</CardTitle>
                </div>
                <CardDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-18">Protocol volume mapped by regional terminal nodes</CardDescription>
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
            <Card className="border border-slate-100 shadow-2xl shadow-slate-900/5 bg-white rounded-[40px]">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-6 mb-2">
                  <Clock className="h-6 w-6 text-slate-900" />
                  <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tighter">TEMPORAL_ORDER_DENSITY</CardTitle>
                </div>
                <CardDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-18">Temporal mapping of protocol initialization frequency</CardDescription>
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
            <Card className="border border-slate-100 shadow-2xl shadow-slate-900/5 bg-white rounded-[40px]">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-6 mb-2">
                  <RefreshCw className="h-6 w-6 text-brand-teal" />
                  <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tighter">MEDICATION_REFILL_ADHERENCE</CardTitle>
                </div>
                <CardDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-18">Sustained clinical continuity proxy (Clinical Grade)</CardDescription>
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
            <Card className="border border-slate-100 shadow-2xl shadow-slate-900/5 bg-white rounded-[40px]">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-6 mb-2">
                  <Repeat2 className="h-6 w-6 text-slate-900" />
                  <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tighter">RETENTION_STABILITY_INDEX</CardTitle>
                </div>
                <CardDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-18">Proxy for health equity & program stickiness</CardDescription>
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
        <TabsContent value="network" className="space-y-10 focus-visible:outline-none">
          <Card className="border border-slate-100 shadow-2xl shadow-slate-900/5 bg-white rounded-[40px]">
            <CardHeader className="p-8 pb-4">
              <div className="flex items-center gap-6 mb-2">
                <Network className="h-6 w-6 text-brand-teal" />
                <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tighter">PARTNER_TERMINAL_YIELD</CardTitle>
              </div>
              <CardDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-18">Node ranking by cumulative fiscal contribution</CardDescription>
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
            <Card className="border border-slate-100 shadow-2xl shadow-slate-900/5 bg-white rounded-[40px]">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-6 mb-2">
                  <Pill className="h-6 w-6 text-slate-900" />
                  <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tighter">TOP_VELOCITY_SKUS</CardTitle>
                </div>
                <CardDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-18">Best selling clinical items across node matrix</CardDescription>
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

            <Card className="border border-slate-100 shadow-2xl shadow-slate-900/5 bg-white rounded-[40px]">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-6 mb-2">
                  <AlertTriangle className="h-6 w-6 text-amber-500" />
                  <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tighter">LOW_STOCK_ALERTS</CardTitle>
                </div>
                <CardDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-18">Nodes reporting critical inventory depletion (&lt;5 Units)</CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-4">
                {data.lowStockAlerts.length > 0 ? (
                  <div className="space-y-4">
                    {data.lowStockAlerts.map((alert, i) => (
                      <div key={i} className="flex items-center justify-between p-5 rounded-[32px] bg-amber-50/30 border border-amber-100 group transition-none">
                        <div>
                          <p className="text-[14px] font-black text-slate-900 uppercase tracking-tight">{alert.product}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
                              <Terminal className="h-3 w-3" />
                              {alert.pharmacy}
                          </p>
                        </div>
                        <div className="h-10 px-5 rounded-full bg-amber-100 text-amber-700 flex items-center text-[12px] font-black uppercase tracking-[0.2em] shadow-sm">
                          {alert.stockLevel} CRITICAL_YIELD
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-32 flex items-center justify-center text-slate-200 uppercase tracking-[0.3em] text-[11px] font-black italic">
                    INVENTORY_NOMINAL
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── DATA HUB TAB ─────────────────────────────────────────────── */}
        <TabsContent value="hub" className="space-y-10 focus-visible:outline-none">
          {/* Disclaimer */}
          <div className="rounded-[40px] border border-slate-100 bg-slate-50/50 p-8 relative overflow-hidden shadow-2xl shadow-slate-900/5">
            <div className="absolute top-0 left-0 w-2 h-full bg-slate-900" />
            <div className="flex items-start gap-6">
              <div className="h-14 w-14 rounded-[24px] bg-slate-900 flex items-center justify-center shrink-0 shadow-2xl shadow-slate-900/30">
                <Shield className="h-7 w-7 text-brand-teal" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-2">ANONYMIZED_DATA_HUB</h3>
                <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] leading-relaxed max-w-4xl opacity-80">
                  All exports are stripped of personally identifiable information (PII). Patient identifiers,
                  phone numbers, and delivery addresses are removed before export. Aggregation follows
                  Ghana Data Protection Act standards and UNAIDS privacy guidelines.
                  Designed for Ministry of Health, Ghana AIDS Commission, Marie Stopes, and pharmacy partner reporting.
                </p>
              </div>
            </div>
          </div>

          {/* Export cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {EXPORT_CARDS.map(({ id, stakeholder, title, description, format, badge, badgeColor }) => (
              <Card key={id} className="border border-slate-100 shadow-2xl shadow-slate-900/5 bg-white hover:shadow-slate-900/10 transition-none rounded-[40px] group">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">{stakeholder}</p>
                    <div className={cn("h-10 px-5 rounded-full flex items-center text-[11px] font-black uppercase tracking-[0.2em] border shadow-sm", badgeColor)}>
                        {badge}
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 mb-8">
                    <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none group-hover:text-brand-teal transition-colors">{title}</h4>
                    <div className="h-1.5 w-16 bg-slate-100 rounded-full group-hover:w-32 group-hover:bg-brand-teal transition-all duration-500" />
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em] leading-relaxed">{description}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleExport(id)}
                    disabled={exporting === id}
                    className="w-full h-20 rounded-full gap-8 text-[13px] font-black uppercase tracking-[0.4em] border-none bg-slate-50/50 text-slate-400 hover:bg-slate-900 hover:text-white transition-none shadow-sm group/btn"
                  >
                    {exporting === id
                      ? <><Loader2 className="h-6 w-6 animate-spin text-brand-teal" /> INITIALIZING_DISPATCH…</>
                      : <><Download className="h-6 w-6 group-hover/btn:translate-y-1 transition-transform" /> {format}_MANIFEST_DISPATCH</>}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Platform snapshot for exports */}
          <Card className="border border-slate-100 shadow-2xl shadow-slate-900/5 bg-white rounded-[40px]">
            <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-6 mb-2">
                  <Database className="h-6 w-6 text-slate-900" />
                  <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tighter">GLOBAL_MANIFEST_SNAPSHOT</CardTitle>
                </div>
                <CardDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] ml-18">Aggregated anonymized figures included in all manifest dispatches</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { label: "TOTAL_ORDERS",       value: data.totalOrders, icon: ShoppingBag },
                  { label: "INDIVIDUALS_SERVED", value: data.totalUniqueCustomers, icon: Users },
                  { label: "YIELD_GENERATED",  value: `₵${data.totalRevenue.toLocaleString()}`, icon: TrendingUp },
                  { label: "REFILL_ADHERENCE",   value: `${adherenceRate}%`, icon: RefreshCw },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 shadow-inner flex flex-col items-center text-center group transition-none hover:bg-white hover:shadow-2xl hover:shadow-slate-900/5">
                    <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 duration-500">
                        <Icon className="h-6 w-6 text-slate-200 group-hover:text-brand-teal transition-colors" />
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-2">{label}</p>
                    <p className="text-[22px] font-black text-slate-900 tabular-nums uppercase tracking-tighter">{value}</p>
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
