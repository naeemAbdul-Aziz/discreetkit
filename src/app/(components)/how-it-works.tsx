
'use client';

import { steps } from '@/lib/data';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="font-semibold text-primary uppercase">How It Works</p>
          <h2 className="mt-2 font-headline text-3xl font-bold text-foreground sm:text-4xl">
            Confidential Testing, Simplified.
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Just three easy steps to get your private health answers.
          </p>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden">
          <Carousel
            opts={{ align: 'start', loop: true }}
            plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
            className="w-full"
          >
            <CarouselContent>
              {steps.map((step) => (
                <CarouselItem key={step.number}>
                  <Card className="overflow-hidden">
                    <CardHeader className="p-0">
                      <Image
                        src={step.image}
                        alt={step.title}
                        width={500}
                        height={300}
                        className="w-full h-48 object-cover"
                        data-ai-hint={step.dataAiHint}
                      />
                    </CardHeader>
                    <CardContent className="p-6 text-left">
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-xl font-bold text-primary">
                                {step.number}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">{step.title}</h3>
                                <p className="mt-1 text-muted-foreground">{step.description}</p>
                            </div>
                        </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <Card key={step.number} className="overflow-hidden flex flex-col">
              <CardHeader className="p-0">
                <Image
                  src={step.image}
                  alt={step.title}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                  data-ai-hint={step.dataAiHint}
                />
              </CardHeader>
              <CardContent className="p-6 text-left flex-grow flex flex-col">
                 <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-xl font-bold text-primary">
                        {step.number}
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                        <p className="mt-1 text-muted-foreground">{step.description}</p>
                    </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
