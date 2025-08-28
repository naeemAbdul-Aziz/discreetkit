
'use client';

import { steps } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowRight } from 'lucide-react';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
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
                delay: 5000,
                stopOnInteraction: true,
              }),
          ]}
          className="w-full max-w-4xl mx-auto"
        >
          <CarouselContent>
            {steps.map((step) => (
              <CarouselItem key={step.number}>
                <div className="p-1">
                  <Card className="overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        <div className="p-8 md:p-10 flex flex-col justify-center">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                                    <step.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold">{step.number}. {step.title}</h3>
                            </div>
                            <p className="text-sm md:text-base text-muted-foreground mb-6">{step.description}</p>
                            
                            <div>
                                <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3">Key Actions:</h4>
                                <ul className="space-y-2">
                                  {step.details.map((detail, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                      <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                                      <span className="text-sm text-foreground">{detail}</span>
                                    </li>
                                  ))}
                                </ul>
                            </div>
                        </div>
                        <div className="bg-background flex items-center justify-center p-8 min-h-[250px] md:min-h-0">
                            <step.icon className="h-24 w-24 text-primary/80" strokeWidth={1.5} />
                        </div>
                    </div>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-[-50px] hidden md:inline-flex" />
          <CarouselNext className="right-[-50px] hidden md:inline-flex" />
        </Carousel>
      </div>
    </section>
  );
}
