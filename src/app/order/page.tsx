
'use client';

import { Suspense } from 'react';
import { CheckCircle } from 'lucide-react';
import { OrderForm } from './(components)/order-form';
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
      <Card className="bg-card shadow-sm rounded-2xl">
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
    <div className="bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-24">
        <div className="text-center">
            <h1 className="font-headline text-3xl font-bold md:text-4xl">Complete Your Order</h1>
            <p className="mt-2 text-base text-muted-foreground md:text-lg">
                Secure, private, and straightforward.
            </p>
        </div>

        {/* Stepper */}
        <nav aria-label="Progress" className="my-12 max-w-md mx-auto">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                <li key={step.name} className={cn("relative flex-1", stepIdx !== steps.length - 1 ? "pr-4" : "")}>
                    {step.status === 'complete' ? (
                    <>
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="h-0.5 w-full bg-primary" />
                        </div>
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <CheckCircle className="h-5 w-5" />
                        </div>
                    </>
                    ) : step.status === 'current' ? (
                    <>
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                             <div className="h-0.5 w-full bg-border" />
                        </div>
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                            <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
                        </div>
                    </>
                    ) : (
                    <>
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="h-0.5 w-full bg-border" />
                        </div>
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background" />
                    </>
                    )}
                     <div className="absolute top-10 w-max text-center left-1/2 -translate-x-1/2">
                        <p className={cn("text-xs font-medium", step.status === 'current' ? 'text-primary' : 'text-muted-foreground', step.status === 'complete' ? 'text-foreground' : '')}>{step.name}</p>
                    </div>
                </li>
                ))}
            </ol>
        </nav>

        <Suspense fallback={<OrderPageLoading />}>
          <OrderForm />
        </Suspense>
      </div>
    </div>
  );
}
