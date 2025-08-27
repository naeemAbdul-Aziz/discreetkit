
'use client';

import { steps } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import { useCallback, useEffect, useState } from 'react';
import type { EmblaCarouselType } from 'embla-carousel-react';
import { ArrowRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';


export function HowItWorks() {
  const [emblaApi, setEmblaApi] = useState<EmblaCarouselType | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const togglePlay = useCallback(() => {
    if (!emblaApi) return;
    const autoplay = emblaApi.plugins().autoplay;
    if (!autoplay) return;

    if (autoplay.isPlaying()) {
      autoplay.stop();
    } else {
      autoplay.play();
    }
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    
    const autoplay = emblaApi.plugins().autoplay;
    if (!autoplay) return;

    setIsPlaying(autoplay.isPlaying());
    emblaApi.on('autoplay:play', () => setIsPlaying(true));
    emblaApi.on('autoplay:stop', () => setIsPlaying(false));
    emblaApi.on('reInit', () => {
        setIsPlaying(autoplay.isPlaying());
        onSelect(emblaApi);
    });
    emblaApi.on('select', onSelect);
    onSelect(emblaApi);

  }, [emblaApi, onSelect]);


  return (
    <section id="how-it-works" className="bg-muted py-12 md:py-24">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-center mb-12">
          <h2 className="mt-2 font-headline text-2xl font-bold text-foreground md:text-3xl">
            How DiscreetKit Works
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
            A responsible and private path to your health answers in 4 simple steps.
          </p>
        </div>

        <div className="relative">
          <Carousel
            setApi={setEmblaApi}
            opts={{ align: 'start', loop: true }}
            plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {steps.map((step) => (
                <CarouselItem key={step.number} className="pl-4">
                    <Card className="overflow-hidden bg-background p-4 md:p-8 h-full shadow-lg">
                        <CardContent className="p-0 flex flex-col h-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center flex-grow">
                                <div className="flex flex-col space-y-4 text-left h-full justify-between">
                                    <div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-2xl font-bold text-primary">
                                                {step.number}
                                            </div>
                                            <h3 className="text-lg md:text-xl font-semibold">{step.title}</h3>
                                        </div>
                                        <p className="text-muted-foreground text-sm mt-4">{step.description}</p>
                                    </div>
                                    <div className="border-t pt-4 mt-4">
                                        <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">Key Details</h4>
                                        <ul className="space-y-2">
                                            {step.details.map((detail, i) => (
                                                <li key={i} className="flex items-start gap-3">
                                                    <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                                    <span className="text-sm text-muted-foreground">{detail}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center justify-center bg-muted/50 rounded-xl h-64">
                                  <step.icon className="h-32 w-32 text-primary/70" strokeWidth={1.5} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
            <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
          </Carousel>
           <div className="flex items-center justify-center gap-4 mt-8">
              <Button variant="ghost" size="icon" onClick={togglePlay} className="h-10 w-10 rounded-full bg-background/50 backdrop-blur-sm border-border hover:bg-background/80">
                {isPlaying ? <Pause className="h-5 w-5 text-foreground" /> : <Play className="h-5 w-5 text-foreground" />}
                <span className="sr-only">{isPlaying ? 'Pause carousel' : 'Play carousel'}</span>
              </Button>
              <div className="flex items-center gap-2">
                  {steps.map((_, index) => (
                      <button 
                        key={index}
                        onClick={() => emblaApi?.scrollTo(index)}
                        className={cn(
                            "h-2 w-2 rounded-full transition-all duration-300",
                            selectedIndex === index ? "w-6 bg-primary" : "bg-primary/20"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                  ))}
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}
