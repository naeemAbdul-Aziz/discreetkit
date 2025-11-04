
/**
 * @file favorite-product-card.tsx
 * @description A simplified product card for the featured products section.
 */

'use client';

import type { Product } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type FeaturedProduct = Product & {
  badge: string;
};

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

export function FavoriteProductCard({ product }: { product: FeaturedProduct }) {
  const isPopular = product.badge === 'Popular';

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg bg-card border-border">
       <Link href={`/products/${product.id}`} className="block h-full w-full">
        <div className="relative aspect-square w-full overflow-hidden bg-muted/30">
            {product.image_url && (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 25vw"
                placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(400, 300))}`}
              />
            )}
        </div>

        <CardContent className="flex flex-grow flex-col justify-between p-4">
          <div>
            <h3 className="font-bold text-base text-foreground truncate">{product.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
          </div>

          <div className="mt-4 flex items-end justify-between">
            <p className="text-lg font-bold text-foreground">GHS {product.price_ghs.toFixed(2)}</p>
            <Badge variant={isPopular ? 'default' : 'secondary'} className={cn(!isPopular && "bg-accent text-accent-foreground")}>
              {product.badge}
            </Badge>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
