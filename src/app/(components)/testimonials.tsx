
'use client';

import { testimonials } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

export function Testimonials() {
  return (
    <section className="bg-background py-12 md:py-24">
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
            opts={{
              align: 'start',
              loop: true,
            }}
            plugins={[
                Autoplay({
                    delay: 5000,
                    stopOnInteraction: true,
                })
            ]}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="basis-full md:basis-1/2 lg:basis-1/3">
                  <div className="p-1 h-full">
                     <Card className="h-full flex flex-col shadow-sm hover:shadow-md transition-shadow duration-300">
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
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>
      </div>
    </section>
  );
}
