
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Suspense } from 'react';
import { CartView } from './(components)/cart-view';
import { OrderSummary } from './(components)/order-summary';
import { Loader2 } from 'lucide-react';

function CartPageContents() {
    const { totalItems } = useCart();

    if (totalItems === 0) {
        return (
            <div className="text-center">
                <h1 className="font-headline text-3xl font-bold md:text-4xl">Your Cart is Empty</h1>
                <p className="mt-2 text-base text-muted-foreground md:text-lg">
                    Looks like you haven't added any products yet.
                </p>
                <Button asChild className="mt-6">
                    <Link href="/#products">
                        Browse Products
                    </Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-12">
            <div className="lg:col-span-2">
                <CartView />
            </div>
            <div className="mt-8 lg:mt-0">
                <OrderSummary />
            </div>
        </div>
    )
}

function CartPageLoading() {
    return (
        <div className="flex h-64 items-center justify-center">
            <div className="h-64" />
        </div>
    )
}

export default function CartPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
            <Suspense fallback={<CartPageLoading />}>
                <CartPageContents />
            </Suspense>
        </div>
      </div>
    </div>
  );
}
