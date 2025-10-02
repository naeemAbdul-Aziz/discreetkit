/**
 * @file product-feature.tsx
 * @description a dedicated component to showcase a single product in detail,
 *              with a large image and add-to-cart functionality.
 */

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Trash2 } from 'lucide-react';
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

function AddToCartManager({ product }: { product: Product }) {
    const { addItem, getItemQuantity, updateQuantity } = useCart();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const quantity = isMounted ? getItemQuantity(product.id) : 0;
    const isInCart = quantity > 0;

    if (!isMounted) {
        return (
            <Button disabled size="lg" className="w-full sm:w-auto">
                Add to cart
            </Button>
        );
    }
    
    if (isInCart) {
        return (
            <div className="flex h-11 items-center justify-between rounded-full border bg-background p-1 shadow-sm sm:w-auto">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary" onClick={() => updateQuantity(product.id, quantity - 1)}>
                    {quantity === 1 ? <Trash2 className="h-5 w-5" /> : <Minus className="h-5 w-5" />}
                </Button>
                <span className="w-10 text-center font-bold text-foreground">{quantity}</span>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-primary" onClick={() => updateQuantity(product.id, quantity + 1)}>
                    <Plus className="h-5 w-5" />
                </Button>
            </div>
        );
    }

    return (
        <Button onClick={() => addItem(product)} size="lg" className="w-full sm:w-auto">
            Add to Cart
        </Button>
    );
}

export function ProductFeature({ product, reverse = false }: { product: Product, reverse?: boolean }) {
  if (!product) return null;
  
  return (
    <motion.section 
        className="py-12 md:py-16"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* image column */}
            <div className={cn("relative aspect-square w-full max-w-md mx-auto rounded-3xl bg-muted/50 p-8", reverse && "md:order-last")}>
                 {product.image_url && (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-contain"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        data-ai-hint="medical test kit"
                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(600, 600))}`}
                    />
                )}
            </div>

            {/* content column */}
            <div className={cn("flex flex-col justify-center text-center md:text-left", reverse && "md:order-first")}>
                <div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                        Featured Product
                    </p>
                    <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                        {product.name}
                    </h2>
                    {product.description && (
                        <p className="mt-4 max-w-lg mx-auto md:mx-0 text-base text-muted-foreground md:text-lg">
                            {product.description}
                        </p>
                    )}
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6">
                     <div className="text-center sm:text-left">
                        <p className="font-bold text-3xl text-foreground">
                            GHS {product.price_ghs.toFixed(2)}
                        </p>
                        {product.savings_ghs && product.savings_ghs > 0 && (
                            <Badge variant="accent" className="mt-1">
                                Bundle & Save GHS {product.savings_ghs.toFixed(2)}
                            </Badge>
                        )}
                    </div>
                    <div className="w-full sm:w-auto">
                        <AddToCartManager product={product} />
                    </div>
                </div>
            </div>
        </div>
      </div>
    </motion.section>
  );
}