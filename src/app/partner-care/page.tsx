

'use client';

import { marieStopesData } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Phone, MessageSquare, Globe, ShieldCheck, HeartHandshake, UserCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
  const trustPoints = [
    { icon: ShieldCheck, title: "100% Confidential", description: "Your privacy is their top priority. All services are delivered in a completely confidential environment." },
    { icon: UserCheck, title: "Expert & Friendly Staff", description: "Their team consists of highly-trained, non-judgmental healthcare professionals." },
    { icon: HeartHandshake, title: "Supportive Environment", description: "They provide a safe, welcoming space for you to ask questions and get the care you need." }
  ];

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

            {/* Services Carousel Section */}
            <div className="text-center mb-12">
                <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    Recommended Next Steps & Services
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                    Based on your results, here are the key services they offer to give you clarity and peace of mind.
                </p>
            </div>
            <Carousel
                opts={{ align: "start", loop: true }}
                plugins={[ Autoplay({ delay: 5000, stopOnInteraction: true }) ]}
                className="w-full"
            >
                <CarouselContent>
                {marieStopesData.services.map((service, index) => (
                    <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-2 h-full">
                        <Card className="h-full flex flex-col rounded-2xl shadow-sm transition-shadow duration-300 hover:shadow-lg overflow-hidden">
                            <div className="relative aspect-video w-full bg-muted/50 overflow-hidden">
                                <Image
                                    src={service.imageUrl}
                                    alt={service.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 90vw, 30vw"
                                    data-ai-hint={service.imageHint}
                                    placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(800, 450))}`}
                                />
                            </div>
                            <CardContent className="flex flex-grow flex-col justify-between p-6">
                                <div className="flex-grow">
                                    <h3 className="text-lg font-bold text-foreground">{service.title}</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">{service.description}</p>
                                </div>
                                <div className="mt-6">
                                    {marieStopesData.website && (
                                        <Button asChild className="w-full" variant="outline">
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
            
            <Separator className="my-16 md:my-24" />

            {/* Why We Trust Them Section */}
             <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                     <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                       Why We Trust Marie Stopes
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                        Our partnership is built on a shared commitment to your well-being and privacy.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    {trustPoints.map((point) => (
                        <div key={point.title} className="flex flex-col items-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                                <point.icon className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold text-foreground">{point.title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">{point.description}</p>
                        </div>
                    ))}
                </div>
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
