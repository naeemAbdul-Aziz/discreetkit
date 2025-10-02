
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import type { Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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

export function ProductCard({ product, showAddToCart = true }: { product: Product; showAddToCart?: boolean }) {
    const { addItem, getItemQuantity, updateQuantity } = useCart();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const quantity = isMounted ? getItemQuantity(product.id) : 0;
    const isInCart = quantity > 0;

    return (
        <Card className="h-full flex flex-col rounded-2xl overflow-hidden group">
             <Link href={`/products/${product.id}`} className="block">
                <div className="relative aspect-[4/3] w-full bg-muted/50">
                    {product.image_url && (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 768px) 80vw, 30vw"
                            data-ai-hint="medical test kit"
                            placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(250, 188))}`}
                        />
                    )}
                    {product.savings_ghs && product.savings_ghs > 0 && (
                        <Badge variant="accent" className="absolute top-3 left-3 shadow-lg">
                            Save GHS {product.savings_ghs.toFixed(2)}
                        </Badge>
                    )}
                     {!showAddToCart && (
                        <div className="absolute top-3 right-3 h-8 w-8 bg-background/50 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground -rotate-45">
                            <ArrowRight className="h-5 w-5" />
                        </div>
                    )}
                </div>
            </Link>

            <CardContent className="flex flex-grow flex-col justify-between p-6 text-left">
                <div className="flex-grow">
                    <Link href={`/products/${product.id}`} className="block">
                        <h3 className="text-lg font-bold text-foreground leading-tight hover:text-primary transition-colors">{product.name}</h3>
                    </Link>
                    {product.description && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{product.description}</p>}
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-left">
                        <p className="font-bold text-lg text-foreground">
                            GHS {product.price_ghs.toFixed(2)}
                        </p>
                    </div>
                    
                    <div className="w-auto text-right">
                       {showAddToCart ? (
                           <>
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
                           </>
                       ) : (
                           // On homepage cards, this space is now intentionally left blank 
                           // to keep the layout consistent, with the icon serving as the CTA.
                           <div className="h-10 w-[120px]" />
                       )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
