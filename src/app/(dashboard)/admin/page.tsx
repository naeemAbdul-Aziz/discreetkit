/**
 * @file src/app/(dashboard)/admin/page.tsx
 * @description The main dashboard page for administrators, showing full-access
 *              metrics and data.
 */
'use client';

import { StatCard } from '@/components/dashboard/stat-card';
import { RankingList } from '@/components/dashboard/ranking-list';
import { DollarSign, ShoppingCart, Activity, Users, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip as RechartsTooltip, ResponsiveContainer, XAxis, YAxis, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from '@/components/ui/drawer';
import { useSSE } from '@/hooks/use-sse';
import { useRouter } from 'next/navigation';

type RecentOrder = { id: number; code: string; status: string; total_price: number; created_at: string };
type DashboardData = {
  metrics: { totalRevenue: number; totalSales: number; avgOrderValue: number; newCustomers: number; activeOrders: number };
  recentOrders: RecentOrder[];
  revenueSeries: { date: string; amount: number }[];
  statusBreakdown?: { status: string; count: number }[];
  topPharmacies?: { name: string; revenue: number }[];
  topProducts?: { name: string; quantity: number; revenue: number }[];
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangePreset, setRangePreset] = useState<'7d'|'30d'|'90d'>('30d');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [from, to] = useMemo(() => {
    const now = new Date();
    const days = rangePreset === '7d' ? 7 : rangePreset === '90d' ? 90 : 30;
    const start = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    return [start, now];
  }, [rangePreset]);

  useEffect(() => {
    async function loadData() {
      try {
        // Set loading only on first load or manual range change, not background refresh
        if (refreshTrigger === 0) setLoading(true);
        const { getOrders, getDashboardStats } = await import('@/lib/admin-actions');
        const orders = await getOrders();
        const stats = await getDashboardStats();

        // Calculate metrics
        const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.total_price || 0), 0);
        const totalSales = orders.length;
        const avgOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;
        
        // Active orders (processing or out_for_delivery)
        const activeOrders = orders.filter((o: any) => ['processing', 'out_for_delivery'].includes(o.status)).length;
        
        // New customers (unique emails in period) - simplified for now
        const uniqueCustomers = new Set(orders.map((o: any) => o.email)).size;

        // Recent orders
        const recentOrders = orders.slice(0, 5).map((o: any) => ({
            id: o.id,
            code: o.code,
            status: o.status,
            total_price: o.total_price,
            created_at: o.created_at
        }));

        // Revenue series (last 30 days)
        const seriesMap = new Map<string, number>();
        const now = new Date();
        for(let i=29; i>=0; i--) {
            const d = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
            seriesMap.set(d.toISOString().slice(0,10), 0);
        }
        
        orders.forEach((o: any) => {
            const date = new Date(o.created_at).toISOString().slice(0,10);
            if (seriesMap.has(date)) {
                seriesMap.set(date, (seriesMap.get(date) || 0) + (o.total_price || 0));
            }
        });

        const revenueSeries = Array.from(seriesMap.entries()).map(([date, amount]) => ({ date, amount }));

        // Status breakdown
        const statusCounts: Record<string, number> = {};
        orders.forEach((o: any) => {
            statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
        });
        const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

        setData({
            metrics: { totalRevenue, totalSales, avgOrderValue, newCustomers: uniqueCustomers, activeOrders },
            recentOrders,
            revenueSeries,
            statusBreakdown,
            topPharmacies: stats.topPharmacies,
            topProducts: stats.topProducts
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [rangePreset, refreshTrigger]);

  // SSE for real-time updates
  useSSE('/api/admin/realtime/orders', {
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'orders') {
          router.refresh();
          // Also re-fetch client-side stats
          // We need to define loadData outside useEffect or trigger it via a state change
          // Simplest hack: toggle a dummy state or move loadData out.
          // Let's increment a refresh counter.
          setRefreshTrigger(prev => prev + 1);
        }
      } catch (e) {
        console.error('SSE parse error', e);
      }
    }
  });

  const [activeStatuses, setActiveStatuses] = useState<string[]>(['pending_payment', 'received', 'processing', 'out_for_delivery']);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RecentOrder | null>(null);

  const filteredBreakdown = useMemo(() => {
      if (!data?.statusBreakdown) return [];
      return data.statusBreakdown.filter(s => activeStatuses.includes(s.status));
  }, [data, activeStatuses]);

  const colors = ['#f97316', '#3b82f6', '#a855f7', '#f59e0b', '#10b981'];
  const colorClasses = ['bg-orange-500', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-emerald-500'];

  if (loading) {
      return (
          <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
              </div>
              <Skeleton className="h-[400px] rounded-xl" />
          </div>
      )
  }

  if (error || !data) {
      return <Alert variant="destructive"><AlertCircle className="h-4 w-4"/><AlertDescription>{error || 'No data'}</AlertDescription></Alert>
  }

  return (
    <>
      <div className="space-y-8">
        {/* Metrics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={`GHS ${data.metrics.totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2})}`}
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
            title="Active Now"
            value={data.metrics.activeOrders}
            icon={Activity}
            description="Processing orders"
          />
           <StatCard
            title="Avg. Order Value"
            value={`GHS ${data.metrics.avgOrderValue.toFixed(2)}`}
            icon={Users}
            trend={{ value: 19, label: "from last month", positive: true }}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 border-none shadow-sm bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground"/> 
                Revenue Overview
              </CardTitle>
              <CardDescription>Daily revenue over the last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenueSeries}>
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => new Date(val).getDate().toString()} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `GHS${value}`} />
                    <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        formatter={(val: number) => [`GHS ${val.toLocaleString()}`, 'Revenue']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#8884d8" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="col-span-3 space-y-4">
            <Card className="h-full border-none shadow-sm">
                <CardHeader>
                <CardTitle>Order Status</CardTitle>
                <CardDescription>Real-time order distribution</CardDescription>
                </CardHeader>
                <CardContent>
                {data.statusBreakdown && (
                    <div className="flex flex-col items-center justify-center h-full">
                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <RechartsTooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(v, n) => [String(v), 'Orders']} 
                            />
                            <Pie 
                                data={filteredBreakdown} 
                                dataKey="count" 
                                nameKey="status" 
                                innerRadius={80} 
                                outerRadius={100} 
                                paddingAngle={4}
                                stroke="none"
                            >
                            {filteredBreakdown.map((entry, idx) => (
                                <Cell key={`cell-${entry.status}`} fill={colors[idx % colors.length]} className="stroke-background hover:opacity-80 transition-opacity" strokeWidth={2} />
                            ))}
                            </Pie>
                        </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-foreground">{filteredBreakdown.reduce((acc, curr) => acc + curr.count, 0)}</span>
                            <span className="text-sm text-muted-foreground uppercase tracking-wider">Orders</span>
                        </div>
                    </div>
                     <div className="flex flex-wrap gap-2 justify-center mt-6">
                        {data.statusBreakdown.map((b, idx) => (
                        <button
                            key={b.status}
                            onClick={() => setActiveStatuses(s => s.includes(b.status) ? s.filter(x=>x!==b.status) : [...s, b.status])}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${activeStatuses.includes(b.status) ? 'bg-primary/5 border-primary/20 text-foreground font-medium shadow-sm' : 'bg-transparent border-transparent text-muted-foreground hover:bg-muted'}`}
                        >
                            <span className={`inline-block w-2 h-2 mr-2 rounded-full ${colorClasses[idx % colorClasses.length]}`} aria-hidden />
                            {b.status.replace(/_/g,' ')}
                        </button>
                        ))}
                    </div>
                    </div>
                )}
                </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <RankingList 
                title="Top Performing Pharmacies" 
                description="By total revenue generated"
                type="pharmacy"
                items={(data.topPharmacies || []).map(p => ({
                    name: p.name,
                    value: `GHS ${p.revenue.toLocaleString()}`,
                }))}
            />
             <RankingList 
                title="Top Selling Products" 
                description="By quantity sold"
                type="product"
                items={(data.topProducts || []).map(p => ({
                    name: p.name,
                    value: `${p.quantity} sold`,
                    meta: `GHS ${p.revenue.toLocaleString()}`
                }))}
            />
        </div>
      </div>
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Order Details</DrawerTitle>
            <DrawerDescription>
              {selectedOrder ? (
                <div className="space-y-2">
                  <div><span className="font-semibold">Order Code:</span> {selectedOrder.code}</div>
                  <div><span className="font-semibold">Status:</span> <span className="capitalize">{String(selectedOrder.status).replace('_',' ')}</span></div>
                  <div><span className="font-semibold">Total:</span> GHS {selectedOrder.total_price.toFixed(2)}</div>
                  <div><span className="font-semibold">Created:</span> {new Date(selectedOrder.created_at).toLocaleString()}</div>
                </div>
              ) : (
                <span>No order selected.</span>
              )}
            </DrawerDescription>
            <DrawerClose asChild>
              <button className="mt-4 px-4 py-2 rounded bg-primary text-white">Close</button>
            </DrawerClose>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    </>
  );
}
