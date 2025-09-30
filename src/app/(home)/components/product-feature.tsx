/**
 * @file product-feature.tsx
 * @description a dedicated component to showcase a single product in detail,
 *              with a large image and add-to-cart functionality.
 */

'use client';

import Image from 'next/image';
import { ProductCard } from '@/app/products/(components)/product-card';
import type { Product } from '@/lib/data';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
            <div className={cn("flex flex-col justify-center", reverse && "md:order-first")}>
                <ProductCard product={product} />
            </div>
        </div>
      </div>
    </motion.section>
  );
}
