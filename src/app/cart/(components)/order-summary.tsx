
'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, GraduationCap } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { discounts } from '@/lib/data';

export function OrderSummary() {
    const { items, totalItems, updateQuantity, isStudent, subtotal, deliveryFee, studentDiscount, totalPrice, setDeliveryLocation, deliveryLocation } = useCart();
    const router = useRouter();

    const handleLocationChange = (value: string) => {
        if (value === 'Other') {
            setDeliveryLocation(null); 
        } else {
            setDeliveryLocation(value);
        }
    };
    
    return (
        <Card className="shadow-sm rounded-2xl sticky top-24">
            <CardHeader>
                <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                     <div className="space-y-2">
                        <p className="text-sm font-medium">Delivery Location</p>
                        <Select onValueChange={handleLocationChange} defaultValue={deliveryLocation || 'Other'}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select delivery area..." />
                        </SelectTrigger>
                        <SelectContent>
                                <SelectItem value="Other">Other (Standard Delivery)</SelectItem>
                                {discounts.map(loc => (
                                <SelectItem key={loc.id} value={loc.campus}>{loc.campus}</SelectItem>
                                ))}
                        </SelectContent>
                        </Select>
                        <p className="text-[0.8rem] text-muted-foreground">Select a campus to apply student discounts.</p>
                    </div>

                    {isStudent && (
                        <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-success">
                            <GraduationCap className="h-5 w-5" />
                            <p className="text-sm font-medium">Student discount applied!</p>
                        </div>
                    )}

                    <Separator />

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <p className="text-muted-foreground">Subtotal ({totalItems} items)</p>
                            <p className="font-medium text-foreground">GHS {subtotal.toFixed(2)}</p>
                        </div>
                    {studentDiscount > 0 && (
                        <div className="flex justify-between text-success font-medium">
                            <p>Student Discount</p>
                            <p>- GHS {studentDiscount.toFixed(2)}</p>
                        </div>
                        )}
                        <div className="flex justify-between">
                            <p className="text-muted-foreground">Delivery Fee</p>
                            <p className="font-medium text-foreground">GHS {deliveryFee.toFixed(2)}</p>
                        </div>
                    </div>
                    <Separator />
                    <div className="flex items-baseline justify-between font-bold text-lg">
                        <p>Total</p>
                        <p className="text-primary">GHS {totalPrice.toFixed(2)}</p>
                    </div>
                    <Button size="lg" className="w-full" onClick={() => router.push('/order')}>
                        Proceed to Checkout
                        <ArrowRight />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
