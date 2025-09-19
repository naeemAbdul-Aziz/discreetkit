
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { EmblaCarouselType } from 'embla-carousel';
import { testimonials } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote, Play, Pause } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function Testimonials() {
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
    <section className="py-12 md:py-24">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="text-center">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Real People, Real Stories
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
            We're proud to provide a service that hundreds of young people and students trust for their confidential health needs.
          </p>
        </div>

        <div className="mt-12">
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
                })
            ]}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="basis-full md:basis-1/2 lg:basis-1/3">
                  <div className="p-1 h-full">
                     <Card className="h-full flex flex-col rounded-2xl">
                        <CardContent className="flex-grow flex flex-col p-6 space-y-4">
                            <Quote className="h-8 w-8 text-primary/30" />
                            <blockquote className="flex-grow text-base text-muted-foreground">
                                "{testimonial.quote}"
                            </blockquote>
                            <div className="pt-4 flex items-center gap-4 border-t">
                                <Avatar className="border-2 border-primary/10 h-12 w-12">
                                <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint="person portrait" />
                                <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                <p className="font-semibold text-sm text-foreground">{testimonial.name}</p>
                                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4 sm:-left-6" />
            <CarouselNext className="-right-4 sm:-right-6" />
            
            <div className="flex items-center justify-center gap-4 mt-8">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlay}
                    className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground"
                    aria-label={isPlaying ? 'Pause carousel' : 'Play carousel'}
                >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <div className="flex items-center justify-center gap-2">
                {testimonials.map((_, index) => (
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
      </div>
    </section>
  );
}
