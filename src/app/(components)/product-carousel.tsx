
'use client';

import { products } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { ArrowRight, Star, GraduationCap, ShoppingCart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export function ProductCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const updateCarousel = useCallback((api: CarouselApi) => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;
    updateCarousel(api);
    api.on('select', updateCarousel);
    api.on('reInit', updateCarousel);
    return () => {
      api.off('select', updateCarousel);
      api.off('reInit', updateCarousel);
    };
  }, [api, updateCarousel]);


  return (
    <section className="bg-background py-12 md:py-24">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

          {/* Left Introductory Card */}
          <div className="lg:col-span-1 flex">
            <Card className="bg-primary/10 border-0 flex flex-col justify-between p-8 rounded-2xl w-full">
                <div>
                    <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Browse All Kits
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        We've built every part of our service with your <strong>privacy, convenience, and well-being</strong> in mind.
                    </p>
                </div>
                <Button asChild variant="link" className="mt-6 text-primary font-bold text-lg p-0 justify-start">
                    <Link href="/order">
                        Browse All Kits
                        <ArrowRight />
                    </Link>
                </Button>
            </Card>
          </div>

          {/* Right Product Carousel */}
          <div className="lg:col-span-2">
            <Carousel 
              setApi={setApi}
              opts={{ align: 'start', loop: true }} 
              className="w-full product-carousel-container"
            >
              <CarouselContent className="-ml-4 md:-ml-4">
                {products.map((product, index) => (
                  <CarouselItem 
                    key={product.id} 
                    className={cn(
                      "md:basis-1/2 basis-full pl-4 transition-transform-opacity",
                      "product-carousel-item"
                    )}
                  >
                      <Card className="h-full flex flex-col overflow-hidden rounded-2xl shadow-xl">
                         <div className="flex-grow flex flex-col">
                            <CardContent className="p-0 flex-grow flex flex-col">
                                <div className="relative bg-muted p-4 overflow-hidden">
                                    {product.is_student_bundle && (
                                        <Badge className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                                            <GraduationCap className="h-3.5 w-3.5" />
                                            Student Bundle
                                        </Badge>
                                    )}
                                    <Image
                                        src={product.imageUrl}
                                        alt={product.name}
                                        width={400}
                                        height={300}
                                        className="aspect-video object-contain mx-auto transition-transform duration-300 group-hover:scale-105"
                                        data-ai-hint="medical test kit"
                                    />
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h3 className="text-xl font-semibold flex-grow">{product.name}</h3>
                                    <p className="text-muted-foreground text-sm mt-1">{product.description}</p>
                                    
                                    <div className="flex justify-between items-end mt-4 pt-4 border-t">
                                        <p className="font-semibold text-lg">GHS {product.priceGHS.toFixed(2)}</p>
                                        <Button asChild>
                                            <Link href={`/order?product=${product.id}`}>
                                                <ShoppingCart />
                                                Order Now
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                         </div>
                      </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex" />
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
}
