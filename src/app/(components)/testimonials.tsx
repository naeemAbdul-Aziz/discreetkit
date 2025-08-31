
'use client';

import { Star } from 'lucide-react';
import { testimonials } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Testimonials() {
  const cardColors = [
    'bg-primary text-primary-foreground',
    'bg-accent text-accent-foreground',
    'bg-card text-card-foreground border-2 border-primary',
  ];

  return (
    <section className="bg-background py-20 md:py-32">
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        <div className="text-center">
          <p className="font-semibold text-primary">Reviews</p>
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Trusted by People Like You
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            We're proud to provide a service that people trust.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-4 lg:gap-8">
            {testimonials.map((testimonial, index) => (
                <Card 
                    key={index}
                    className={cn(
                        'transform transition-transform duration-300 hover:z-10 md:hover:scale-105 flex flex-col shadow-lg',
                        cardColors[index % cardColors.length],
                        index === 0 ? 'md:rotate-[-3deg]' : '',
                        index === 1 ? 'md:translate-y-8' : '',
                        index === 2 ? 'md:rotate-[3deg]' : '',
                    )}
                >
                    <div className="p-6 flex-grow">
                        <div className="flex items-center gap-1 text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-5 w-5 fill-current" />
                            ))}
                        </div>
                        <blockquote className="mt-4 text-sm flex-grow">
                            "{testimonial.quote}"
                        </blockquote>
                    </div>
                     <div className="p-6 pt-0 mt-4 flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={testimonial.avatar} alt={testimonial.name} data-ai-hint="person portrait" />
                                <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold text-sm">{testimonial.name}</p>
                                <p className="text-xs opacity-80">{testimonial.role}</p>
                            </div>
                        </div>
                </Card>
            ))}
        </div>
      </div>
    </section>
  );
}
