

'use client';

import { marieStopesData } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

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


export default function PartnerCarePage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                    Your Bridge to Confidential Care
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                    For your next step, we partner with Marie Stopes Ghana, a leader in professional, non-judgmental sexual and reproductive healthcare.
                </p>
            </div>

            <Carousel
                opts={{
                    align: "start",
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
                {marieStopesData.services.map((service, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-2 h-full">
                        <Card className="h-full flex flex-col rounded-2xl shadow-sm transition-shadow duration-300 hover:shadow-lg overflow-hidden">
                            <div className="relative aspect-[4/3] w-full bg-muted/50 overflow-hidden">
                                <Image
                                    src={service.imageUrl}
                                    alt={service.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 90vw, 30vw"
                                    data-ai-hint={service.imageHint}
                                    placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(800, 600))}`}
                                />
                            </div>
                            <CardContent className="flex flex-grow flex-col justify-between p-6">
                                <div className="flex-grow">
                                    <h3 className="text-lg font-bold text-foreground">{service.title}</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
                                </div>
                                <div className="mt-6">
                                    {marieStopesData.website && (
                                        <Button asChild className="w-full">
                                            <Link href={marieStopesData.website} target="_blank" rel="noopener noreferrer">
                                                Learn More
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
            </Carousel>
        </div>
      </div>
    </div>
  );
}
