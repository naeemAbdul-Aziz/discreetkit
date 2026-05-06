
'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from "@/components/ui/icon";
import { BrandSpinner } from '@/components/brand-spinner';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f0f0f0" offset="20%" />
      <stop stop-color="#e0e0e0" offset="50%" />
      <stop stop-color="#f0f0f0" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f0f0f0" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);


export function CartView() {
    const { items, updateQuantity, totalItems, subtotal_ghs, student_discount_ghs, delivery_fee_ghs, total_price_ghs } = useCart();
    const [isLoading, setIsLoading] = useState(false);
    const pathname = usePathname();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (pathname !== '/order') {
            setIsLoading(true);
        }
        if (totalItems === 0) {
            e.preventDefault();
        }
    };
    
    if (!isMounted) {
       return (
           <Card className="overflow-hidden rounded-3xl animate-pulse">
                <CardHeader>
                    <div className="h-9 w-3/5 bg-muted rounded-md" />
                    <div className="h-5 w-4/5 bg-muted rounded-md" />
                </CardHeader>
                <CardContent className="p-0">
                    <div className="p-6 bg-muted/50 border-t space-y-4">
                        <div className="h-6 w-1/3 bg-muted rounded-md" />
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <div className="h-5 w-1/4 bg-muted rounded-md" />
                                <div className="h-5 w-1/5 bg-muted rounded-md" />
                            </div>
                            <div className="flex justify-between">
                                <div className="h-5 w-1/3 bg-muted rounded-md" />
                                <div className="h-5 w-1/5 bg-muted rounded-md" />
                            </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between">
                           <div className="h-7 w-1/4 bg-muted rounded-md" />
                           <div className="h-7 w-1/3 bg-muted rounded-md" />
                        </div>
                        <div className="h-12 w-full bg-muted rounded-full" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
    <Card className="overflow-hidden rounded-[2rem] border-0 shadow-lg">
            <CardHeader className="pb-4 pt-8 px-6">
                <CardTitle className="font-headline text-2xl font-bold md:text-3xl tracking-tight">Review Your Cart</CardTitle>
                <CardDescription className="text-sm">
                    Adjust quantities before proceeding.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border">
                    {items.map((item) => {
                        const quantity = item.quantity;
                        const price = item.price_ghs || 0;

                        return (
                             <div key={item.id} className="p-4 sm:p-5">
                                <div className="grid grid-cols-[70px_1fr_auto] items-center gap-4 sm:gap-6">
                                    <div className="relative aspect-square w-[70px] rounded-xl bg-[#f5f5f1] overflow-hidden shadow-sm">
                                        {item.image_url && (
                                            <Image
                                                src={item.image_url}
                                                alt={item.name}
                                                fill
                                                className="object-contain p-2"
                                                data-ai-hint="medical test kit"
                                                placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(80, 80))}`}
                                                sizes="70px"
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col justify-center">
                                        <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2">{item.name}</h3>
                                        <p className="text-[11px] text-muted-foreground mt-0.5">Confidential Delivery</p>
                                    </div>
                                    <div className="flex flex-col items-end justify-between py-1 self-stretch">
                                         <div className="text-right">
                                            <p className="font-bold text-sm text-foreground">
                                                GHS {price.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="flex h-8 items-center justify-between rounded-full border border-primary/20 bg-background p-0.5 shadow-sm">
                                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-primary" onClick={() => updateQuantity(item.id, quantity - 1)}>
                                                    {quantity === 1 ? <Icon name="delete" opticalSize={16} /> : <Icon name="remove" opticalSize={16} />}
                                                </Button>
                                                <span className="w-4 text-center text-xs font-bold text-foreground">{quantity}</span>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-primary" onClick={() => updateQuantity(item.id, quantity + 1)}>
                                                    <Icon name="add" opticalSize={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                
                 <div className="p-6 bg-[#f5f5f1] border-t-0 space-y-4">
                    <h3 className="text-base font-bold tracking-tight uppercase text-[10px] text-muted-foreground">Order Summary</h3>
                     <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <p className="text-muted-foreground">Subtotal ({totalItems} items)</p>
                            <p className="font-bold text-foreground">GHS {subtotal_ghs.toFixed(2)}</p>
                        </div>
                        {student_discount_ghs > 0 && (
                            <div className="flex justify-between text-success font-bold">
                                <p>Student Saving</p>
                                <p>- GHS {student_discount_ghs.toFixed(2)}</p>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <p className="text-muted-foreground">Delivery</p>
                            <p className="font-bold text-foreground">GHS {delivery_fee_ghs.toFixed(2)}</p>
                        </div>
                    </div>
                    <Separator className="bg-primary/5" />
                     <div className="flex items-baseline justify-between font-bold text-lg tracking-tight">
                        <p>Total</p>
                        <p>GHS {total_price_ghs.toFixed(2)}</p>
                    </div>
                    <Button size="lg" className={cn("w-full h-12 md:h-14 rounded-full font-bold shadow-md", isLoading && "bg-primary/80")} asChild disabled={isLoading || totalItems === 0}>
                      <Link href="/order" onClick={handleClick}>
                        {isLoading ? (
                            <>
                                <BrandSpinner size="sm" />
                                Proceeding...
                            </>
                        ) : (
                            <>
                                Checkout
                                <Icon name="arrow_forward" className="ml-1" opticalSize={18} />
                            </>
                        )}
                      </Link>
                    </Button>
                </div>

            </CardContent>
        </Card>
    )
}
