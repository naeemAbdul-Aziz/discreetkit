
'use client';

import { marieStopesData } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Phone, MessageSquare, Globe, ArrowDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { HowItWorksPartner } from '@/app/partner-care/(components)/how-it-works';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { useState, useEffect, useCallback } from 'react';
import type { EmblaCarouselType } from 'embla-carousel';
import { cn } from '@/lib/utils';

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
    const [api, setApi] = useState<EmblaCarouselType | undefined>();
    const [selectedIndex, setSelectedIndex] = useState(0);

    const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
        setSelectedIndex(emblaApi.selectedScrollSnap());
    }, []);

    useEffect(() => {
        if (!api) {
        return;
        }

        onSelect(api);
        api.on('select', onSelect);
        api.on('reInit', onSelect);

        return () => {
            api.off('select', onSelect);
        };
    }, [api, onSelect]);

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    }

  return (
    <div className="bg-background">
      {/* Hero Section */}
       <section className="relative bg-primary/5 overflow-hidden border-b">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 items-center min-h-[500px] md:min-h-[600px] py-12">
                <div className="relative z-10 text-center md:text-left">
                     <div className="inline-block rounded-full bg-background px-4 py-2 mb-4 border">
                         <Image src={marieStopesData.logoUrl} alt={`${marieStopesData.name} Logo`} width={120} height={40} className="object-contain" />
                    </div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-5xl">
                        Your Bridge to Confidential Care
                    </h1>
                    <p className="mt-4 max-w-lg mx-auto md:mx-0 text-base text-muted-foreground md:text-lg">
                        We've partnered with Marie Stopes Ghana, a leader in professional and non-judgmental healthcare, to support you on your next step. You are in safe, expert hands.
                    </p>
                    <div className="mt-8">
                        <Button size="lg" onClick={() => scrollTo('services')}>
                            Explore Services
                            <ArrowDown />
                        </Button>
                    </div>
                </div>
             <div className="relative h-64 md:h-full w-full md:absolute md:right-0 md:top-0 md:w-1/2">
                 <div className="absolute inset-0 bg-primary z-0 hidden md:block [clip-path:polygon(25%_0,100%_0,100%_100%,0%_100%)]"></div>
                     <Image
                        src="https://images.unsplash.com/photo-1550831107-1553da8c8464?q=80&w=800&fit=crop"
                        alt="A friendly healthcare professional in a clinical setting."
                        fill
                        className="object-cover md:rounded-l-full"
                        data-ai-hint="doctor professional care"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(800, 600))}`}
                    />
                </div>
            </div>
        </div>
      </section>
      
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-7xl">

            <HowItWorksPartner />
            
            <Separator id="services" className="my-16 md:my-24" />
            
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                     <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                       Services to Support You
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                        Our partnership ensures you have access to the right confidential services when you need them.
                    </p>
                </div>
                
                <Carousel
                    setApi={setApi}
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    className="w-full"
                >
                    <CarouselContent>
                        {marieStopesData.services.map((service, index) => (
                        <CarouselItem key={index} className="basis-4/5 sm:basis-1/2 md:basis-1/3">
                            <div className="p-2 h-full">
                                <Card className="flex flex-col h-full w-full overflow-hidden rounded-3xl bg-card">
                                    <div className="relative h-[220px] w-full">
                                        <Image
                                            src={service.imageUrl}
                                            alt={service.title}
                                            fill
                                            className="absolute inset-0 h-full w-full object-cover"
                                            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 0% 100%)' }}
                                            placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(400, 220))}`}
                                            sizes="(max-width: 768px) 80vw, 30vw"
                                            data-ai-hint={service.imageHint}
                                        />
                                    </div>
                                    <CardContent className="flex flex-col justify-between flex-1 p-6 text-center">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground">{service.title}</h3>
                                        <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{service.description}</p>
                                    </div>
                                    {marieStopesData.website && (
                                            <Button asChild variant="secondary" size="sm" className="mt-4 w-fit mx-auto">
                                                <Link href={marieStopesData.website} target="_blank" rel="noopener noreferrer">
                                                    Learn More
                                                </Link>
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                           </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
                <div className="flex items-center justify-center gap-2 mt-8">
                    {marieStopesData.services.map((_, index) => (
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

            <Separator className="my-16 md:my-24" />

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
            
            <Separator className="my-16 md:my-24" />

             <div id="contact" className="max-w-4xl mx-auto text-center bg-muted p-8 md:p-12 rounded-3xl">
                 <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    Ready to Take the Next Step?
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
                    Contact Marie Stopes directly. Their team is ready to assist you with full confidentiality and care.
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
                            <a href={`https://wa.me/233${marieStopesData.contact.whatsapp.substring(1)}`} target="_blank" rel="noopener noreferrer">
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
      </div>
    </div>
  );
}
