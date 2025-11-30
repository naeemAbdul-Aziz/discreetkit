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
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">Showing data from {from.toLocaleDateString()} to {to.toLocaleDateString()}</div>
        <div className="flex items-center gap-2">
          <label htmlFor="range" className="text-sm">Range</label>
          <select id="range" className="border rounded px-2 py-1 text-sm" value={rangePreset} onChange={e => setRangePreset(e.target.value as any)} title="Select date range">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-40" />
            ) : (
              <div className="text-2xl font-bold">GHS {data?.metrics.totalRevenue.toFixed(2)}</div>
            )}
            <p className="text-xs text-muted-foreground">Updated live</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <div className="text-2xl font-bold">{data?.metrics.totalSales}</div>
            )}
            <p className="text-xs text-muted-foreground">Orders in selected range</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <div className="text-2xl font-bold">GHS {data?.metrics.avgOrderValue.toFixed(2)}</div>
            )}
            <p className="text-xs text-muted-foreground">Computed from selected range</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">+{data?.metrics.newCustomers}</div>
            )}
            <p className="text-xs text-muted-foreground">Selected range</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>A list of the most recent orders.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
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
                        className="cursor-pointer hover:bg-muted/40 transition"
                        onClick={() => { setSelectedOrder(o); setDrawerOpen(true); }}
                        tabIndex={0}
                        aria-label={`View order ${o.code}`}
                      >
                        <TableCell>{o.code}</TableCell>
                        <TableCell className="capitalize">{String(o.status).replace('_',' ')}</TableCell>
                        <TableCell>{o.total_price.toFixed(2)}</TableCell>
                        <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Chart</CardTitle>
             <CardDescription>Revenue in selected range.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : (
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series}>
                    <defs>
                      <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} minTickGap={16} />
                    <YAxis tick={{ fontSize: 12 }} width={60} />
                    <Tooltip formatter={(v) => [`GHS ${(Number(v)||0).toFixed(2)}`, 'Revenue']} />
                    <Area type="monotone" dataKey="amount" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#revenueGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>Distribution in selected range.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[220px] w-full" />
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {breakdown.map((b, idx) => (
                    <button
                      key={b.status}
                      onClick={() => setActiveStatuses(s => s.includes(b.status) ? s.filter(x=>x!==b.status) : [...s, b.status])}
                      className={`text-xs px-2 py-1 rounded border transition ${activeStatuses.includes(b.status) ? 'bg-primary/10 border-primary text-primary' : 'bg-muted border-muted-foreground/20 text-muted-foreground'}`}
                      title={`Toggle ${b.status}`}
                    >
                      <span className={`inline-block w-2 h-2 mr-2 rounded-full ${colorClasses[idx % colorClasses.length]}`} aria-hidden />
                      {b.status.replace(/_/g,' ')} ({b.count})
                    </button>
                  ))}
                </div>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip formatter={(v, n) => [String(v), 'Orders']} />
                      <Pie data={filteredBreakdown} dataKey="count" nameKey="status" innerRadius={40} outerRadius={80} paddingAngle={2}>
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
