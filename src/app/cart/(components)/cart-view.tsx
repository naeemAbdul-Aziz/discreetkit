
'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { products } from '@/lib/data';
import { Separator } from '@/components/ui/separator';

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
    const { items, addItem, updateQuantity, getItemQuantity } = useCart();
    const { isStudent } = useCart(state => ({ isStudent: state.isStudent }));

    return (
        <Card className="shadow-sm overflow-hidden rounded-2xl">
            <CardHeader>
                <CardTitle className="font-headline text-3xl font-bold md:text-4xl">Review Your Cart</CardTitle>
                <CardDescription>
                    Adjust quantities, add more products, or proceed to checkout.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border">
                    {products.map((product) => {
                        const quantity = getItemQuantity(product.id);
                        return (
                             <div key={product.id} className="p-4 sm:p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-[80px_1fr_auto] gap-4 sm:gap-6">
                                    <div className="relative aspect-square w-[80px] rounded-lg bg-muted overflow-hidden">
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            fill
                                            className="object-contain p-2"
                                            data-ai-hint="medical test kit"
                                            placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(80, 80))}`}
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-base font-bold text-foreground">{product.name}</h3>
                                        <p className="text-sm text-muted-foreground mt-1 flex-grow">{product.description}</p>
                                    </div>
                                    <div className="flex flex-col items-end justify-between self-stretch">
                                        <div className="text-right h-10 flex flex-col justify-center items-end">
                                        {isStudent && product.studentPriceGHS ? (
                                                <>
                                                    <p className="font-bold text-success text-base">GHS {product.studentPriceGHS.toFixed(2)}</p>
                                                    <p className="text-muted-foreground/80 line-through text-xs font-normal">
                                                        GHS {product.priceGHS.toFixed(2)}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="font-bold text-base text-foreground">
                                                    GHS {product.priceGHS.toFixed(2)}
                                                </p>
                                            )}
                                        </div>
                                         <div className="flex items-center gap-2 mt-2">
                                            {quantity > 0 ? (
                                                <div className="flex h-10 items-center justify-between rounded-full border border-primary/50 bg-background p-1 shadow-sm">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary" onClick={() => updateQuantity(product.id, quantity - 1)}>
                                                        {quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                                                    </Button>
                                                    <span className="w-5 text-center font-bold text-foreground">{quantity}</span>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary" onClick={() => updateQuantity(product.id, quantity + 1)}>
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                 <Button onClick={() => addItem(product)} variant="outline" className="rounded-full">
                                                    Add to Cart <Plus className="ml-2 h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
