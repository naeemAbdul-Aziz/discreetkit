
'use client';

import { steps } from '@/lib/data';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useState } from 'react';
import type { EmblaCarouselType } from 'embla-carousel-react';
import { Pause, Play } from 'lucide-react';


export function HowItWorks() {
  const [emblaApi, setEmblaApi] = useState<EmblaCarouselType | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = useCallback(() => {
    if (!emblaApi) return;
    const autoplay = emblaApi.plugins().autoplay;
    if (!autoplay) return;

    if (autoplay.isPlaying()) {
      autoplay.stop();
    } else {
      autoplay.play();
    }
    setIsPlaying(!isPlaying);
  }, [emblaApi, isPlaying]);


  useEffect(() => {
    if (!emblaApi) return;
    const autoplay = emblaApi.plugins().autoplay;
    if (!autoplay) return;

    setIsPlaying(autoplay.isPlaying());
    emblaApi.on('autoplay:play', () => setIsPlaying(true));
    emblaApi.on('autoplay:stop', () => setIsPlaying(false));
    emblaApi.on('reInit', () => setIsPlaying(autoplay.isPlaying()));

  }, [emblaApi]);


  return (
    <section id="how-it-works" className="bg-muted py-12 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="font-semibold text-primary uppercase">How It Works</p>
          <h2 className="mt-2 font-headline text-3xl font-bold text-foreground sm:text-4xl">
            Confidential Testing, Simplified.
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            A responsible and private path to your health answers.
          </p>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative">
          <Carousel
            setApi={setEmblaApi}
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
            <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
            <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
          </Carousel>
           <div className="absolute inset-0 flex items-center justify-center">
              <Button variant="outline" size="icon" onClick={togglePlay} className="h-14 w-14 rounded-full bg-white/30 backdrop-blur-sm border-white/50 hover:bg-white/50">
                {isPlaying ? <Pause className="h-6 w-6 text-white" /> : <Play className="h-6 w-6 text-white" />}
                <span className="sr-only">{isPlaying ? 'Pause carousel' : 'Play carousel'}</span>
              </Button>
            </div>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
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
