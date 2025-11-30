/**
 * @file src/app/(dashboard)/admin/dashboard/page.tsx
 * @description The main dashboard page for administrators, showing full-access
 *              metrics and data.
 */
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, CreditCard, Activity, Users, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { useEffect, useMemo, useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerClose } from '@/components/ui/drawer';
import { useSSE } from '@/hooks/use-sse';
import { useRouter } from 'next/navigation';

type RecentOrder = { id: number; code: string; status: string; total_price: number; created_at: string };
type DashboardData = {
  metrics: { totalRevenue: number; totalSales: number; avgOrderValue: number; newCustomers: number };
  recentOrders: RecentOrder[];
  revenueSeries: { date: string; amount: number }[];
  statusBreakdown?: { status: string; count: number }[];
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangePreset, setRangePreset] = useState<'7d'|'30d'|'90d'>('30d');
  const [from, to] = useMemo(() => {
    const now = new Date();
    const days = rangePreset === '7d' ? 7 : rangePreset === '90d' ? 90 : 30;
    const start = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    return [start, now];
  }, [rangePreset]);

  useEffect(() => {
    let timer: any;
    const load = async () => {
      try {
        setError(null);
        const params = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
        const res = await fetch(`/api/admin/dashboard?${params.toString()}`, { cache: 'no-store' });
        
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        
        if (res.status === 403) {
          router.push('/unauthorized');
          return;
        }
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
          throw new Error(errorData.error || 'Failed to load dashboard');
        }
        
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        console.error('[AdminDashboard] Error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
    // Fallback polling if SSE disconnects
    timer = setInterval(load, 60000);
    return () => { clearInterval(timer) };
  }, [from, to]);

  // Realtime: refresh metrics on order changes
  useSSE('/api/admin/realtime/orders', { onMessage: () => {
    const params = new URLSearchParams({ from: from.toISOString(), to: to.toISOString() });
    fetch(`/api/admin/dashboard?${params.toString()}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : null)
      .then(json => json && setData(json))
      .catch(() => {});
  }});

  const series = useMemo(() => data?.revenueSeries ?? [], [data]);
  const breakdown = useMemo(() => data?.statusBreakdown ?? [], [data]);
  const [activeStatuses, setActiveStatuses] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<RecentOrder | null>(null);
  useEffect(() => { setActiveStatuses(breakdown.map(b => b.status)); }, [breakdown]);
  const filteredBreakdown = breakdown.filter(b => activeStatuses.includes(b.status));
  const colors = ['#16a34a','#2563eb','#7c3aed','#f59e0b','#ef4444','#0ea5e9','#84cc16'];
  const colorClasses = ['bg-green-600','bg-blue-600','bg-purple-600','bg-amber-500','bg-red-500','bg-sky-500','bg-lime-500'];

  return (
    <>
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Showing data from {from.toLocaleDateString()} to {to.toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-3 bg-card p-1 rounded-lg border shadow-sm">
            <label htmlFor="range" className="text-sm font-medium px-2">Range</label>
            <select 
                id="range" 
                className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer" 
                value={rangePreset} 
                onChange={e => setRangePreset(e.target.value as any)} 
                title="Select date range"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-3xl font-bold tracking-tight">GHS {data?.metrics.totalRevenue.toFixed(2)}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Updated live</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-3xl font-bold tracking-tight">{data?.metrics.totalSales}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Orders in selected range</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Order Value</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                <div className="text-3xl font-bold tracking-tight">GHS {data?.metrics.avgOrderValue.toFixed(2)}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Computed from selected range</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-all duration-200 border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New Customers</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-3xl font-bold tracking-tight">+{data?.metrics.newCustomers}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Selected range</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2 shadow-sm border-border/60">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>A list of the most recent orders.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Code</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Total (GHS)</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.recentOrders.map((o) => (
                        <TableRow
                          key={o.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => { setSelectedOrder(o); setDrawerOpen(true); }}
                          tabIndex={0}
                          aria-label={`View order ${o.code}`}
                        >
                          <TableCell className="font-medium">{o.code}</TableCell>
                          <TableCell className="capitalize">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground`}>
                                {String(o.status).replace('_',' ')}
                            </span>
                          </TableCell>
                          <TableCell>{o.total_price.toFixed(2)}</TableCell>
                          <TableCell className="text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="space-y-8">
            <Card className="shadow-sm border-border/60">
                <CardHeader>
                <CardTitle>Revenue Chart</CardTitle>
                <CardDescription>Revenue trend over time.</CardDescription>
                </CardHeader>
                <CardContent>
                {loading ? (
                    <Skeleton className="h-[250px] w-full" />
                ) : (
                    <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={series}>
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis 
                            dataKey="date" 
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                            tickLine={false}
                            axisLine={false}
                            minTickGap={20} 
                        />
                        <YAxis 
                            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
                            tickLine={false}
                            axisLine={false}
                            width={40}
                            tickFormatter={(value) => `${value/1000}k`}
                        />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            formatter={(v) => [`GHS ${(Number(v)||0).toFixed(2)}`, 'Revenue']} 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="amount" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#revenueGradient)" 
                        />
                        </AreaChart>
                    </ResponsiveContainer>
                    </div>
                )}
                </CardContent>
            </Card>

            <Card className="shadow-sm border-border/60">
                <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
                <CardDescription>Current distribution.</CardDescription>
                </CardHeader>
                <CardContent>
                {loading ? (
                    <Skeleton className="h-[250px] w-full" />
                ) : (
                    <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {breakdown.map((b, idx) => (
                        <button
                            key={b.status}
                            onClick={() => setActiveStatuses(s => s.includes(b.status) ? s.filter(x=>x!==b.status) : [...s, b.status])}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${activeStatuses.includes(b.status) ? 'bg-primary/10 border-primary/20 text-primary font-medium' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-muted'}`}
                        >
                            <span className={`inline-block w-1.5 h-1.5 mr-1.5 rounded-full ${colorClasses[idx % colorClasses.length]}`} aria-hidden />
                            {b.status.replace(/_/g,' ')} <span className="opacity-70 ml-0.5">({b.count})</span>
                        </button>
                        ))}
                    </div>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(v, n) => [String(v), 'Orders']} 
                            />
                            <Pie 
                                data={filteredBreakdown} 
                                dataKey="count" 
                                nameKey="status" 
                                innerRadius={60} 
                                outerRadius={80} 
                                paddingAngle={4}
                                stroke="none"
                            >
                            {filteredBreakdown.map((entry, idx) => (
                                <Cell key={`cell-${entry.status}`} fill={colors[idx % colors.length]} />
                            ))}
                            </Pie>
                        </PieChart>
                        </ResponsiveContainer>
                    </div>
                    </div>
                )}
                </CardContent>
            </Card>
          </div>
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
