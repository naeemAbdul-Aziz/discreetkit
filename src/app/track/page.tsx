
'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getOrderAction } from '@/lib/actions';
import { type Order } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Package,
  Search,
  Truck,
  Server,
  PackageCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export const dynamic = 'force-dynamic';

const statusMap = {
  received: {
    icon: Package,
    label: 'Order Received',
    description: 'We have your order and are preparing it for processing.',
  },
  processing: {
    icon: Server,
    label: 'Processing',
    description: 'Your order is being processed at our facility.',
  },
  out_for_delivery: {
    icon: Truck,
    label: 'Out for Delivery',
    description: 'Your package is on its way to you.',
  },
  completed: {
    icon: PackageCheck,
    label: 'Completed',
    description: 'Your order has been successfully delivered.',
  },
};

const allStatuses: (keyof typeof statusMap)[] = [
  'received',
  'processing',
  'out_for_delivery',
  'completed',
];

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

  const currentStatusIndex = order
    ? allStatuses.indexOf(order.status)
    : -1;

  return (
    <div className="w-full max-w-2xl">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>Track Your Order</CardTitle>
          <CardDescription>
            Enter your unique tracking code to see the status of your delivery.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g., A9K-X3P-7Q"
              className="flex-1"
              disabled={isPending}
              aria-label="Tracking Code"
            />
            <Button type="submit" disabled={isPending || !code}>
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search />
              )}
              {isPending ? '' : 'Track'}
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
        <Card className="mt-4 rounded-2xl shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Searching for your order...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {order && (
        <div className="mt-4 space-y-4">
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-8 pl-12">
                {allStatuses.map((status, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  return (
                    <div key={status} className="relative flex items-start">
                      <div
                        className={cn(
                          'absolute -left-12 -top-1 flex h-10 w-10 items-center justify-center rounded-full',
                          isCompleted ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          React.createElement(statusMap[status].icon, { className: 'h-5 w-5' })
                        )}
                      </div>
                      {index < allStatuses.length - 1 && (
                        <div
                          className={cn(
                            'absolute -left-[5px] top-10 h-full w-0.5',
                            index < currentStatusIndex ? 'bg-success' : 'bg-border'
                          )}
                        />
                      )}
                      <div>
                        <p className={cn('font-semibold', isCurrent ? 'text-primary' : 'text-foreground')}>
                          {statusMap[status].label}
                        </p>
                        <p className="text-sm text-muted-foreground">{statusMap[status].description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>
                    Details of your confidential order.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                  {order.items.map(item => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                       <p className="font-medium">
                          GHS {(order.isStudent && item.studentPriceGHS ? item.studentPriceGHS : item.priceGHS).toFixed(2)}
                       </p>
                    </div>
                  ))}
                  <Separator />
                   <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <p className="text-muted-foreground">Subtotal</p>
                            <p className="font-medium text-foreground">GHS {order.subtotal.toFixed(2)}</p>
                        </div>
                    {order.studentDiscount > 0 && (
                        <div className="flex justify-between text-success">
                            <p>Student Discount</p>
                            <p className="font-medium">- GHS {order.studentDiscount.toFixed(2)}</p>
                        </div>
                        )}
                        <div className="flex justify-between">
                            <p className="text-muted-foreground">Delivery Fee</p>
                            <p className="font-medium text-foreground">GHS {order.deliveryFee.toFixed(2)}</p>
                        </div>
                    </div>
                  <Separator />
                   <div className="flex items-baseline justify-between font-bold text-base">
                        <p>Total</p>
                        <p>GHS {order.totalPrice.toFixed(2)}</p>
                    </div>
                </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                    <CardTitle>Delivery Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm">
                        <p className="font-semibold text-foreground">{order.deliveryArea}</p>
                        {order.deliveryAddressNote && (
                            <p className="text-muted-foreground italic">Note: "{order.deliveryAddressNote}"</p>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                    <CardTitle>Event History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {order.events.map((event, index) => (
                        <div key={index} className="relative text-sm">
                            <p className="font-semibold">{event.status}</p>
                            <p className="text-muted-foreground">{event.note}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                            {new Date(event.date).toLocaleString()}
                            </p>
                        </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function TrackPageLoading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

export default function TrackPage() {
  return (
    <div className="bg-muted">
      <div className="container mx-auto flex min-h-[calc(100dvh-10rem)] justify-center px-4 py-12 md:px-6 md:py-24">
        <Suspense fallback={<TrackPageLoading />}>
          <Tracker />
        </Suspense>
      </div>
    </div>
  );
}
