

import { marieStopesData } from '@/lib/data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Phone, Globe, Lock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const WhatsAppIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current">
        <title>WhatsApp</title>
        <path d="M12.04 2.016c-5.52 0-9.985 4.464-9.985 9.984 0 1.74.444 3.37 1.252 4.794l-1.39 5.022 5.134-1.355a9.949 9.949 0 0 0 4.99 1.27h.002c5.52 0 9.985-4.465 9.985-9.985 0-5.52-4.465-9.985-9.986-9.985zm0 18.355a8.31 8.31 0 0 1-4.223-1.183l-.302-.18-3.145.825.84-3.05-.2-.315a8.28 8.28 0 0 1-1.28-4.448c0-4.594 3.72-8.314 8.314-8.314s8.313 3.72 8.313 8.314-3.72 8.313-8.313 8.313zM17.134 14.162c-.22-.11-.924-.457-1.067-.508s-.248-.078-.352.078-.403.508-.494.615-.182.116-.337.039-1.26-.465-2.4-1.475-1.13-1.838-1.033-2.03.09-.16.196-.26s.22-.26.33-.435.056-.22.028-.41s-.352-.84-.482-1.15-.26-.28-.38-.28-.27-.005-.41-.005-.352-.023-.54.255-.712.69-.712 1.69c0 1.03.73 1.956.83 2.09.1.134 1.41 2.15 3.42 3.018.47.206.84.33 1.12.42.5.15 1.05.13 1.45.08.45-.06.92-.37 1.05-.72s.13-.64.09-.72c-.04-.08-.15-.13-.33-.24z" />
    </svg>
)

export default function PartnerCarePage() {

  return (
    <div className="bg-muted">
      <div className="container mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-24">
        
        {/* Header Section */}
        <div className="text-center">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Your Bridge to Confidential Care
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground">
                For comprehensive, non-judgmental follow-up care, we are proud to partner with Marie Stopes Ghana—a leader in sexual and reproductive health.
            </p>
             <div className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-background px-4 py-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4 text-success" />
                <span>Your privacy and comfort are our priorities.</span>
            </div>
        </div>

        {/* Introduction to Marie Stopes */}
        <div className="mt-16 grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
            <div className="relative flex h-48 w-full items-center justify-center rounded-2xl bg-white p-6 shadow-md md:h-64">
                <Image
                    src={marieStopesData.logo_url}
                    alt={`${marieStopesData.name} Logo`}
                    width={220}
                    height={90}
                    className="object-contain"
                    data-ai-hint="logo"
                />
                
            </div>
            <div className="flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-foreground">{marieStopesData.name}</h2>
                <p className="mt-1 text-base font-medium text-primary">{marieStopesData.locations.join(' | ')}</p>
                <p className="mt-4 text-base text-foreground">{marieStopesData.description}</p>
                 <div className="mt-6 flex flex-wrap gap-2">
                    {marieStopesData.contact?.phone && (
                        <Button asChild size="sm">
                            <a href={`tel:${marieStopesData.contact.phone}`}>
                                <Phone />
                                Call Now
                            </a>
                        </Button>
                    )}
                    {marieStopesData.contact?.whatsapp && (
                        <Button asChild size="sm" variant="accent" className="bg-green-500 hover:bg-green-600 text-white">
                            <a href={`https://wa.me/233${marieStopesData.contact.whatsapp.slice(1)}`} target="_blank" rel="noopener noreferrer">
                                <WhatsAppIcon />
                                WhatsApp
                            </a>
                        </Button>
                    )}
                    {marieStopesData.contact?.website && (
                        <Button asChild size="sm" variant="outline">
                            <a href={marieStopesData.contact.website} target="_blank" rel="noopener noreferrer">
                                <Globe />
                                Website
                            </a>
                        </Button>
                    )}
                </div>
            </div>
        </div>

        {/* Detailed Services Section */}
        <div className="mt-24">
            <div className="text-center">
                <h3 className="text-2xl font-bold text-foreground">Services We Recommend</h3>
                <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">Marie Stopes offers a safe, confidential environment for these key services. Mention DiscreetKit for a supportive experience.</p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {marieStopesData.services.map(service => (
                    <Card key={service.title} className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                                    <CheckCircle className="h-6 w-6 text-primary" />
                                </div>
                                <span className="text-lg">{service.title}</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-sm text-muted-foreground">{service.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>


        {/* Partner FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
            <div className="text-center">
                <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    Your Questions, Answered
                </h2>
                <p className="mt-4 text-base text-muted-foreground">
                    Important things to know before you visit a Marie Stopes centre.
                </p>
            </div>
             <div className="mt-8">
                <Accordion type="single" collapsible className="w-full">
                    {marieStopesData.faq.map((item, index) => (
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
