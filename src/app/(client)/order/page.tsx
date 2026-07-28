
'use client';

import { Suspense } from 'react';
import { CheckCircle } from 'lucide-react';
import { OrderForm } from '@/app/order/(components)/order-form';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const steps = [
  { name: 'Your Cart', status: 'complete' },
  { name: 'Delivery & Payment', status: 'current' },
  { name: 'Confirmation', status: 'upcoming' },
];

function OrderPageLoading() {
  return (
    <div className="space-y-8 animate-pulse">
  <Card className="bg-card shadow-sm rounded-3xl">
        <CardHeader>
          <div className="h-7 w-1/2 bg-muted rounded" />
          <div className="h-4 w-3/4 bg-muted rounded" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-1/4 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded-md" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-1/3 bg-muted rounded" />
              <div className="h-20 w-full bg-muted rounded-md" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-1/2 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded-md" />
            </div>
          </div>
          <Separator />
          <div className="space-y-4">
            <div className="h-6 w-1/3 bg-muted rounded" />
            <div className="h-10 w-full bg-muted rounded-md" />
          </div>
        </CardContent>
      </Card>
      <div className="h-11 w-full bg-primary/50 rounded-md" />
    </div>
  );
}

export default function OrderPage() {
  return (
    <div className="bg-background min-h-[calc(100dvh-4rem)] flex items-start md:items-center justify-center">
      <div className="container mx-auto max-w-lg px-4 py-12 md:py-20">
        <Suspense fallback={<OrderPageLoading />}>
          <OrderForm />
        </Suspense>
      </div>
    </div>
  );
}
