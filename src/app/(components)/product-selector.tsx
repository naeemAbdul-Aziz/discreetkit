
'use client';

import { useState, useEffect } from 'react';
import { products } from '@/lib/data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

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
        <Card className="group flex h-full flex-col overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-lg">
            <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-muted">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="object-contain transition-transform duration-300 group-hover:scale-105 p-4"
                    sizes="(max-width: 768px) 80vw, 30vw"
                    data-ai-hint="medical test kit"
                    placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(200, 200))}`}
                />
                {hasStudentDeal && (
                    <Badge variant="secondary" className="absolute left-3 top-3 bg-primary/20 text-primary border border-primary/30">
                        Student Deal
                    </Badge>
                )}
            </div>
            <div className="flex flex-grow flex-col p-4 md:p-6 bg-card text-left">
                <h3 className="flex-grow text-lg font-bold text-foreground leading-tight">{product.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{product.description}</p>
                
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-left">
                        {hasStudentDeal ? (
                            <>
                                <p className="font-bold text-success text-xl">GHS {price.toFixed(2)}</p>
                                <p className="text-muted-foreground/80 line-through text-xs font-normal">
                                    GHS {product.priceGHS.toFixed(2)}
                                </p>
                            </>
                        ) : (
                            <p className="font-bold text-xl text-foreground">
                                GHS {price.toFixed(2)}
                            </p>
                        )}
                    </div>
                    
                    <div className="w-auto text-right">
                        {!isMounted ? (
                            <Button disabled className="w-[140px]">
                                <Plus className="mr-2 h-4 w-4" />
                                Add to cart
                            </Button>
                        ) : isInCart ? (
                            <div className="flex h-10 items-center justify-between rounded-full border border-primary/50 bg-background p-1 shadow-sm w-[140px]">
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary" onClick={() => updateQuantity(product.id, quantity - 1)}>
                                    {quantity === 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                                </Button>
                                <span className="w-8 text-center font-bold text-foreground">{quantity}</span>
                                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-primary" onClick={() => updateQuantity(product.id, quantity + 1)}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={() => addItem(product)} className="w-[140px]">
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
    const featuredProducts = products.filter(p => p.featured);
    const [api, setApi] = useState<any>();
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!api) {
            return;
        }

        setCurrent(api.selectedScrollSnap() + 1);
        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1);
        });
    }, [api]);

    return (
        <section id="products" className="bg-background py-12 md:py-24">
            <div className="container mx-auto px-4 md:px-6">
                <div className="text-center mb-12">
                    <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                        Our Products
                    </p>
                    <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                       Private Health Essentials
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                        Choose from our selection of WHO-approved tests, wellness products, and more. Delivered discreetly to you.
                    </p>
                </div>
                
                {/* Mobile Carousel */}
                <div className="md:hidden">
                    <Carousel setApi={setApi} className="w-full" opts={{ loop: true }}>
                        <CarouselContent>
                            {featuredProducts.map((product) => (
                                <CarouselItem key={product.id} className="basis-[85%]">
                                    <div className="p-1">
                                        <ProductCard product={product} />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <div className="py-2 text-center text-sm text-muted-foreground">
                            {current} of {featuredProducts.length}
                        </div>
                    </Carousel>
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
