
'use client';

import { Star } from 'lucide-react';
import { testimonials } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export function Testimonials() {
  const cardColors = [
    'bg-primary text-primary-foreground',
    'bg-accent text-accent-foreground',
    'bg-foreground text-background',
  ];

  return (
    <section className="bg-background py-20 md:py-32">
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        <div className="text-center">
          <p className="font-semibold text-primary">Reviews</p>
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by People Like You
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We're proud to provide a service that people trust.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-4 lg:gap-8">
            {testimonials.map((testimonial, index) => (
                <Card 
                    key={index}
                    className={cn(
                        'transform transition-transform duration-300 hover:scale-105 hover:z-10',
                        cardColors[index % cardColors.length],
                        index === 0 ? 'md:rotate-[-3deg]' : '',
                        index === 1 ? 'md:translate-y-8' : '',
                        index === 2 ? 'md:rotate-[3deg]' : '',
                    )}
                >
                    <div className="p-6">
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-current" />
                            ))}
                        </div>
                        <blockquote className="mt-4 text-base">
                            "{testimonial.quote}"
                        </blockquote>
                        <div className="mt-4">
                            <p className="font-semibold">{testimonial.name}</p>
                            <p className="text-sm opacity-80">{testimonial.role}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
      </div>
    </section>
  );
}
