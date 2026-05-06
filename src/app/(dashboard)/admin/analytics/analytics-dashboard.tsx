"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  Download, TrendingUp, Users, ShoppingBag, Activity,
  Clock, Package, MapPin, Shield, RefreshCw, AlertTriangle, 
  Repeat2, Pill, Loader2, ArrowUpRight, BarChart3, PieChart as PieChartIcon,
  CreditCard, CheckCircle, Terminal, Zap, ShieldCheck, Network, BarChart, ArrowRight
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart as ReBarChart, Bar, PieChart, Pie, Cell,
} from "recharts";
import { cn } from "@/lib/utils";

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
    repeatRate?: number;
    refillActive: number;
    refillPaused: number;
    refillCancelled: number;
    lowStockAlerts: { product: string; pharmacy: string; stockLevel: number; reorderLevel: number }[];
  };
}

const EXPORT_CARDS = [
  {
    id: "moh",
    stakeholder: "Ministry of Health",
    title: "SRH COVERAGE_INTELLIGENCE",
    description: "Aggregated category demand, regional order volume, and fulfillment efficiency metrics.",
    format: "CSV",
    badge: "MOH_STANDARDS",
  },
  {
    id: "gac",
    stakeholder: "Ghana AIDS Commission",
    title: "STI ACCESS_DISTRIBUTION",
    description: "Diagnostic kit demand trends, geographic hotspots, and access frequency telemetry.",
    format: "CSV",
    badge: "GAC_COMPLIANCE",
  },
  {
    id: "msi",
    stakeholder: "Marie Stopes Ghana",
    title: "ADHERENCE & REACH_AUDIT",
    description: "Contraceptive demand synchronized with refill subscription adherence metrics.",
    format: "CSV",
    badge: "MSI_REPORTING",
  },
  {
    id: "pharmacy",
    stakeholder: "Partner Network",
    title: "OPERATIONAL_NODE_SUMMARY",
    description: "Unit-level revenue, order volume distribution, and critical stock alerts.",
    format: "PDF",
    badge: "NETWORK_AUDIT",
  },
] as const;

