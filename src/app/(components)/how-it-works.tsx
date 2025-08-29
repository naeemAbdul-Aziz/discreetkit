
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { EmblaCarouselType } from 'embla-carousel';
import { steps } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function HowItWorks() {
  const [api, setApi] = useState<EmblaCarouselType | undefined>();
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const togglePlay = useCallback(() => {
    const autoplay = api?.plugins()?.autoplay;
    if (!autoplay) return;

    if (autoplay.isPlaying()) {
      autoplay.stop();
    } else {
      autoplay.play();
    }
    setIsPlaying((prev) => !prev);
  }, [api]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;

    onSelect(api);
    api.on('select', onSelect);
    api.on('reInit', onSelect);
    api.on('autoplay:play', () => setIsPlaying(true));
    api.on('autoplay:stop', () => setIsPlaying(false));

    return () => {
      api.off('select', onSelect);
    };
  }, [api, onSelect]);

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
          setApi={setApi}
          opts={{
            align: 'start',
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
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
                          <h3 className="text-xl md:text-2xl font-bold">
                            {step.number}. {step.title}
                          </h3>
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
                      <div className="relative bg-background flex items-center justify-center p-8 min-h-[300px] md:min-h-0">
                        <Image
                            src={step.imageUrl}
                            alt={step.title}
                            fill
                            className="object-cover"
                            data-ai-hint={step.imageHint}
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="-left-4 sm:left-[-50px]" />
          <CarouselNext className="-right-4 sm:right-[-50px]" />
          
           <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
            </Button>
            <div className="flex items-center justify-center gap-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => api?.scrollTo(index)}
                  className={cn(
                    'h-2 w-2 rounded-full bg-border transition-all',
                    index === selectedIndex ? 'w-4 bg-primary' : 'hover:bg-primary/50'
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

        </Carousel>
      </div>
    </section>
  );
}
