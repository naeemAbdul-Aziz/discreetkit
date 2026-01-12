
'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getOrderAction } from '@/lib/actions';
import { type Order } from '@/lib/data';
import type { OrderStatus } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertCircle,
  Package,
  Search,
  Truck,
  Server,
  PackageCheck,
  CreditCard,
  MapPin,
  ClipboardList,
} from 'lucide-react';
import { BrandSpinner } from '@/components/brand-spinner';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { getSupabaseClient } from '@/lib/supabase';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

const statusMap: Record<OrderStatus, { icon: React.ElementType; label: string; description: string }> = {
  pending_payment: {
    icon: CreditCard,
    label: 'Pending Payment',
    description: 'Awaiting payment confirmation.',
  },
  received: {
    icon: Package,
    label: 'Order Received',
    description: 'We have your order and are preparing it.',
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
    label: 'Delivered',
    description: 'Your order has been successfully delivered.',
  },
};

const getFriendlyEventTitle = (raw: string) => {
  const map: Record<string, string> = {
    'order_created': 'Order Placed',
    'payment_pending': 'Payment Pending',
    'payment_confirmed': 'Payment Confirmed',
    'processing': 'Processing Started',
    'packed': 'Order Packed',
    'dispatch_assigned': 'Rider Assigned',
    'out_for_delivery': 'Out for Delivery',
    'completed': 'Package Delivered',
    'cancelled': 'Order Cancelled'
  };
  return map[raw] || raw.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const allStatuses: OrderStatus[] = [
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
      const result = await getOrderAction(code.trim().toUpperCase());
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

  // Set up Supabase real-time subscription
  useEffect(() => {
    if (!order) return;

    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`orders:id=eq.${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload: any) => {
          // When an update is received, re-fetch the order data to get events
          startTransition(async () => {
              const result = await getOrderAction(order.code);
              if (result) {
                  setOrder(result);
              }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order]);


  const currentStatusIndex = order
    ? allStatuses.indexOf(order.status)
    : -1;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Search Card */}
      <Card className="rounded-3xl border-muted shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/40 pb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
                <CardTitle className="text-2xl font-bold">Track Your Order</CardTitle>
                <CardDescription className="mt-1">
                    Real-time updates on your DiscreetKit delivery.
                </CardDescription>
             </div>
             <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center gap-2">
                <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter Tracking Code (e.g., A9K...)"
                className="bg-background shadow-sm"
                disabled={isPending}
                aria-label="Tracking Code"
                />
                <Button type="submit" disabled={isPending || !code}>
                {isPending ? (
                    <BrandSpinner size="sm" />
                ) : (
                    <>Track</>
                )}
                </Button>
            </form>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive" className="rounded-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isPending && !order && (
         <div className="py-12 flex flex-col items-center justify-center text-muted-foreground animate-pulse">
            <BrandSpinner size="lg" />
            <p className="mt-4 text-sm font-medium">Searching our records...</p>
         </div>
      )}

      {order && (
        <div className="grid gap-6 md:grid-cols-3">
            {/* LEFT COLUMN: Status & Items (Span 2) */}
            <div className="md:col-span-2 space-y-6">
                

                
                {/* 2. Vertical Timeline (The Hero) */}
                 <Card className="rounded-3xl border-muted shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30 pb-6">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <ClipboardList className="h-5 w-5 text-primary" /> Tracking History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8 pl-6">
                        <div className="relative border-l-2 border-primary/20 ml-3 space-y-10 pb-2">
                             {[...order.events]
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Newest first for vertical timeline
                                .map((event, index) => {
                                 const isLatest = index === 0;
                                 return (
                                    <div key={index} className="relative pl-8">
                                        {/* Dot */}
                                        <div className={cn(
                                            "absolute -left-[9px] top-1 h-4 w-4 rounded-full border-4 border-background transition-all duration-300",
                                            isLatest ? "bg-primary ring-4 ring-primary/10 shadow-lg scale-110" : "bg-muted-foreground/40"
                                        )} />
                                        
                                        <div className={cn("flex flex-col gap-1 transition-opacity duration-500", !isLatest && "opacity-80")}>
                                            <h4 className={cn("font-bold text-lg", isLatest ? "text-primary" : "text-foreground")}>
                                                {getFriendlyEventTitle(event.status)}
                                            </h4>
                                            
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                                                {new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(event.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>

                                            {event.note && (
                                                 <div className="mt-2 text-sm text-foreground/80 bg-muted/30 p-3 rounded-r-xl rounded-bl-xl border border-muted/50 max-w-md">
                                                    {event.note}
                                                 </div>
                                            )}
                                        </div>
                                    </div>
                                 )
                             })}
                        </div>
                    </CardContent>
                </Card>

                 {/* 2. Order Items */}
                 <Card className="rounded-3xl border-muted shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Items Ordered</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {order.items.map((item, i) => (
                             <div key={item.id + i} className="flex gap-3 items-start">
                                {/* Image */}
                                <div className="relative h-12 w-12 flex-shrink-0 rounded-lg bg-muted border overflow-hidden">
                                    {item.image_url ? (
                                            <Image src={item.image_url} alt={item.name} fill className="object-contain p-1" />
                                    ) : (
                                        <Package className="h-full w-full p-3 text-muted-foreground/30" />
                                    )}
                                </div>
                                
                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-foreground leading-snug line-clamp-2">
                                        {item.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                                </div>

                                {/* Price */}
                                <div className="text-right">
                                    <p className="font-semibold text-sm whitespace-nowrap">
                                        <span className="text-[10px] text-muted-foreground font-normal mr-1">GHS</span>
                                        {item.price_ghs.toFixed(2)}
                                    </p>
                                </div>
                             </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* RIGHT COLUMN: Summary & History (Span 1) */}
            <div className="space-y-6">

                 {/* 3. Summary & Payment */}
                 <Card className="rounded-3xl border-muted shadow-sm bg-muted/20">
                    <CardHeader>
                        <CardTitle className="text-lg">Payment Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal</span>
                            <span>GHS {order.subtotal.toFixed(2)}</span>
                        </div>
                        {order.studentDiscount > 0 && (
                             <div className="flex justify-between text-success font-medium">
                                <span>Student Discount</span>
                                <span>- GHS {order.studentDiscount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-muted-foreground">
                            <span>Delivery Fee</span>
                            <span>{order.deliveryFee === 0 ? 'Free' : `GHS ${order.deliveryFee.toFixed(2)}`}</span>
                        </div>
                        <Separator className="my-2" />
                         <div className="flex justify-between items-baseline">
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-bold text-lg">GHS {order.totalPrice.toFixed(2)}</span>
                        </div>
                    </CardContent>
                 </Card>

                {/* 4. Delivery Details */}
                <Card className="rounded-3xl border-muted shadow-sm">
                    <CardHeader className="pb-3">
                         <CardTitle className="text-base flex items-center gap-2">
                             <MapPin className="h-4 w-4 text-primary" /> Delivery Details
                         </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm space-y-3">
                         <div>
                             <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Location</p>
                             <p className="font-medium">{order.deliveryArea}</p>
                         </div>
                         {order.deliveryAddressNote && (
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Note</p>
                                <p className="italic text-muted-foreground">"{order.deliveryAddressNote}"</p>
                            </div>
                         )}
                    </CardContent>
                </Card>

                {/* 5. Helpful Links (Replaced old timeline) */}
                <Card className="rounded-3xl border-muted shadow-sm overflow-hidden bg-primary text-primary-foreground">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg">Need Help?</h4>
                                <p className="text-sm text-white/80">Support is available 24/7 on WhatsApp.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 6. Dispatch Info (New) */}
                {order.courierName && (
                   <Card className="rounded-3xl border-primary/20 shadow-sm bg-primary/5">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2 text-primary">
                                <Truck className="h-4 w-4" /> Dispatch Rider
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Rider Name</p>
                                <p className="font-medium text-lg">{order.courierName}</p>
                            </div>
                            {order.courierPhone && (
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Contact</p>
                                    <p className="font-medium font-mono">{order.courierPhone}</p>
                                </div>
                            )}
                            {order.courierTrackingUrl && (
                                <div className="pt-2">
                                     <a href={order.courierTrackingUrl} target="_blank" rel="noopener noreferrer">
                                         <Button variant="outline" size="sm" className="w-full gap-2">
                                             <MapPin className="h-3 w-3" /> Track Live Location
                                         </Button>
                                     </a>
                                </div>
                            )}
                        </CardContent>
                   </Card>
                )}

            </div>
        </div>
      )}
    </div>
  );
}


function TrackPageLoading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <BrandSpinner size="lg" />
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
