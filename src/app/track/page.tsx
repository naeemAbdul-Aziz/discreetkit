
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getOrderAction } from '@/lib/actions';
import { type Order } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader2, Package, Truck } from 'lucide-react';

const statusIcons = {
  received: <Package className="h-6 w-6" />,
  processing: <Loader2 className="h-6 w-6 animate-spin" />,
  out_for_delivery: <Truck className="h-6 w-6" />,
  pickup_ready: <Package className="h-6 w-6" />,
  completed: <CheckCircle className="h-6 w-6" />,
};

function Tracker() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!code) return;
    setError(null);
    setOrder(null);
    startTransition(async () => {
      const result = await getOrderAction(code.trim());
      if (result) {
        setOrder(result);
      } else {
        setError('Invalid tracking code. Please check and try again.');
      }
    });
  };

  useEffect(() => {
    if (searchParams.get('code')) {
      handleSearch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Track Your Order</CardTitle>
          <CardDescription>Enter your unique tracking code to see the status of your delivery.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g., A9K-X3P-7Q"
              className="flex-1"
              disabled={isPending}
            />
            <Button type="submit" disabled={isPending || !code}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Track
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isPending && !order && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Searching for your order...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {order && (
        <Card className="mt-4">
          <CardHeader>
            <div className="flex items-center gap-4">
                <div className="text-green-600">{statusIcons[order.status]}</div>
                <div>
                    <CardTitle>Order Status: <span className="capitalize">{order.status.replace(/_/g, ' ')}</span></CardTitle>
                    <CardDescription>Product: {order.productName}</CardDescription>
                </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative pl-6">
                <div className="absolute left-0 top-0 h-full w-0.5 bg-border -translate-x-1/2" aria-hidden="true" />
                {order.events.slice().reverse().map((event, index) => (
                    <div key={index} className="relative mb-8">
                        <div className="absolute -left-6 top-1.5 h-3 w-3 rounded-full bg-green-500 -translate-x-1/2" />
                        <p className="font-semibold">{event.status}</p>
                        <p className="text-sm text-muted-foreground">{event.note}</p>
                        <p className="text-xs text-muted-foreground mt-1">{new Date(event.date).toLocaleString()}</p>
                    </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


export default function TrackPage() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-20 flex justify-center md:px-6">
            <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
                <Tracker />
            </Suspense>
        </div>
    )
}
