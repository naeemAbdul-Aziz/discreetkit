

'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
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
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        <Card className="overflow-hidden rounded-3xl">
          <div className={cn("grid md:grid-cols-2", reverse && "md:grid-flow-row-dense")}>
            <div className={cn("flex flex-col justify-center p-8 text-center md:p-12 md:text-left", reverse && "md:col-start-2")}>
                <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                    Featured Bundle
                </p>
                <h2 className="mt-2 font-headline text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {product.name}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:mx-0">
                    {product.description}
                </p>
                <div className="mt-8 flex justify-center md:justify-start">
                    <Button asChild size="lg">
                    <Link href={`/products/${product.id}`}>
                        View Bundle
                        <ArrowUpRight />
                    </Link>
                    </Button>
                </div>
            </div>
            <div className="relative h-64 min-h-[300px] w-full md:h-full bg-muted/50 rounded-3xl overflow-hidden">
                {product.image_url && (
                    <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-contain p-8 rounded-3xl"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(600, 400))}`}
                    />
                )}
            </div>
          </div>
        </Card>
      </div>
    </motion.section>
  );
}
