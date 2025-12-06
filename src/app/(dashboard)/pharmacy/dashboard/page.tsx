'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Truck, CheckCircle, Clock, AlertCircle, Info } from 'lucide-react'
import { OrdersList } from './orders-list'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'

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
      setLoading(true);
      setError(null);

      // Increased timeout to 30 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 30000)
      );

      const fetchPromise = fetch('/api/pharmacy/dashboard', { cache: 'no-store' });
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

      if (response.status === 401 || response.status === 403) {
        router.push('/login');
        return;
      }

      if (response.status === 404) {
        // Pharmacy not linked - show helpful message
        setError('not_linked');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      setData(json);
      setDataLoaded(true);
    } catch (err: any) {
      console.error('[PharmacyDashboard] Error:', err);

      if (err.message === 'timeout') {
        setError('timeout');
      } else if (err.message?.includes('401') || err.message?.includes('403')) {
        router.push('/login');
        return;
      } else {
        setError('fetch_failed');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Real-time updates via SSE - only connect if initial load succeeded
  useSSE(dataLoaded ? '/api/pharmacy/realtime' : '', {
    onMessage: (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'orders') {
          loadData();
        }
      } catch (e) {
        console.error('SSE parse error', e);
      }
    }
  });

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Handle different error states with helpful messages
  if (error === 'not_linked') {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-900 dark:text-blue-100">Pharmacy Account Not Linked</AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200 mt-2">
            <p className="mb-3">Your account hasn't been linked to a pharmacy yet. This is normal for new accounts.</p>
            <p className="mb-3"><strong>Next steps:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Contact your administrator to link your account to a pharmacy</li>
              <li>Or, if you're an admin, go to the Partners page to create and link a pharmacy</li>
            </ol>
            <Button 
              onClick={() => router.push('/admin/partners')} 
              className="mt-4"
              variant="outline"
            >
              Go to Partners Management
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error === 'timeout') {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Timeout</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">The request took too long to complete. This might be due to:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
              <li>Slow internet connection</li>
              <li>Server is busy</li>
              <li>Network issues</li>
            </ul>
            <Button onClick={() => loadData()} variant="outline" size="sm">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error Loading Dashboard</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">We couldn't load your pharmacy dashboard. Please try again.</p>
            <Button onClick={() => loadData()} variant="outline" size="sm">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  // Empty state - pharmacy exists but no orders yet
  const hasNoOrders = data.stats.pending === 0 && data.stats.accepted === 0 && 
                      data.stats.processing === 0 && data.stats.outForDelivery === 0;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{data.pharmacy.name}</h2>
        <p className="text-muted-foreground mt-1">{data.pharmacy.location}</p>
      </div>

      {hasNoOrders && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 mb-6">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-900 dark:text-blue-100">Welcome to Your Dashboard!</AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            You don't have any orders yet. Orders will appear here once customers place orders and they're assigned to your pharmacy.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:gap-6 grid-cols-2 md:grid-cols-4">
        <Card className="shadow-none border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">New Orders</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{data.stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting processing</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-none border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{data.stats.processing}</div>
            <p className="text-xs text-muted-foreground mt-1">Being prepared</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-none border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Out for Delivery</CardTitle>
            <Truck className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{data.stats.outForDelivery}</div>
            <p className="text-xs text-muted-foreground mt-1">Being delivered</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-none border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{data.stats.accepted}</div>
            <p className="text-xs text-muted-foreground mt-1">Total completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <OrdersList orders={data.recentOrders} onOrderUpdate={() => loadData()} />
      </div>
    </div>
  );
}
