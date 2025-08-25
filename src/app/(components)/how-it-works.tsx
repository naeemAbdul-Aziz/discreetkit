
'use client';

import { useRef } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { howItWorksSteps } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export function HowItWorks() {
  const plugin = useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  return (
    <section className="bg-muted py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works: A Simple 4-Step Process
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            We've made getting a self-test kit straightforward and completely private. Follow these simple steps to take control of your health.
          </p>
        </div>

        <div className="mt-12">
          <Carousel
            plugins={[plugin.current]}
            className="w-full max-w-4xl mx-auto"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent>
              {howItWorksSteps.map((step, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1 h-full">
                    <Card className="h-full">
                      <CardContent className="flex flex-col items-center justify-center text-center p-6 gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary font-bold text-2xl z-10 flex-shrink-0">
                          {step.step}
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">{step.title}</h3>
                        <p className="text-muted-foreground">{step.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
