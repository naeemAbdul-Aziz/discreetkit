
'use client';

import Image from 'next/image';
import { partners } from '@/lib/data';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export function PartnerLogos() {
  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="mb-2 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Trusted by leading health partners and student bodies
        </h2>
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {partners.map((partner) => (
              <CarouselItem key={partner.id} className="basis-1/2 md:basis-1/3 lg:basis-1/5">
                <div className="p-4">
                  <Image
                    src={partner.logoUrl}
                    alt={`${partner.name} Logo`}
                    width={150}
                    height={50}
                    className="mx-auto aspect-[3/1] object-contain grayscale transition-all hover:grayscale-0"
                    data-ai-hint="logo health"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
}