export default function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const [exporting, setExporting] = useState<string | null>(null);

  const avgOrder = data.totalOrders > 0 ? Math.round(data.totalRevenue / data.totalOrders) : 0;
  const repeatRate = data.totalUniqueCustomers > 0 ? Math.round((data.repeatCustomers / data.totalUniqueCustomers) * 100) : 0;
  const totalRefills = data.refillActive + data.refillPaused + data.refillCancelled;
  const adherenceRate = totalRefills > 0 ? Math.round((data.refillActive / totalRefills) * 100) : 0;
  const totalStatusOrders = data.orderStatusBreakdown.reduce((s, i) => s + i.value, 0);

  const chartData = useMemo(
    () => (data.revenueChart ?? []).map(d => ({ ...d, revenue: Number(d.revenue || 0) })),
    [data.revenueChart],
  );

  const peakBlocks = useMemo(() => {
    const blocks = [
      { label: "00-04", hours: [0,1,2,3] },
      { label: "04-08", hours: [4,5,6,7] },
      { label: "08-12", hours: [8,9,10,11] },
      { label: "12-16", hours: [12,13,14,15] },
      { label: "16-20", hours: [16,17,18,19] },
      { label: "20-00", hours: [20,21,22,23] },
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

  return (
    <div className="space-y-16">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="TOTAL_REVENUE" value={`₵${data.totalRevenue.toLocaleString()}`} icon={CreditCard} description="AGGREGATE_LIQUIDITY" />
        <StatCard title="TOTAL_STREAMS" value={data.totalOrders} icon={ShoppingBag} description="LIFETIME_CYCLES" />
        <StatCard title="NODE_IDENTITY" value={data.totalUniqueCustomers} icon={Users} description={`${repeatRate}%_RETENTION`} />
        <StatCard title="ACTIVE_PULSE" value={data.activeOrders} icon={Activity} description="REALTIME_FULFILLMENT" />
        <StatCard title="MEAN_YIELD" value={`₵${avgOrder}`} icon={Package} description="VALUE_PER_NODE" />
        <StatCard title="CYCLE_VELOCITY" value={`${data.fulfillmentVelocity}H`} icon={Clock} description="NODE_TO_NODE" />
      </div>

      <Tabs defaultValue="overview" className="space-y-16">
        <div className="flex items-center justify-center lg:justify-start">
            <TabsList className="bg-slate-50 p-2.5 rounded-full h-20 border border-slate-100 gap-4 shadow-sm">
                <TabsTrigger value="overview" className="rounded-full px-12 h-14 font-black text-[12px] uppercase tracking-[0.2em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl shadow-slate-900/10 text-slate-400 transition-none">INTELLIGENCE_PULSE</TabsTrigger>
                <TabsTrigger value="health" className="rounded-full px-12 h-14 font-black text-[12px] uppercase tracking-[0.2em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl shadow-slate-900/10 text-slate-400 transition-none">PUBLIC_HEALTH</TabsTrigger>
                <TabsTrigger value="network" className="rounded-full px-12 h-14 font-black text-[12px] uppercase tracking-[0.2em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl shadow-slate-900/10 text-slate-400 transition-none">NETWORK_PERFORMANCE</TabsTrigger>
                <TabsTrigger value="hub" className="rounded-full px-12 h-14 font-black text-[12px] uppercase tracking-[0.2em] data-[state=active]:bg-brand-teal data-[state=active]:text-white data-[state=active]:shadow-2xl shadow-brand-teal/20 text-slate-400 transition-none">REPORTING_HUB</TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-16 outline-none focus-visible:outline-none">
          <Card className="border border-slate-100 bg-white rounded-[40px] shadow-2xl shadow-slate-900/5 overflow-hidden transition-none">
            <CardHeader className="bg-slate-50/30 p-12 border-b border-slate-50 flex flex-row items-center justify-between">
                <div className="flex items-center gap-8">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                        <TrendingUp className="h-7 w-7 text-brand-teal" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">Liquidity_Timeline_Matrix</CardTitle>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mt-1">Real-time aggregate revenue streams (30D Temporal)</p>
                    </div>
                </div>
                <Badge variant="neutral" className="bg-white border border-slate-100 text-slate-400 rounded-full px-6 py-2.5 text-[9px] font-black uppercase tracking-widest shadow-sm">MASTER_FEED_STATION</Badge>
            </CardHeader>
            <CardContent className="p-16 pl-4 pb-12">
              <div className="h-[480px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                    <XAxis dataKey="date" stroke="#e2e8f0" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} minTickGap={30} tick={{ fill: '#cbd5e1' }} />
                    <YAxis stroke="#e2e8f0" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} tickFormatter={v => `₵${v}`} width={80} tick={{ fill: '#cbd5e1' }} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <Tooltip 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', backgroundColor: '#0f172a', color: '#fff', padding: '16px' }}
                        cursor={{ stroke: '#0f172a', strokeWidth: 1 }}
                        itemStyle={{ color: '#2dd4bf' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#0f172a" 
                        strokeWidth={4} 
                        fillOpacity={0.03} 
                        fill="#0f172a" 
                        isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-16 lg:grid-cols-2">
            <Card className="border border-slate-100 bg-white rounded-[40px] shadow-2xl shadow-slate-900/5 overflow-hidden transition-none">
              <CardHeader className="bg-slate-50/30 p-12 border-b border-slate-50">
                <div className="flex items-center gap-8">
                    <div className="h-14 w-14 rounded-2xl bg-brand-teal flex items-center justify-center shadow-2xl shadow-brand-teal/20">
                        <Activity className="h-7 w-7 text-white" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">Operational_Pulse_Matrix</CardTitle>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mt-1">Order status distribution across network terminals</p>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-16">
                <div className="flex flex-col xl:flex-row items-center gap-20">
                  <div className="relative h-[280px] w-[280px] shrink-0">
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">AGGREGATE</span>
                        <span className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">{totalStatusOrders}</span>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                            data={data.orderStatusBreakdown} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={95} 
                            outerRadius={125} 
                            stroke="none" 
                            paddingAngle={8} 
                            dataKey="value"
                            isAnimationActive={false}
                        >
                          {data.orderStatusBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 w-full space-y-6">
                    {data.orderStatusBreakdown.map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-slate-50/30 rounded-2xl border border-slate-50 group hover:bg-white hover:shadow-2xl hover:shadow-slate-900/5 transition-none">
                        <div className="flex items-center gap-6">
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color, boxShadow: `0 0 10px ${s.color}60` }} />
                          <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{s.name.toUpperCase()}</span>
                        </div>
                        <span className="text-[11px] font-black text-slate-900 tabular-nums uppercase tracking-widest">{s.value} UNITS_SYNC</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 bg-white rounded-[40px] shadow-2xl shadow-slate-900/5 overflow-hidden transition-none">
              <CardHeader className="bg-slate-50/30 p-12 border-b border-slate-50">
                <div className="flex items-center gap-8">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                        <Zap className="h-7 w-7 text-brand-teal" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">SRH_ALLOCATION_VELOCITY</CardTitle>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mt-1">Category-level fulfillment velocity & unit cycles</p>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-16 space-y-12">
                {data.categoryBreakdown.map((c, i) => (
                  <div key={i} className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div className="space-y-2">
                        <span className="text-[12px] font-black text-slate-900 uppercase tracking-widest">{c.name.toUpperCase()}</span>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Market Cluster Node {i + 1}</p>
                      </div>
                      <span className="text-[12px] font-black text-slate-900 tabular-nums tracking-widest uppercase">{c.value} CYCLES_SYNC</span>
                    </div>
                    <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100">
                      <div className="h-full bg-slate-900 rounded-full shadow-2xl" style={{ width: `${Math.round((c.value / (data.categoryBreakdown[0]?.value || 1)) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-16 outline-none focus-visible:outline-none">
          <div className="grid gap-16 lg:grid-cols-2">
            <Card className="border border-slate-100 bg-white rounded-[40px] shadow-2xl shadow-slate-900/5 overflow-hidden transition-none">
              <CardHeader className="bg-slate-50/30 p-12 border-b border-slate-50">
                <div className="flex items-center gap-8">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                        <MapPin className="h-7 w-7 text-brand-teal" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">Geographic_Grid_Coverage</CardTitle>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mt-1">Regional order density telemetry across matrix</p>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-16">
                <div className="h-[480px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart layout="vertical" data={data.topAreas} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" fontSize={10} fontWeight={900} stroke="#e2e8f0" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1' }} />
                      <YAxis dataKey="name" type="category" fontSize={10} fontWeight={900} stroke="#e2e8f0" axisLine={false} tickLine={false} width={140} tick={{ fill: '#64748b' }} tickFormatter={v => v.toUpperCase()} />
                      <Bar dataKey="value" fill="#0f172a" radius={[0, 40, 40, 0]} barSize={24} isAnimationActive={false} />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 bg-white rounded-[40px] shadow-2xl shadow-slate-900/5 overflow-hidden transition-none">
              <CardHeader className="bg-slate-50/30 p-12 border-b border-slate-50">
                <div className="flex items-center gap-8">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                        <Clock className="h-7 w-7 text-brand-teal" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">Synchronization_Timeline_Load</CardTitle>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mt-1">Hourly operational load distribution protocol</p>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-16">
                <div className="h-[480px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReBarChart data={peakBlocks} margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="label" fontSize={10} fontWeight={900} stroke="#e2e8f0" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1' }} />
                      <YAxis fontSize={10} fontWeight={900} stroke="#e2e8f0" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1' }} />
                      <Bar dataKey="orders" fill="#0f172a" radius={[40, 40, 0, 0]} barSize={56} isAnimationActive={false} />
                    </ReBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-16 lg:grid-cols-2">
            <Card className="border border-slate-100 bg-white rounded-[40px] shadow-2xl shadow-slate-900/5 overflow-hidden transition-none">
              <CardHeader className="bg-slate-50/30 p-12 border-b border-slate-50">
                <div className="flex items-center gap-8">
                    <div className="h-14 w-14 rounded-2xl bg-brand-teal flex items-center justify-center shadow-2xl shadow-brand-teal/20">
                        <RefreshCw className="h-7 w-7 text-white" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">Cycle_Adherence_Registry</CardTitle>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mt-1">Subscription fulfillment adherence coefficient terminal</p>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-16 space-y-16">
                <div className="text-7xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">{adherenceRate}%</div>
                <div className="space-y-10">
                  {[
                    { label: "Active Nodes", value: data.refillActive, color: "bg-brand-teal" },
                    { label: "Suspended Streams", value: data.refillPaused, color: "bg-amber-400" },
                    { label: "Terminated Cycles", value: data.refillCancelled, color: "bg-rose-500" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{label.toUpperCase()}</span>
                        <span className="text-[12px] font-black text-slate-900 tabular-nums uppercase tracking-widest">{value} UNITS_SYNC</span>
                      </div>
                      <div className="h-3.5 bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100">
                        <div className={cn("h-full rounded-full shadow-2xl", color)} style={{ width: `${totalRefills > 0 ? (value / totalRefills) * 100 : 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 bg-white rounded-[40px] shadow-2xl shadow-slate-900/5 overflow-hidden transition-none">
              <CardHeader className="bg-slate-50/30 p-12 border-b border-slate-50">
                <div className="flex items-center gap-8">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                        <Users className="h-7 w-7 text-brand-teal" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">Retention_Telemetry_Matrix</CardTitle>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mt-1">Identity recurrence and lifecycle mapping telemetry</p>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-16 space-y-16">
                <div className="grid grid-cols-2 gap-10">
                  <div className="p-10 rounded-3xl bg-slate-50/30 border border-slate-50 space-y-4 shadow-sm">
                    <p className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">{data.totalUniqueCustomers.toLocaleString()}</p>
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-slate-300" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">MASTER_IDENTITY_STATION</p>
                    </div>
                  </div>
                  <div className="p-10 rounded-3xl bg-slate-50/30 border border-slate-50 space-y-4 shadow-sm">
                    <p className="text-5xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">{data.repeatCustomers.toLocaleString()}</p>
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-brand-teal" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">RECURRING_STREAMS_ACTIVE</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                    <div className="flex justify-between items-end">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">RETENTION_COEFFICIENT_TERMINAL</span>
                        <span className="text-[12px] font-black text-slate-900 tabular-nums uppercase tracking-widest">{repeatRate}%_SYNC</span>
                    </div>
                    <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100">
                        <div className="h-full bg-slate-900 rounded-full shadow-2xl" style={{ width: `${repeatRate}%` }} />
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-16 outline-none focus-visible:outline-none">
          <Card className="border border-slate-100 bg-white rounded-[40px] shadow-2xl shadow-slate-900/5 overflow-hidden transition-none">
            <CardHeader className="bg-slate-50/30 p-12 border-b border-slate-50">
                <div className="flex items-center gap-8">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                        <Network className="h-7 w-7 text-brand-teal" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">Partner_Node_Performance_Registry</CardTitle>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mt-1">Top performing network fulfillment terminals & node yield</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-16 space-y-12">
                {data.topPharmacies.map((p, i) => {
                const maxRev = data.topPharmacies[0]?.revenue || 1;
                const pct = Math.round((p.revenue / maxRev) * 100);
                return (
                    <div key={i} className="space-y-6">
                    <div className="flex items-end justify-between">
                        <div className="space-y-2">
                            <span className="text-[12px] font-black text-slate-900 uppercase tracking-widest">{p.name.toUpperCase()}</span>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Master Terminal ID: 00{i + 1}</p>
                        </div>
                        <span className="text-[12px] font-black text-slate-900 tabular-nums tracking-widest uppercase">₵{Number(p.revenue).toLocaleString()} TOTAL_YIELD</span>
                    </div>
                    <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100">
                        <div className="h-full bg-slate-900 rounded-full shadow-2xl" style={{ width: `${pct}%` }} />
                    </div>
                    </div>
                );
                })}
            </CardContent>
          </Card>

          <div className="grid gap-16 lg:grid-cols-2">
            <Card className="border border-slate-100 bg-white rounded-[40px] shadow-2xl shadow-slate-900/5 overflow-hidden transition-none">
              <CardHeader className="bg-slate-50/30 p-12 border-b border-slate-50">
                <div className="flex items-center gap-8">
                    <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                        <ShieldCheck className="h-7 w-7 text-brand-teal" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">SKU_Market_Velocity_Registry</CardTitle>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mt-1">Highest fulfillment frequency protocols across matrix</p>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-12">
                <div className="divide-y divide-slate-50">
                    {data.topProducts.map((p, i) => (
                      <div key={i} className="flex items-center justify-between py-10 px-6 hover:bg-slate-50/30 transition-none rounded-3xl group">
                        <div className="flex flex-col gap-2">
                            <span className="text-[12px] font-black text-slate-900 uppercase tracking-widest truncate max-w-[240px] leading-none">{p.name.toUpperCase()}</span>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">SKU_PROTOCOL: {1000 + i}</span>
                        </div>
                        <div className="flex items-center gap-12 shrink-0">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">QUANTITY_CYCLES</p>
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest tabular-nums">{p.quantity} UNITS_SYNC</span>
                            </div>
                            <div className="text-right min-w-[120px]">
                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1.5">MEAN_NODE_YIELD</p>
                                <span className="text-[11px] font-black text-slate-900 tracking-tight tabular-nums">₵{Number(p.revenue || 0).toLocaleString()}</span>
                            </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-100 bg-white rounded-[40px] shadow-2xl shadow-slate-900/5 overflow-hidden transition-none">
              <CardHeader className="bg-slate-50/30 p-12 border-b border-slate-50">
                <div className="flex items-center gap-8">
                    <div className="h-14 w-14 rounded-2xl bg-rose-500 flex items-center justify-center shadow-2xl shadow-rose-500/20">
                        <AlertTriangle className="h-7 w-7 text-white" />
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">Inventory_Critical_Alerts</CardTitle>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none mt-1">Protocol violations & terminal node stock depletion events</p>
                    </div>
                </div>
              </CardHeader>
              <CardContent className="p-12">
                <div className="space-y-6">
                    {data.lowStockAlerts.length > 0 ? (
                      data.lowStockAlerts.map((alert, i) => (
                        <div key={i} className="p-10 border border-slate-100 rounded-[32px] flex items-center justify-between bg-slate-50/30 group hover:bg-white hover:shadow-2xl hover:shadow-slate-900/5 transition-none">
                          <div className="space-y-2.5">
                            <p className="text-[12px] font-black text-slate-900 uppercase tracking-widest">{alert.product.toUpperCase()}</p>
                            <div className="flex items-center gap-3">
                                <MapPin className="h-4 w-4 text-slate-200" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{alert.pharmacy.toUpperCase()}</p>
                            </div>
                          </div>
                          <Badge variant="neutral" className="rounded-full px-6 py-2.5 text-[10px] font-black uppercase tracking-widest border-none bg-rose-50 text-rose-600 shadow-sm">
                            {alert.stockLevel} SKU_DEPLETED_CRITICAL
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-32 bg-slate-50/20 rounded-[40px] border border-dashed border-slate-100">
                        <div className="h-20 w-20 rounded-full bg-white border border-slate-100 flex items-center justify-center mx-auto mb-8 shadow-sm">
                            <CheckCircle className="h-10 w-10 text-emerald-100" />
                        </div>
                        <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Network_Stock_Nominal_State</p>
                        <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.3em] mt-4">All terminal nodes reporting sufficient SKUs across matrix</p>
                      </div>
                    )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hub" className="space-y-16 outline-none focus-visible:outline-none">
            <div className="bg-slate-900 p-16 rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-16 opacity-5">
                    <Shield className="h-60 w-60" />
                </div>
                <div className="relative flex items-start gap-12">
                    <div className="h-20 w-20 rounded-3xl bg-brand-teal/10 flex items-center justify-center shrink-0 shadow-2xl shadow-brand-teal/5">
                        <Terminal className="h-10 w-10 text-brand-teal" />
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-4xl font-black uppercase tracking-tight leading-none">Anonymized_Telemetry_Hub</h3>
                        <p className="text-[12px] text-slate-400 leading-relaxed font-black uppercase tracking-widest max-w-4xl">
                            Strategic stakeholder reporting terminal. All data exports are PII-stripped, 
                            end-to-end encrypted, and compliant with Ghana Data Protection Standards (Act 843).
                            Access audit trails are logged for operational transparency across the global matrix station.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid gap-16 md:grid-cols-2">
                {EXPORT_CARDS.map(({ id, stakeholder, title, description, format, badge }) => (
                    <Card key={id} className="border border-slate-100 bg-white rounded-[40px] overflow-hidden shadow-2xl shadow-slate-900/5 hover:border-slate-200 transition-none group">
                        <CardContent className="p-16 space-y-12">
                            <div className="flex items-start justify-between">
                                <div className="space-y-3">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{stakeholder.toUpperCase()}</p>
                                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">{title}</h4>
                                </div>
                                <Badge variant="neutral" className="text-[9px] font-black uppercase tracking-widest border-none bg-slate-50 text-slate-400 rounded-full px-6 py-2.5 shadow-sm">{badge}</Badge>
                            </div>
                            <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">{description.toUpperCase()}</p>
                            <Button
                                variant="default"
                                className="w-full h-20 text-[12px] font-black uppercase tracking-widest bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl shadow-slate-900/10 transition-none gap-6"
                                onClick={() => handleExport(id)}
                                disabled={exporting === id}
                            >
                                {exporting === id ? <Loader2 className="h-6 w-6 animate-spin text-brand-teal" /> : <><Download className="h-6 w-6 text-brand-teal" /> EXPORT_OPERATIONAL_{format}_PROTOCOL</>}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
