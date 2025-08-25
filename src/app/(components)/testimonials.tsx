
'use client';

import { Star } from 'lucide-react';
import { testimonials } from '@/lib/data';
import { cn } from '@/lib/utils';

export function Testimonials() {
  const cardColors = [
    'bg-primary text-primary-foreground',
    'bg-accent text-accent-foreground',
    'bg-foreground text-background',
    'bg-secondary text-secondary-foreground',
  ];

  const rotations = [
    'rotate-3',
    '-rotate-2',
    'rotate-1',
    '-rotate-3',
    'rotate-2',
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

        <div className="relative mt-16 flex h-[450px] flex-wrap justify-center gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={cn(
                'absolute w-72 rounded-xl p-6 shadow-lg transition-transform hover:scale-105',
                cardColors[index % cardColors.length],
                rotations[index % rotations.length]
              )}
              style={{
                top: `${20 + (index * 25)}%`,
                left: `${15 + (index * 18)}%`,
                transform: `rotate(${rotations[index % rotations.length].replace('rotate-', '')}deg) translate(${index * 5}px, ${index * 10}px)`,
              }}
            >
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
          ))}
        </div>
      </div>
    </section>
  );
}
