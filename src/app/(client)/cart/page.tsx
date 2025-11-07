
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks/use-cart';
import { Suspense } from 'react';
import { CartView } from '@/app/cart/(components)/cart-view';
import { ArrowRight } from 'lucide-react';

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
        <div className="max-w-3xl mx-auto">
            <CartView />
            <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>
                    <Link href="/products" className="font-semibold text-primary hover:underline">
                        Want to add more? Browse all products <ArrowRight className="inline h-3 w-3" />
                    </Link>
                </p>
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
        <div className="bg-background min-h-dvh vk-safe overscroll-contain vk-scroll">
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
