
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Check } from 'lucide-react';
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

export function ProductCard({ product }: { product: Product; }) {
    const { addItem, getItemQuantity } = useCart();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!product) return null;

    const quantity = isMounted ? getItemQuantity(product.id) : 0;
    const isInCart = quantity > 0;
    
    const savings = product.savings_ghs;

    return (
        <Card className="h-full flex flex-col rounded-3xl overflow-hidden group bg-card">
            <Link href={`/products/${product.id}`} className="block" passHref>
                <div className="relative aspect-square w-full bg-muted/50 overflow-hidden rounded-t-3xl">
                    {product.image_url && (
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-contain p-4"
                            sizes="(max-width: 768px) 50vw, 30vw"
                            data-ai-hint="medical test kit"
                            placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(250, 188))}`}
                        />
                    )}
                    {savings && savings > 0 && (
                        <Badge variant="accent" className="absolute top-3 left-3 shadow-lg">
                            Save GHS {savings.toFixed(2)}
                        </Badge>
                    )}
                </div>
            </Link>

            <CardContent className="flex flex-grow flex-col justify-between p-4 text-left">
                <div className="flex-grow">
                     <Link href={`/products/${product.id}`} className="block" passHref>
                        <h3 className="text-base font-bold text-foreground leading-tight hover:text-primary transition-colors line-clamp-2">{product.name}</h3>
                    </Link>
                </div>
                
                <div className="mt-2 flex items-end justify-between gap-2">
                     <Link href={`/products/${product.id}`} className="block" passHref>
                        <p className="font-bold text-lg text-foreground">
                            GHS {product.price_ghs.toFixed(2)}
                        </p>
                    </Link>
                    
                    <div className="flex-shrink-0">
                        {!isMounted ? (
                            <Button size="icon" className="h-9 w-9 rounded-full" disabled>
                                <Plus />
                            </Button>
                        ) : (
                            <Button 
                                size="icon" 
                                className={cn("h-9 w-9 rounded-full transition-all", isInCart && "bg-green-600 hover:bg-green-700")} 
                                aria-label={isInCart ? `Added ${product.name} to cart` : `Add ${product.name} to cart`}
                                onClick={(e) => {e.stopPropagation(); addItem(product)}}
                            >
                                {isInCart ? <Check /> : <Plus />}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
