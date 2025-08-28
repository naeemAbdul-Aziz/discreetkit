
'use client';

import { products, type Product } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, ArrowRight } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { useState, useEffect } from 'react';
import Link from 'next/link';

function AddToCartButton({ product }: { product: Product }) {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const quantity = isMounted ? getItemQuantity(product.id) : 0;

  if (quantity > 0) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => updateQuantity(product.id, quantity - 1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-6 text-center font-bold">{quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 rounded-full"
          onClick={() => updateQuantity(product.id, quantity + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      className="rounded-full"
      onClick={() => addItem(product)}
    >
      <Plus className="mr-2 h-4 w-4" /> Add
    </Button>
  );
}

export function ProductSelector() {
  return (
    <section id="products" className="bg-background py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
            <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Choose Your Kit
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
                All our kits are WHO-approved, ensuring you get reliable results with complete privacy.
            </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card
              key={product.id}
              className="group flex h-full flex-col overflow-hidden rounded-2xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex flex-grow flex-col">
                <CardContent className="flex flex-grow flex-col p-0">
                  <div className="relative aspect-square overflow-hidden bg-muted p-4">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint="medical test kit"
                    />
                  </div>
                  <div className="flex flex-grow flex-col p-6">
                    {product.is_student_bundle && (
                      <Badge
                        variant="secondary"
                        className="mb-2 flex w-fit items-center gap-1.5 bg-green-100 text-green-800"
                      >
                        <GraduationCap className="h-3.5 w-3.5" />
                        Student Pricing
                      </Badge>
                    )}
                    <h3 className="flex-grow text-base font-semibold md:text-lg">{product.name}</h3>
                    <p className="mt-1 h-12 text-sm text-muted-foreground">{product.description}</p>

                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                      <p className="text-lg font-semibold">GHS {product.priceGHS.toFixed(2)}</p>
                      <AddToCartButton product={product} />
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-12 text-center">
            <Button asChild size="lg">
                <Link href="/order">
                    Go to Order Page
                    <ArrowRight />
                </Link>
            </Button>
        </div>
      </div>
    </section>
  );
}
