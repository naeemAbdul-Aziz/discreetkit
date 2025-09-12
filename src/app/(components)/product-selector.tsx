'use client';

import { products } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ArrowRight, Star } from 'lucide-react';
import Link from 'next/link';

export function ProductSelector() {

  return (
    <section id="products" className="bg-background py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 lg:sticky lg:top-24">
                 <div className="text-left">
                    <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                        Our Science-Backed Products
                    </h2>
                    <p className="mt-4 text-base text-muted-foreground">
                        We've built every part of our service with your <Link href="/privacy" className="text-primary font-medium hover:underline">privacy</Link>, convenience, and well-being in mind.
                    </p>
                    <Button asChild variant="link" className="px-0 mt-4 text-primary">
                        <Link href="/cart">
                            Browse All Kits
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {products.slice(1, 3).map((product) => (
                    <Card key={product.id} className="flex h-full flex-col overflow-hidden rounded-2xl shadow-sm transition-shadow hover:shadow-lg">
                        <CardContent className="flex flex-grow flex-col p-0">
                            <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-muted p-4">
                                <h3 className="text-2xl font-bold text-center text-foreground/80">{product.id === 2 ? "Pregnancy Kit" : "Bundle Kit"}</h3>
                            </div>
                            <div className="flex flex-grow flex-col p-6">
                                <h3 className="flex-grow text-base font-semibold md:text-lg">{product.name}</h3>
                                <p className="mt-1 h-12 text-sm text-muted-foreground">{product.description}</p>
                                <div className="mt-4 flex items-center gap-1 text-yellow-500">
                                    <Star className="h-4 w-4 fill-current" />
                                    <Star className="h-4 w-4 fill-current" />
                                    <Star className="h-4 w-4 fill-current" />
                                    <Star className="h-4 w-4 fill-current" />
                                    <Star className="h-4 w-4 fill-current" />
                                    <span className="ml-2 text-xs text-muted-foreground">({product.id === 2 ? 150 : 300} reviews)</span>
                                </div>
                                <div className="mt-4 border-t pt-4">
                                    <p className="text-lg font-semibold text-primary">GHS {product.priceGHS.toFixed(2)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
      </div>
    </section>
  );
}
