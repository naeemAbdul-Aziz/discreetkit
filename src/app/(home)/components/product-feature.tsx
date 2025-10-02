

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
import { ProductCard } from '@/app/products/(components)/product-card';

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
      <div className="container mx-auto max-w-2xl px-4 md:px-6">
        <div className="text-center mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                Featured Bundle
            </p>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                {product.name}
            </h2>
        </div>
        <ProductCard product={product} showAddToCart={true} />
      </div>
    </motion.section>
  );
}
