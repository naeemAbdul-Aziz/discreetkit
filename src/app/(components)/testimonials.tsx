
'use client';

import { testimonials } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

export function Testimonials() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

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

        {/* Desktop Grid */}
        <motion.div
          className="hidden md:grid md:grid-cols-3 gap-8 mt-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
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
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile Carousel */}
        <div className="md:hidden mt-12">
          <Carousel
            opts={{ align: 'start', loop: true }}
            plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
            className="w-full"
          >
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="basis-full">
                  <div className="p-1">
                     <Card className="h-full flex flex-col shadow-sm">
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
          </Carousel>
        </div>
      </div>
    </section>
  );
}
