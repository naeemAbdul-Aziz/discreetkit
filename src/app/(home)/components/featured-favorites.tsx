/**
 * @file featured-favorites.tsx
 * @description Modern product showcase with snap carousel on mobile, grid on desktop
 */

'use client';

import { useRef } from 'react';
import { ProductCard } from '@/app/(client)/products/(components)/product-card';
import type { Product } from '@/lib/data';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export function FeaturedFavoritesSection({ products }: { products: (Product & { badge: string })[] }) {
  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Section Header */}
        <div className="mb-8 md:mb-12">
          <span className="mb-4 inline-block h-1 w-12 bg-primary" />
          <h2 className="mb-4 font-headline text-3xl md:text-5xl font-bold leading-tight tracking-tight">
            Our Most <br />
            <span className="text-primary italic">Trusted</span> Essentials.
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
            Hand-picked for privacy, reliability, and peace of mind. These are the products our community relies on.
          </p>
        </div>

        {/* Mobile: Snap Carousel with Peek */}
        <div className="md:hidden">
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {products.map((product) => (
                <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-[85%]">
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
              
              {/* View All Card - Mobile */}
              <CarouselItem className="pl-2 md:pl-4 basis-[85%]">
                <Link href="/products" className="relative overflow-hidden rounded-3xl bg-primary p-8 text-center group flex flex-col items-center justify-center min-h-[400px]">
                  <div className="relative z-10">
                    <div className="mb-4 mx-auto h-16 w-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm transition-transform group-hover:scale-110">
                      <ArrowRight className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">See Everything</h3>
                    <p className="text-white/80">Explore our full range of discreet essentials.</p>
                  </div>
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                </Link>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
          
          {/* Swipe Indicator */}
          <div className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground">
            <div className="flex gap-1">
              <div className="h-1 w-8 rounded-full bg-primary" />
              <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
            </div>
            <span>Swipe to explore</span>
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id}>
              <ProductCard product={product} />
            </div>
          ))}
          
          {/* View All Card - Desktop */}
          <Link href="/products" className="relative overflow-hidden rounded-3xl bg-primary p-8 text-center group flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative z-10">
              <div className="mb-6 mx-auto h-20 w-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm transition-transform group-hover:scale-110">
                <ArrowRight className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">See Everything</h3>
              <p className="text-white/80">Explore our full range of discreet essentials.</p>
            </div>
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-colors" />
          </Link>
        </div>

      </div>
    </section>
  );
}
