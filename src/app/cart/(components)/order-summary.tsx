
'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';

export function OrderSummary() {
    const { totalItems, subtotal } = useCart(state => ({
        totalItems: state.totalItems,
        subtotal: state.subtotal,
    }));
    const router = useRouter();

    
    return (
        <Card className="shadow-sm rounded-2xl sticky top-24">
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                 <CardDescription>
                    Final costs will be calculated at checkout.
                 </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Separator />

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <p className="text-muted-foreground">Subtotal ({totalItems} items)</p>
                            <p className="font-medium text-foreground">GHS {subtotal.toFixed(2)}</p>
                        </div>
                    </div>
                    <Separator />
                    <Button size="lg" className="w-full" onClick={() => router.push('/order')}>
                        Proceed to Checkout
                        <ArrowRight />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
