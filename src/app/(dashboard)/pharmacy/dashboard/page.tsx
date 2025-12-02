'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { OrdersList } from './orders-list'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

type PharmacyData = {
  pharmacy: { id: number; name: string; location: string };
  stats: { pending: number; accepted: number; processing: number; outForDelivery: number };
  recentOrders: any[];
  statusBreakdown: { status: string; count: number }[];
};

import { useSSE } from '@/hooks/use-sse'

export default function PharmacyDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<PharmacyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const loadData = async () => {
    try {
      setError(null);
      const res = await fetch('/api/pharmacy/dashboard', { cache: 'no-store' });
      
      if (res.status === 401) {
        setLoading(false);
        router.push('/login');
        return;
      }
      
      if (res.status === 403) {
        setLoading(false);
        router.push('/unauthorized');
        return;
      }
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to load dashboard');
      }
      
      const json = await res.json();
      setData(json);
      setDataLoaded(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      console.error('[PharmacyDashboard] Error:', err);
      setDataLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [router]);

  // Real-time updates via SSE - only connect if initial load succeeded
  // This prevents infinite connection loops if auth/network is broken
  useSSE(dataLoaded ? '/api/pharmacy/realtime' : '', {
    onMessage: (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'orders') {
          // Refresh data on order updates
          loadData();
        }
      } catch (e) {
        console.error('SSE parse error', e);
      }
    }
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-6 px-2 md:px-0">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-8 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold tracking-tight break-words">{data.pharmacy.name}</h2>
        <p className="text-muted-foreground text-base break-words mt-1">{data.pharmacy.location}</p>
      </div>

      <div className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-4">
        <Card className="min-w-0 shadow-sm hover:shadow-md transition-all duration-200 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Assigned Orders</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{data.stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 shadow-sm hover:shadow-md transition-all duration-200 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{data.stats.processing}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently being prepared</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 shadow-sm hover:shadow-md transition-all duration-200 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Out for Delivery</CardTitle>
            <Truck className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{data.stats.outForDelivery}</div>
            <p className="text-xs text-muted-foreground mt-1">Being delivered</p>
          </CardContent>
        </Card>
        <Card className="min-w-0 shadow-sm hover:shadow-md transition-all duration-200 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accepted Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{data.stats.accepted}</div>
            <p className="text-xs text-muted-foreground mt-1">Total accepted</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <OrdersList orders={data.recentOrders} onOrderUpdate={() => window.location.reload()} />
      </div>
    </div>
  );
}
