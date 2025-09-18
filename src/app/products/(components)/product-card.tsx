
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/app/products/page';

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

export function ProductCard({ product }: { product: Product }) {
    const { addItem, getItemQuantity, updateQuantity, isStudent } = useCart();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const quantity = isMounted ? getItemQuantity(product.id) : 0;
    const isInCart = quantity > 0;
    const hasStudentDeal = isStudent && product.student_price_ghs;
    const price = hasStudentDeal ? product.student_price_ghs : product.price_ghs;

    return (
        <Card className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-4">
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted/50 p-4 rounded-lg">
                {product.image_url && (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        width={250}
                        height={188}
                        className="object-contain"
                        sizes="(max-width: 768px) 80vw, 30vw"
                        data-ai-hint="medical test kit"
                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(250, 188))}`}
                    />
                )}
            </div>
            <div className="flex flex-grow flex-col pt-4 text-left">
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-foreground leading-tight">{product.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-left">
                        {hasStudentDeal && price ? (
                            <>
                                <p className="font-bold text-success text-lg">GHS {price.toFixed(2)}</p>
                                <p className="text-muted-foreground/80 line-through text-xs font-normal">
                                    GHS {product.price_ghs.toFixed(2)}
                                </p>
                            </>
                        ) : (
                            <p className="font-bold text-lg text-foreground">
                                GHS {product.price_ghs.toFixed(2)}
                            </p>
                        )}
                    </div>
                    
                    <div className="w-auto text-right">
                        {!isMounted ? (
                            <Button disabled className="w-[120px]">
                                Add to cart
                            </Button>
                        ) : isInCart ? (
                            <div className="flex h-10 items-center justify-between rounded-full border bg-background p-1 shadow-sm w-[120px]">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary" onClick={() => updateQuantity(product.id, quantity - 1)}>
                                    {quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                                </Button>
                                <span className="w-8 text-center font-bold text-foreground">{quantity}</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary" onClick={() => updateQuantity(product.id, quantity + 1)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={() => addItem(product)} className="w-[120px]">
                                Add to cart
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
