

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
        className="py-12 md:py-24 bg-muted/50 group"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
    >
      <Link href={`/products/${product.id}`} className="block">
        <div className="container mx-auto max-w-4xl px-4 md:px-6 text-center">

            {/* Content */}
            <div className={cn("flex flex-col justify-center text-center")}>
                <div>
                    <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
                        Featured Product
                    </p>
                    <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground md:text-6xl group-hover:text-primary transition-colors">
                        {product.name}
                    </h2>
                    {product.description && (
                        <p className="mt-6 max-w-2xl mx-auto text-base text-muted-foreground md:text-xl">
                            {product.description}
                        </p>
                    )}
                </div>

                <div className="mt-8 flex flex-col items-center justify-center gap-4">
                    <p className="font-bold text-4xl text-foreground">
                        GHS {product.price_ghs.toFixed(2)}
                    </p>
                    {product.savings_ghs && product.savings_ghs > 0 && (
                        <Badge variant="accent" className="mt-1">
                            Bundle & Save GHS {product.savings_ghs.toFixed(2)}
                        </Badge>
                    )}
                </div>
            </div>
            
            {/* Image */}
            <div className="relative aspect-video w-full max-w-3xl mx-auto mt-12">
                {product.image_url && (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-contain transition-transform duration-500 ease-in-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 70vw"
                        data-ai-hint="medical test kit"
                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(1200, 675))}`}
                    />
                )}
                 <div className="absolute top-4 right-4 h-10 w-10 bg-background/50 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground group-hover:scale-110 transition-transform">
                    <ArrowUpRight className="h-5 w-5" />
                </div>
            </div>

        </div>
      </Link>
    </motion.section>
  );
}
