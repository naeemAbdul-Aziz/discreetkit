
'use client';

import { products } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight, Plus, Minus } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useState, useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

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


export function ProductSelector() {
    const { addItem, updateQuantity, getItemQuantity } = useCart();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

  return (
    <section id="products" className="bg-background py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
            <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Choose Your Kit
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
                All our kits are WHO-approved, ensuring you get reliable results with complete privacy.
            </p>
        </div>

        <div className="w-full max-w-6xl mx-auto">
            <Carousel
                opts={{
                    align: 'start',
                    loop: products.length > 3,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-4">
                    {products.map((product) => {
                    const quantity = getItemQuantity(product.id);
                    return (
                         <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                            <div className="p-1 h-full">
                                <Card
                                className="flex h-full flex-col overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-lg"
                                >
                                    <CardContent className="flex flex-grow flex-col p-0">
                                    <div className="relative aspect-square overflow-hidden bg-muted p-4">
                                        <Image
                                        src={product.imageUrl}
                                        alt={product.name}
                                        fill
                                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                                        data-ai-hint="medical test kit"
                                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(400, 400))}`}
                                        />
                                    </div>
                                    <div className="flex flex-grow flex-col p-6">
                                        <h3 className="flex-grow text-base font-semibold md:text-lg">{product.name}</h3>
                                        <p className="mt-1 h-12 text-sm text-muted-foreground">{product.description}</p>
                                        <div className="mt-4 flex items-center justify-between border-t pt-4">
                                            <div>
                                                {product.studentPriceGHS && (
                                                    <>
                                                        <p className="font-bold text-success text-lg">GHS {product.studentPriceGHS.toFixed(2)}</p>
                                                        <p className="text-muted-foreground/80 line-through text-xs">
                                                            GHS {product.priceGHS.toFixed(2)}
                                                        </p>
                                                    </>
                                                ) || (
                                                    <p className="text-lg font-semibold">GHS {product.priceGHS.toFixed(2)}</p>
                                                )}
                                            </div>
                                        
                                            {isMounted && quantity > 0 ? (
                                                <div className="flex h-10 items-center justify-between rounded-full border border-primary/50 bg-background p-1 shadow-sm">
                                                    <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full text-primary transition-colors hover:bg-primary/10"
                                                    onClick={() => updateQuantity(product.id, quantity - 1)}
                                                    aria-label={`Decrease quantity of ${product.name}`}
                                                    >
                                                    <Minus className="h-4 w-4" />
                                                    </Button>
                                                    <span className="w-5 text-center font-bold text-foreground">{quantity}</span>
                                                    <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full text-primary transition-colors hover:bg-primary/10"
                                                    onClick={() => updateQuantity(product.id, quantity + 1)}
                                                    aria-label={`Increase quantity of ${product.name}`}
                                                    >
                                                    <Plus className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button onClick={() => addItem(product)} variant="outline" className="rounded-full">
                                                    Add to Cart <Plus className="ml-2 h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    )
                    })}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex -left-4" />
                <CarouselNext className="hidden sm:flex -right-4" />
            </Carousel>
        </div>
      </div>
    </section>
  );
}
