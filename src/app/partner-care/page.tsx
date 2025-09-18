

'use client';

import { marieStopesData } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Phone, MessageSquare, Globe, ShieldCheck, HeartHandshake, UserCheck, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { HowItWorksPartner } from './(components)/how-it-works';

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
      {/* Hero Section */}
      <div className="bg-muted">
        <div className="container mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-24 text-center">
            <div className="flex justify-center mb-8">
                <Image src={marieStopesData.logoUrl} alt={`${marieStopesData.name} Logo`} width={200} height={100} className="object-contain" />
            </div>
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                Your Bridge to Confidential Care
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-base text-muted-foreground md:text-lg">
                We've partnered with Marie Stopes Ghana, a leader in professional and non-judgmental healthcare, to support you on your next step. You are in safe, expert hands.
            </p>
             <div className="mt-8 flex flex-wrap justify-center gap-4">
                {marieStopesData.contact.phone && (
                    <Button asChild size="lg">
                        <a href={`tel:${marieStopesData.contact.phone}`}>
                            <Phone /> Call Their Toll-Free Line
                        </a>
                    </Button>
                )}
                 {marieStopesData.contact.whatsapp && (
                    <Button asChild size="lg" variant="secondary">
                        <a href={`https://wa.me/${marieStopesData.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
                            <MessageSquare /> Chat on WhatsApp
                        </a>
                    </Button>
                )}
                 {marieStopesData.website && (
                    <Button asChild size="lg" variant="outline">
                        <Link href={marieStopesData.website} target="_blank" rel="noopener noreferrer">
                           <Globe /> Visit Their Website
                        </Link>
                    </Button>
                )}
            </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">

            <HowItWorksPartner />
            
            <Separator className="my-16 md:my-24" />

            {/* Services Carousel Section */}
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                     <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                       Services to Support You
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                        Our partnership ensures you have access to the right confidential services when you need them.
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
                            stopOnInteraction: false,
                        })
                    ]}
                    className="w-full"
                    >
                    <CarouselContent>
                        {marieStopesData.services.map((service) => (
                        <CarouselItem key={service.title} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1 h-full">
                               <Card className="relative flex min-h-[380px] w-full flex-col justify-end overflow-hidden rounded-2xl p-6 shadow-lg text-primary-foreground">
                                    <Image
                                        src={service.imageUrl}
                                        alt={service.title}
                                        fill
                                        className="absolute inset-0 h-full w-full object-cover -z-10 brightness-50"
                                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(400, 500))}`}
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        data-ai-hint={service.imageHint}
                                    />
                                    <div className="relative">
                                        <h3 className="text-xl font-bold">{service.title}</h3>
                                        <p className="mt-2 text-sm text-primary-foreground/80">{service.description}</p>
                                        {marieStopesData.website && (
                                             <Button asChild variant="secondary" className="mt-4">
                                                <Link href={marieStopesData.website} target="_blank" rel="noopener noreferrer">
                                                    Learn More
                                                    <ArrowRight />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="-left-4 sm:-left-6 hidden md:flex" />
                    <CarouselNext className="-right-4 sm:-right-6 hidden md:flex" />
                </Carousel>
            </div>

            <Separator className="my-16 md:my-24" />

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto">
                 <div className="text-center mb-12">
                    <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                        Your Questions, Answered
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                        Here's what you need to know before you reach out.
                    </p>
                </div>
                <Accordion type="single" collapsible className="w-full">
                    {marieStopesData.faqs.map((item, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                        <AccordionTrigger className="text-left text-base hover:no-underline">
                        {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground">
                        {item.answer}
                        </AccordionContent>
                    </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
      </div>
    </div>
  );
}
