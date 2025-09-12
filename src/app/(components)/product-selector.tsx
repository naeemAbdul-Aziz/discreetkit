
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { EmblaCarouselType } from 'embla-carousel';
import Autoplay from 'embla-carousel-autoplay';
import { products } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight, Plus, Minus, Trash2, ShieldCheck, Award, Truck, Play, Pause, GraduationCap } from 'lucide-react';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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


const benefits = [
    { icon: ShieldCheck, text: '100% Private & Anonymous' },
    { icon: Award, text: 'WHO-Approved Accuracy' },
    { icon: Truck, text: 'Discreet, Unbranded Packaging' },
];

export function ProductSelector() {
    const { addItem, updateQuantity, getItemQuantity, isStudent } = useCart();
    const [isMounted, setIsMounted] = useState(false);
    const [api, setApi] = useState<EmblaCarouselType | undefined>();
    const [isPlaying, setIsPlaying] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const togglePlay = useCallback(() => {
        const autoplay = api?.plugins()?.autoplay;
        if (!autoplay) return;

        if (autoplay.isPlaying()) {
        autoplay.stop();
        } else {
        autoplay.play();
        }
        setIsPlaying((prev) => !prev);
    }, [api]);

    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!api) return;

        onSelect(api);
        api.on('select', onSelect);
        api.on('reInit', onSelect);
        api.on('autoplay:play', () => setIsPlaying(true));
        api.on('autoplay:stop', () => setIsPlaying(false));

        return () => {
        api?.off('select', onSelect);
        };
    }, [api, onSelect]);


    return (
        <section id="products" className="bg-background py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 lg:sticky lg:top-24">
                    <div className="text-left">
                        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                            Private & Reliable
                        </p>
                        <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                           WHO-Approved Test Kits
                        </h2>
                        <p className="mt-4 text-base text-muted-foreground">
                            We've built every part of our service with your <Link href="/privacy" className="text-primary font-medium hover:underline">privacy</Link>, convenience, and well-being in mind.
                        </p>
                        <ul className="mt-6 space-y-4">
                            {benefits.map(benefit => (
                                <li key={benefit.text} className="flex items-center gap-3">
                                    <benefit.icon className="h-5 w-5 text-primary" />
                                    <span className="text-foreground font-medium">{benefit.text}</span>
                                </li>
                            ))}
                        </ul>
                        <Button asChild variant="outline" className="mt-8">
                            <Link href="/cart">
                                Browse All Kits
                                <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="lg:col-span-2">
                     <Carousel
                        setApi={setApi}
                        opts={{ align: 'start', loop: true }}
                        plugins={[Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]}
                        className="w-full"
                    >
                        <CarouselContent>
                        {products.map((product) => {
                            const quantity = isMounted ? getItemQuantity(product.id) : 0;
                            return (
                            <CarouselItem key={product.id} className="basis-4/5 sm:basis-1/2">
                                <div className="p-1 h-full">
                                <Card key={product.id} className="flex h-full flex-col overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-lg">
                                    <CardContent className="flex flex-grow flex-col p-0">
                                        <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-muted">
                                            <Image
                                                src={product.imageUrl}
                                                alt={product.name}
                                                fill
                                                className="object-contain p-4"
                                                data-ai-hint="medical test kit"
                                                placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(300, 300))}`}
                                            />
                                            {isStudent && product.studentPriceGHS && (
                                                <div className="absolute top-0 right-0 h-16 w-16">
                                                    <div className="absolute transform rotate-45 bg-success text-center text-success-foreground font-semibold py-1 right-[-34px] top-[32px] w-[170px] shadow-lg">
                                                        <div className="flex items-center justify-center">
                                                            <GraduationCap className="h-4 w-4 mr-1" />
                                                            Student Deal
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-grow flex-col p-4 md:p-6">
                                            <h3 className="flex-grow text-base font-semibold md:text-lg">{product.name}</h3>
                                            <p className="mt-1 min-h-[3rem] text-sm text-muted-foreground">{product.description}</p>
                                            
                                            {product.id !== 2 && (
                                            <div className="mt-4 flex items-center gap-2">
                                                <Badge variant="outline" className="border-green-600/50 bg-green-50/50 text-green-700 font-medium">
                                                    <Award className="mr-1.5 h-3.5 w-3.5" />
                                                    WHO-Approved
                                                </Badge>
                                            </div>
                                            )}

                                            <div className="mt-4 border-t pt-4 flex justify-between items-center">
                                                <div className="text-right">
                                                {isStudent && product.studentPriceGHS ? (
                                                        <>
                                                            <p className="font-bold text-success text-lg">GHS {product.studentPriceGHS.toFixed(2)}</p>
                                                            <p className="text-muted-foreground/80 line-through text-xs font-normal">
                                                                GHS {product.priceGHS.toFixed(2)}
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <p className="font-bold text-lg text-foreground">
                                                            GHS {product.priceGHS.toFixed(2)}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isMounted && (quantity > 0 ? (
                                                        <div className="flex h-10 items-center justify-between rounded-full border border-primary/50 bg-background p-1 shadow-sm">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary" onClick={() => updateQuantity(product.id, quantity - 1)}>
                                                                {quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                                                            </Button>
                                                            <span className="w-5 text-center font-bold text-foreground">{quantity}</span>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary" onClick={() => updateQuantity(product.id, quantity + 1)}>
                                                                <Plus className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button onClick={() => addItem(product)} variant="outline" className="rounded-full">
                                                            Add <Plus className="ml-2 h-4 w-4" />
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                </div>
                            </CarouselItem>
                            );
                        })}
                        </CarouselContent>
                         <CarouselPrevious className="left-[-12px] sm:left-[-16px]" />
                        <CarouselNext className="right-[-12px] sm:right-[-16px]" />
                    </Carousel>
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={togglePlay}
                            className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground"
                            aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
                        >
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                        </Button>
                        <div className="flex items-center justify-center gap-2">
                        {products.map((_, index) => (
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
                </div>
            </div>
        </div>
        </section>
    );
}

    