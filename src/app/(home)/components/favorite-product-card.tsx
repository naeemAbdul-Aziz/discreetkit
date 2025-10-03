/**
 * @file favorite-product-card.tsx
 * @description A detailed product card for the featured favorites section,
 *              including social proof and an urgency meter.
 */

'use client';

import { useState, useEffect } from 'react';
import type { Product } from '@/lib/data';
import { useCart } from '@/hooks/use-cart';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Star, Flame, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type FeaturedProduct = Product & {
  stock_level: number;
  review_count: number;
  rating_avg: number;
  benefit: string;
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
  const { addItem, getItemQuantity } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const stockLevel = product.stock_level;
  const isOutOfStock = stockLevel === 0;
  
  let urgency = { text: '', color: '', percentage: 0 };
  if (stockLevel < 10) {
    urgency = { text: `Selling Out! Only ${stockLevel} left!`, color: 'bg-destructive', percentage: (stockLevel / 10) * 100 };
  } else if (stockLevel < 50) {
    urgency = { text: `Low Stock! Only ${stockLevel} left.`, color: 'bg-amber-500', percentage: (stockLevel / 50) * 100 };
  }

  const handleAddToCart = () => {
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <Card className="group relative grid grid-cols-1 overflow-hidden rounded-2xl border-2 border-transparent transition-all hover:border-primary hover:shadow-2xl md:grid-cols-2">
      <div className="relative aspect-[4/3] bg-muted/50">
        <Link href={`/products/${product.id}`} className="block h-full w-full">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
              placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(400, 300))}`}
            />
          )}
        </Link>
         {urgency.text && !isOutOfStock && (
            <Badge variant="destructive" className="absolute left-3 top-3 flex items-center gap-1.5 shadow-lg">
                <Flame className="h-3 w-3"/> 
                {stockLevel < 10 ? 'Selling Out' : 'Low Stock'}
            </Badge>
        )}
      </div>

      <div className="flex flex-col justify-between p-6">
        <div>
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-headline text-xl font-bold text-foreground">{product.name}</h3>
          </Link>

          <div className="mt-2 flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-bold text-foreground">{product.rating_avg} Stars</span>
            </div>
            <span className="text-sm text-muted-foreground">({product.review_count.toLocaleString()} Reviews)</span>
          </div>

          <p className="mt-3 text-sm text-muted-foreground">{product.benefit}</p>
        </div>

        <div className="mt-6 space-y-4">
            {urgency.text && !isOutOfStock && (
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-destructive">{urgency.text}</p>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div className={cn("absolute h-full transition-all", urgency.color)} style={{ width: `${urgency.percentage}%` }}/>
                    </div>
                </div>
            )}
          
          <p className="text-2xl font-bold text-foreground">GHS {product.price_ghs.toFixed(2)}</p>

          <Button 
            size="lg" 
            className={cn("w-full transition-all", isAdded && 'bg-green-600 hover:bg-green-700')}
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdded}
          >
            {isOutOfStock ? (
                "Out of Stock"
            ) : isAdded ? (
                <>
                    <Check className="mr-2 h-5 w-5" /> Added!
                </>
            ) : (
                "Grab Yours Now"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
