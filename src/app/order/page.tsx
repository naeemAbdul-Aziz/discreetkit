
import { Suspense } from 'react';
import { Loader2, FileText, ShoppingCart, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { OrderForm } from './(components)/order-form';
import { cn } from '@/lib/utils';

const steps = [
  { name: 'Your Cart', status: 'complete' },
  { name: 'Delivery & Payment', status: 'current' },
  { name: 'Confirmation', status: 'upcoming' },
];

function OrderPageLoading() {
  return (
    <div className="space-y-8">
      {/* Product Skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <Card className="shadow-sm overflow-hidden rounded-2xl">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 sm:p-6">
                  <div className="grid grid-cols-[80px_1fr_auto] gap-4 sm:gap-6">
                    <div className="aspect-square w-[80px] rounded-lg bg-muted animate-pulse" />
                    <div className="flex flex-col space-y-2">
                      <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
                      <div className="h-4 w-full bg-muted rounded animate-pulse" />
                      <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="flex flex-col items-end justify-between self-stretch">
                      <div className="h-5 w-20 bg-muted rounded-md animate-pulse" />
                      <div className="w-32 h-10 bg-muted rounded-full animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Form Skeleton */}
      <Card className="shadow-sm rounded-2xl">
        <CardContent className="p-6 space-y-6">
           <div className="h-8 w-56 bg-muted rounded animate-pulse" />
           <div className="space-y-2">
             <div className="h-4 w-24 bg-muted rounded animate-pulse" />
             <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
           </div>
           <div className="space-y-2">
             <div className="h-4 w-32 bg-muted rounded animate-pulse" />
             <div className="h-20 w-full bg-muted rounded-md animate-pulse" />
           </div>
           <div className="space-y-2">
             <div className="h-4 w-48 bg-muted rounded animate-pulse" />
             <div className="h-10 w-full bg-muted rounded-md animate-pulse" />
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OrderPage() {
  return (
    <div className="bg-muted">
      <div className="container mx-auto max-w-2xl px-4 py-12 md:px-6 md:py-24">
        <div className="text-center">
            <h1 className="font-headline text-3xl font-bold md:text-4xl">Complete Your Order</h1>
            <p className="mt-2 text-base text-muted-foreground md:text-lg">
                Secure, private, and straightforward.
            </p>
        </div>

        {/* Stepper */}
        <nav aria-label="Progress" className="my-12">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                <li key={step.name} className={cn("relative", stepIdx !== steps.length - 1 ? "pr-8 sm:pr-20 flex-1" : "")}>
                    {step.status === 'complete' ? (
                    <>
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="h-0.5 w-full bg-primary" />
                        </div>
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <CheckCircle className="h-5 w-5" />
                            <span className="sr-only">{step.name}</span>
                        </div>
                    </>
                    ) : step.status === 'current' ? (
                    <>
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="h-0.5 w-full bg-border" />
                        </div>
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                            <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
                            <span className="sr-only">{step.name}</span>
                        </div>
                    </>
                    ) : (
                    <>
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="h-0.5 w-full bg-border" />
                        </div>
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background" />
                        <span className="sr-only">{step.name}</span>
                    </>
                    )}
                     <div className="absolute top-10 w-max text-center -translate-x-1/2 left-1/2 max-w-20">
                        <p className={cn("text-xs font-medium", step.status === 'current' ? 'text-primary' : 'text-muted-foreground')}>{step.name}</p>
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
