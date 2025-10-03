/**
 * @file featured-favorites.tsx
 * @description A section to showcase top-rated products, using social proof
 *              and urgency to encourage conversion.
 */

'use client';

import type { Product } from '@/lib/data';
import { FavoriteProductCard } from './favorite-product-card';

type FeaturedProduct = Product & {
  stock_level: number;
  review_count: number;
  rating_avg: number;
  benefit: string;
};

export function FeaturedFavoritesSection({ products }: { products: FeaturedProduct[] }) {
  return (
    <section id="featured-favorites" className="py-12 md:py-24 bg-muted/50">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Customer Favorites: Selling Out Fast!
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            Don't miss out on what everyone is talking about. These top-rated essentials are flying off the shelves.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2">
          {products.map((product) => (
            <FavoriteProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
