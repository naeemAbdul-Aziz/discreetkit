
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import type { EmblaCarouselType } from 'embla-carousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';
import { AddToCartManager } from '../../products/[id]/(components)/add-to-cart-manager';
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


interface ProductLine {
    title: string;
    headline: string;
    description: string;
    showcaseImageUrl: string;
}

export function ProductLineShowcase({ line, products }: { line: ProductLine, products: Product[] }) {
    const [api, setApi] = useState<EmblaCarouselType | undefined>();
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(products[0]);

    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
        const newIndex = emblaApi.selectedScrollSnap();
        setSelectedIndex(newIndex);
        setSelectedProduct(products[newIndex]);
    }, [products]);

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
        <section id={line.title.toLowerCase().replace(/\s+/g, '-')} className="py-12 md:py-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Left side: Large showcase image */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.8 }}
                    className="relative aspect-square w-full rounded-3xl bg-muted/30 overflow-hidden"
                >
                    <Image
                        src={line.showcaseImageUrl}
                        alt={`${line.title} product line`}
                        fill
                        className="object-contain p-8 md:p-12"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(800, 800))}`}
                        priority
                    />
                </motion.div>

                {/* Right side: Content and product carousel */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col justify-center h-full text-center md:text-left"
                >
                    <div>
                        <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                            {line.headline}
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:mx-0">
                            {line.description}
                        </p>
                    </div>

                    <div className="mt-8">
                        <Carousel
                            setApi={setApi}
                            opts={{
                                align: 'start',
                                loop: false,
                            }}
                            className="w-full"
                        >
                            <CarouselContent className="-ml-2">
                                {products.map((product, index) => (
                                    <CarouselItem key={index} className="basis-1/2 sm:basis-1/3 pl-2">
                                        <div className="p-1 h-full" onClick={() => api?.scrollTo(index)}>
                                            <Card className={cn(
                                                "h-full flex flex-col rounded-2xl bg-card cursor-pointer border-2 transition-all",
                                                selectedIndex === index ? "border-primary shadow-lg" : "border-border"
                                            )}>
                                                <CardContent className="p-3">
                                                    <div className="relative aspect-square w-full bg-muted/50 rounded-lg overflow-hidden">
                                                        {product.image_url && (
                                                            <Image
                                                                src={product.image_url}
                                                                alt={product.name}
                                                                fill
                                                                className="object-contain p-2"
                                                                sizes="33vw"
                                                            />
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                             <CarouselPrevious className="hidden sm:flex" />
                            <CarouselNext className="hidden sm:flex" />
                        </Carousel>
                    </div>
                    
                    {selectedProduct && (
                        <div className="mt-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedProduct.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="p-6 rounded-2xl bg-muted/40"
                                >
                                    <h3 className="text-lg font-bold text-foreground text-center">{selectedProduct.name}</h3>
                                    <p className="text-sm text-muted-foreground text-center mt-1 h-8 line-clamp-2">{selectedProduct.description}</p>
                                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <p className="font-bold text-2xl text-foreground">
                                            GHS {selectedProduct.price_ghs.toFixed(2)}
                                        </p>
                                        <div className="w-full sm:w-auto min-w-[150px]">
                                            <AddToCartManager product={selectedProduct} />
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
