/**
 * @file product-selector.tsx
 * @description displays a selection of featured products, using a carousel on mobile
 *              and a grid on desktop, with a link to see all products.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { EmblaCarouselType } from 'embla-carousel';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/data';
import { ProductCard } from '@/app/products/(components)/product-card';


export function ProductSelector({ products }: { products: Product[] }) {
    // filter to show only featured products in this section.
    const featuredProducts = products.filter(p => p.featured);
    const [api, setApi] = useState<EmblaCarouselType | undefined>();
    const [selectedIndex, setSelectedIndex] = useState(0);

    // callback to update the selected index when the carousel moves.
    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, []);

    // effect to initialize and manage carousel events.
    useEffect(() => {
        if (!api) return;
        onSelect(api);
        api.on('select', onSelect);
        api.on('reInit', onSelect);
        return () => {
          api.off('select', onSelect);
        };
    }, [api, onSelect]);

    return (
        <section id="products" className="py-12 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                        Our Products
                    </p>
                    <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                       Safe. Discreet. Sorted.
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                        Your confidential health essentials, delivered with trust.
                    </p>
                </div>
                
                {/* mobile carousel */}
                <div className="md:hidden">
                    <Carousel setApi={setApi} className="w-full" opts={{loop: true}}>
                        <CarouselContent>
                            {featuredProducts.map((product) => (
                                <CarouselItem key={product.id} className="basis-4/5">
                                    <div className="p-1 h-full">
                                        <ProductCard product={product} />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                     <div className="flex items-center justify-center gap-2 mt-8">
                        {featuredProducts.map((_, index) => (
                            <button
                            key={index}
                            onClick={() => api?.scrollTo(index)}
                            className={cn(
                                'h-2 w-2 rounded-full bg-border transition-all',
                                index === selectedIndex ? 'w-4 bg-primary' : 'hover:bg-primary/50'
                            )}
                            aria-label={`go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* desktop grid */}
                <div className="hidden md:grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {featuredProducts.map((product) => (
                        <div key={product.id}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Button asChild variant="outline" size="lg">
                        <Link href="/products">
                            Shop All Products
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
