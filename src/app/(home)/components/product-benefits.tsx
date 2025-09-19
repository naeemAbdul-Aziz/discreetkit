/**
 * @file product-benefits.tsx
 * @description a compact component highlighting the key benefits of the products,
 *              using a carousel on mobile and a grid on desktop.
 */

'use client';

import { productBenefits } from '@/lib/data';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

export function ProductBenefits() {
  return (
    <section className="py-6 text-primary-foreground">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* mobile: carousel */}
        <div className="md:hidden">
          <Carousel 
            opts={{ align: 'start', loop: true }}
            plugins={[Autoplay({ delay: 3000, stopOnInteraction: false })]}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {productBenefits.map((benefit) => (
                <CarouselItem key={benefit.title} className="basis-1/2 sm:basis-1/3 pl-2">
                   <div className="flex items-center justify-center gap-2 p-2 text-center h-full">
                    <benefit.icon className="h-5 w-5 flex-shrink-0 text-primary-foreground" />
                    <span className="font-medium text-xs sm:text-sm text-primary-foreground">{benefit.title}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* desktop: grid */}
        <div className="hidden md:grid md:grid-cols-5 gap-x-8 justify-items-center">
          {productBenefits.map((benefit) => (
            <div key={benefit.title} className="flex items-center gap-3 text-left">
              <benefit.icon className="h-6 w-6 flex-shrink-0 text-primary-foreground" />
              <span className="font-medium text-sm text-primary-foreground">{benefit.title}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
