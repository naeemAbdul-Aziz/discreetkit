
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { EmblaCarouselType } from 'embla-carousel';
import { products } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { cn } from '@/lib/utils';

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

function ProductCard({ product }: { product: typeof products[0] }) {
    const { addItem, getItemQuantity, updateQuantity, isStudent } = useCart();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const quantity = isMounted ? getItemQuantity(product.id) : 0;
    const isInCart = quantity > 0;
    const hasStudentDeal = isStudent && product.studentPriceGHS;
    const price = hasStudentDeal ? product.studentPriceGHS : product.priceGHS;

    return (
        <Card className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-4">
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted/50 p-4 rounded-lg">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={250}
                    height={188}
                    className="object-contain"
                    sizes="(max-width: 768px) 80vw, 30vw"
                    data-ai-hint="medical test kit"
                    placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(250, 188))}`}
                />
            </div>
            <div className="flex flex-grow flex-col pt-4 text-left">
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-foreground leading-tight">{product.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-left">
                        {hasStudentDeal ? (
                            <>
                                <p className="font-bold text-success text-lg">GHS {price.toFixed(2)}</p>
                                <p className="text-muted-foreground/80 line-through text-xs font-normal">
                                    GHS {product.priceGHS.toFixed(2)}
                                </p>
                            </>
                        ) : (
                            <p className="font-bold text-lg text-foreground">
                                GHS {price.toFixed(2)}
                            </p>
                        )}
                    </div>
                    
                    <div className="w-auto text-right">
                        {!isMounted ? (
                            <Button disabled className="w-[120px]">
                                Add to cart
                            </Button>
                        ) : isInCart ? (
                            <div className="flex h-10 items-center justify-between rounded-full border bg-background p-1 shadow-sm w-[120px]">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary" onClick={() => updateQuantity(product.id, quantity - 1)}>
                                    {quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                                </Button>
                                <span className="w-8 text-center font-bold text-foreground">{quantity}</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary" onClick={() => updateQuantity(product.id, quantity + 1)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={() => addItem(product)} className="w-[120px]">
                                Add to cart
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}

export function ProductSelector() {
    const featuredProducts = products.filter(p => p.featured);
    const [api, setApi] = useState<EmblaCarouselType | undefined>();
    const [selectedIndex, setSelectedIndex] = useState(0);

    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, []);

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
        <section id="products" className="pb-12 md:pb-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                        Our Products
                    </p>
                    <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                       Private Health Essentials
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                        Private Health Essentials. Delivered with discretion, built on trust.
                    </p>
                </div>
                
                {/* Mobile Carousel */}
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
                            aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
                    {featuredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
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
