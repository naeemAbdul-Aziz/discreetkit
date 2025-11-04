
/**
 * @file featured-favorites.tsx
 * @description A section to showcase top-rated products, using social proof
 *              and urgency to encourage conversion.
 */

'use client';

import type { Product } from '@/lib/data';
import { FavoriteProductCard } from './favorite-product-card';
import Link from 'next/link';

type FeaturedProduct = Product & {
  badge: string;
};

export function FeaturedFavoritesSection({ products }: { products: FeaturedProduct[] }) {
  return (
    <section id="featured-favorites" className="py-12 md:py-24 bg-muted/50">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Featured Products
          </h2>
          <Link href="/products" className="text-sm font-semibold text-primary hover:underline">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
          {products.map((product) => (
            <FavoriteProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
