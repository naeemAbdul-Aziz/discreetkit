

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
import { Card } from '@/components/ui/card';

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
        className="py-12 md:py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8 }}
    >
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <Card className="overflow-hidden rounded-2xl group bg-muted/30">
          <div className={cn("grid md:grid-cols-2")}>
            
            {/* Text Content */}
            <div className={cn("flex flex-col justify-center p-8 text-center md:text-left md:p-12", reverse && "md:order-last")}>
                <div>
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                        Featured Bundle
                    </p>
                    <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                        {product.name}
                    </h2>
                    {product.description && (
                        <p className="mt-4 max-w-xl mx-auto md:mx-0 text-base text-muted-foreground md:text-lg">
                            {product.description}
                        </p>
                    )}
                </div>

                <div className="mt-8 flex flex-col items-center justify-center md:items-start md:justify-start gap-4">
                    <p className="font-bold text-3xl text-foreground">
                        GHS {product.price_ghs.toFixed(2)}
                    </p>
                    {product.savings_ghs && product.savings_ghs > 0 && (
                        <Badge variant="accent">
                            Bundle & Save GHS {product.savings_ghs.toFixed(2)}
                        </Badge>
                    )}
                </div>
                 <div className="mt-8 flex justify-center md:justify-start">
                    <Button asChild size="lg">
                        <Link href={`/products/${product.id}`}>
                            View Bundle
                            <ArrowUpRight />
                        </Link>
                    </Button>
                </div>
            </div>
            
            {/* Image */}
             <div className={cn("relative h-80 w-full md:h-full min-h-[350px]", reverse && "md:order-first")}>
                {product.image_url && (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        data-ai-hint="medical test kit bundle"
                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(1200, 675))}`}
                    />
                )}
            </div>

          </div>
        </Card>
      </div>
    </motion.section>
  );
}
