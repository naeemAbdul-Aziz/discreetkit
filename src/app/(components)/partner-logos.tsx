
'use client';

import Image from 'next/image';
import { partners } from '@/lib/data';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

export function PartnerLogos() {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Trusted by leading health partners and student bodies
        </h2>
        
        {/* Mobile: Carousel */}
        <div className="md:hidden">
          <Carousel 
            opts={{ align: 'start', loop: true }}
            plugins={[Autoplay({ delay: 2500, stopOnInteraction: false })]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {partners.map((partner) => (
                <CarouselItem key={partner.id} className="basis-1/2 sm:basis-1/3 pl-4">
                   <div className="flex items-center justify-center p-2 h-full">
                      <Image
                        src={partner.logoUrl}
                        alt={`${partner.name} Logo`}
                        width={130}
                        height={40}
                        className="aspect-[3/1] object-contain grayscale"
                        data-ai-hint="logo health"
                      />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {partners.map((partner) => (
                <div key={partner.id} className="p-2">
                    <Image
                    src={partner.logoUrl}
                    alt={`${partner.name} Logo`}
                    width={130}
                    height={40}
                    className="aspect-[3/1] object-contain grayscale transition-all hover:grayscale-0"
                    data-ai-hint="logo health"
                    />
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
