
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AddToCartManager } from '@/app/products/[id]/(components)/add-to-cart-manager';

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


export function ProductFeature({ product, reverse = false }: { product: Product, reverse?: boolean }) {
  if (!product) return null;
  
  return (
    <motion.section 
        className="py-12 md:py-16 group"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* image column */}
            <Link href={`/products/${product.id}`} className={cn("relative aspect-square w-full max-w-md mx-auto rounded-3xl bg-muted/50 p-8", reverse && "md:order-last")}>
                {product.image_url && (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        data-ai-hint="medical test kit"
                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(600, 600))}`}
                    />
                )}
                 <div className="absolute top-4 right-4 h-10 w-10 bg-background/50 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground">
                    <ArrowUpRight className="h-5 w-5" />
                </div>
            </Link>

            {/* content column */}
            <div className={cn("flex flex-col justify-center text-center md:text-left", reverse && "md:order-first")}>
                <div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                        Featured Product
                    </p>
                    <Link href={`/products/${product.id}`}>
                      <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl group-hover:text-primary transition-colors">
                          {product.name}
                      </h2>
                    </Link>
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
                </div>
            </div>
        </div>
      </div>
    </motion.section>
  );
}
