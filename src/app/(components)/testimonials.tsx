
'use client';

import { testimonials } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const cardColors = [
  'bg-card text-card-foreground',
  'bg-card text-card-foreground border-l-4 border-primary',
  'bg-card text-card-foreground',
];

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f0f0f0" offset="20%" />
      <stop stop-color="#e0e0e0" offset="50%" />
      <stop stop-color="#f0f0f0" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f0f0f0" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);


export function Testimonials() {
  return (
    <section className="bg-background py-12 md:py-24">
      <div className="container mx-auto max-w-6xl px-4 md:px-6">
        <div className="grid gap-12 md:grid-cols-2 md:gap-16 items-center">
            
          <div className="space-y-6 text-center md:text-left">
            <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
              What Our Customers Say
            </h2>
            <p className="max-w-md mx-auto md:mx-0 text-base text-muted-foreground">
              We're proud to provide a service that hundreds of young people and students trust for their confidential health needs. Here's what they have to say.
            </p>
            <Button asChild>
                <Link href="/order">Order Now</Link>
            </Button>
          </div>

          <div className="relative space-y-6">
            {testimonials.map((testimonial, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.15 }}
                    viewport={{ once: true }}
                >
                    <Card
                        className={cn(
                            'p-6 shadow-lg transition-shadow hover:shadow-xl',
                            cardColors[index % cardColors.length],
                        )}
                    >
                        <CardContent className="p-0 space-y-4">
                            <Quote className="h-8 w-8 text-primary/30" />
                            <blockquote className="text-base text-muted-foreground">
                                "{testimonial.quote}"
                            </blockquote>
                            <div className="pt-4 flex items-center gap-4">
                                <Avatar className="border-2 border-primary/10">
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
                </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
