
'use client';

import { useState, useEffect, useCallback } from 'react';
import { products } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import type { EmblaCarouselType } from 'embla-carousel';

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
    const { addItem, updateQuantity, getItemQuantity, isStudent } = useCart();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const quantity = isMounted ? getItemQuantity(product.id) : 0;
    const hasStudentDeal = isStudent && product.studentPriceGHS;
    const price = hasStudentDeal ? product.studentPriceGHS : product.priceGHS;

    return (
        <Card className="group flex h-full flex-col overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-lg">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-muted p-4">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={250}
                    height={250}
                    className="object-contain transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 80vw, 30vw"
                    data-ai-hint="medical test kit"
                    placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(250, 250))}`}
                />
                {hasStudentDeal && (
                    <Badge variant="secondary" className="absolute left-3 top-3 bg-success text-success-foreground">
                        Student Deal
                    </Badge>
                )}
            </div>
            <div className="flex flex-grow flex-col p-4 md:p-6 bg-card">
                <h3 className="flex-grow text-base font-bold text-foreground">{product.name}</h3>
                <p className="mt-1 min-h-[3rem] text-sm text-muted-foreground">{product.description}</p>
                
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
                    
                    <div className="w-[140px] text-right">
                        {!isMounted ? (
                            <Button className="w-full" disabled>
                                <Plus className="mr-2 h-4 w-4" />
                                Add to cart
                            </Button>
                        ) : quantity > 0 ? (
                            <div className="flex h-10 items-center justify-center rounded-full border border-primary/50 bg-background p-1 shadow-sm w-full">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary" onClick={() => updateQuantity(product.id, quantity - 1)}>
                                    {quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                                </Button>
                                <span className="w-8 flex-1 text-center font-bold text-foreground">{quantity}</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary" onClick={() => updateQuantity(product.id, quantity + 1)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={() => addItem(product)} className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
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
        <section id="products" className="bg-background py-12 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                        Our Products
                    </p>
                    <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                       Confidential Self-Test Kits
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                        Choose from our selection of WHO-approved, private self-test kits. Delivered discreetly to you.
                    </p>
                </div>

                {/* Mobile Carousel */}
                <div className="md:hidden">
                    <Carousel setApi={setApi} opts={{ align: 'center', loop: true }}>
                        <CarouselContent className="-ml-4">
                            {products.map((product) => (
                                <CarouselItem key={product.id} className="basis-4/5 pl-4">
                                    <div className="p-1 h-full">
                                        <ProductCard product={product} />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {products.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => api?.scrollTo(index)}
                                className={cn(
                                    'h-2 w-2 rounded-full bg-border transition-all',
                                    index === selectedIndex ? 'w-4 bg-primary' : 'hover:bg-primary/50'
                                )}
                                aria-label={`Go to product ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:grid md:grid-cols-1 md:gap-6 lg:grid-cols-3">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Button asChild variant="outline">
                        <Link href="/cart">
                            Review Your Cart and Proceed
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
}
