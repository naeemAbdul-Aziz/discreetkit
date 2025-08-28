
'use client';

import { steps } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowRight } from 'lucide-react';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted py-12 md:py-24">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="mt-2 font-headline text-2xl font-bold text-foreground md:text-3xl">
            A Responsible Path to Your Health Answers
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
            Get your results in 4 simple, private, and secure steps.
          </p>
        </div>

        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          plugins={[
              Autoplay({
                delay: 4000,
                stopOnInteraction: true,
              }),
          ]}
          className="w-full"
        >
          <CarouselContent>
            {steps.map((step) => (
              <CarouselItem key={step.number} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1 h-full">
                  <Card className="h-full flex flex-col p-6 shadow-lg">
                    <CardContent className="p-0 flex flex-col flex-grow">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                              <step.icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                          </div>
                           <span className="text-3xl font-bold text-primary/20">{step.number}</span>
                        </div>
                      <h3 className="text-xl font-bold">{step.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground flex-grow">{step.description}</p>
                      <div className="mt-6 border-t pt-4">
                        <ul className="space-y-2">
                          {step.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                              <span className="text-xs text-muted-foreground">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
           <div className="mt-4 flex justify-center gap-4">
              <CarouselPrevious />
              <CarouselNext />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
