
'use client';

import { products, type Product } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Check, Minus, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { GraduationCap } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';

function AddToCartButton({ product }: { product: Product }) {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const quantity = getItemQuantity(product.id);

  if (!isMounted) {
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
        <div className="text-center mb-12">
            <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Choose Your Kit
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                All our kits are WHO-approved, ensuring you get reliable results with complete privacy.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {products.map((product) => (
            <Card
              key={product.id}
              className="h-full flex flex-col overflow-hidden rounded-2xl shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
            >
              <div className="flex-grow flex flex-col">
                <CardContent className="p-0 flex-grow flex flex-col">
                  <div className="relative bg-muted p-4 overflow-hidden aspect-square">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-contain mx-auto transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint="medical test kit"
                    />
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    {product.is_student_bundle && (
                      <Badge
                        variant="secondary"
                        className="w-fit flex items-center gap-1.5 mb-2 bg-green-100 text-green-800"
                      >
                        <GraduationCap className="h-3.5 w-3.5" />
                        Student Pricing
                      </Badge>
                    )}
                    <h3 className="text-base md:text-lg font-semibold flex-grow">{product.name}</h3>
                    <p className="text-muted-foreground text-sm mt-1 h-12">{product.description}</p>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t">
                      <p className="font-semibold text-lg">GHS {product.priceGHS.toFixed(2)}</p>
                      <AddToCartButton product={product} />
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
