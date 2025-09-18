

import { marieStopesData } from '@/lib/data';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Phone, Globe, Lock } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const WhatsAppIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current">
        <title>WhatsApp</title>
        <path d="M12.04 2.016c-5.52 0-9.985 4.464-9.985 9.984 0 1.74.444 3.37 1.252 4.794l-1.39 5.022 5.134-1.355a9.949 9.949 0 0 0 4.99 1.27h.002c5.52 0 9.985-4.465 9.985-9.985 0-5.52-4.465-9.985-9.986-9.985zm0 18.355a8.31 8.31 0 0 1-4.223-1.183l-.302-.18-3.145.825.84-3.05-.2-.315a8.28 8.28 0 0 1-1.28-4.448c0-4.594 3.72-8.314 8.314-8.314s8.313 3.72 8.313 8.314-3.72 8.313-8.313 8.313zM17.134 14.162c-.22-.11-.924-.457-1.067-.508s-.248-.078-.352.078-.403.508-.494.615-.182.116-.337.039-1.26-.465-2.4-1.475-1.13-1.838-1.033-2.03.09-.16.196-.26s.22-.26.33-.435.056-.22.028-.41s-.352-.84-.482-1.15-.26-.28-.38-.28-.27-.005-.41-.005-.352-.023-.54.255-.712.69-.712 1.69c0 1.03.73 1.956.83 2.09.1.134 1.41 2.15 3.42 3.018.47.206.84.33 1.12.42.5.15 1.05.13 1.45.08.45-.06.92-.37 1.05-.72s.13-.64.09-.72c-.04-.08-.15-.13-.33-.24z" />
    </svg>
)

export default function PartnerCarePage() {

  return (
    <div className="bg-muted">
      <div className="container mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-24">
        
        {/* Header Section */}
        <div className="text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
                Our Trusted Partner: Marie Stopes Ghana
            </p>
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
                Exceptional Care, Always Confidential
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground">
                For comprehensive, non-judgmental follow-up care, we are proud to partner with Marie Stopes Ghana—a leader in sexual and reproductive health. The choice to reach out is always yours.
            </p>
             <div className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-background px-4 py-2 text-sm text-muted-foreground shadow-sm">
                <Lock className="h-4 w-4 text-success" />
                <span>Your privacy is our highest priority.</span>
            </div>
        </div>

        {/* Services Grid */}
        <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {marieStopesData.services.map((service, index) => (
                <div key={service.title} className="flex flex-col text-left">
                     <div className="flex items-center gap-4 mb-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">{index + 1}</div>
                        <h3 className="text-xl font-bold text-foreground">{service.title}</h3>
                     </div>
                     <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg mb-4">
                        <Image
                            src={service.imageUrl}
                            alt={service.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover"
                            data-ai-hint={service.imageHint}
                        />
                     </div>
                    <p className="text-base text-muted-foreground flex-grow">{service.description}</p>
                </div>
            ))}
        </div>

        {/* Contact and FAQ Section */}
        <div className="mt-24 grid grid-cols-1 gap-12 rounded-2xl bg-card p-8 shadow-lg md:grid-cols-5 md:p-12">
            <div className="md:col-span-2">
                 <div className="sticky top-28">
                    <h2 className="text-2xl font-bold text-foreground">Connect with Marie Stopes</h2>
                    <p className="mt-2 text-muted-foreground">They are ready to help you with the next step. Mention DiscreetKit for a supportive experience.</p>
                    <div className="mt-6 flex flex-col gap-3">
                        {marieStopesData.contact?.phone && (
                            <Button asChild size="lg">
                                <a href={`tel:${marieStopesData.contact.phone}`}>
                                    <Phone />
                                    Call Now
                                </a>
                            </Button>
                        )}
                        {marieStopesData.contact?.whatsapp && (
                            <Button asChild size="lg" variant="accent" className="bg-green-500 hover:bg-green-600 text-white">
                                <a href={`https://wa.me/233${marieStopesData.contact.whatsapp.slice(1)}`} target="_blank" rel="noopener noreferrer">
                                    <WhatsAppIcon />
                                    WhatsApp
                                </a>
                            </Button>
                        )}
                        {marieStopesData.contact?.website && (
                            <Button asChild size="lg" variant="outline">
                                <a href={marieStopesData.contact.website} target="_blank" rel="noopener noreferrer">
                                    <Globe />
                                    Visit Website
                                </a>
                            </Button>
                        )}
                    </div>
                     <div className="mt-6 text-sm text-muted-foreground">
                        <p className="font-semibold">Locations:</p>
                        <p>{marieStopesData.locations.join(' | ')}</p>
                    </div>
                 </div>
            </div>
            <div className="md:col-span-3">
                <h2 className="text-2xl font-bold text-foreground">Your Questions, Answered</h2>
                <p className="mt-2 text-muted-foreground">Important things to know before you visit a Marie Stopes centre.</p>
                <div className="mt-6">
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
    </div>
  );
}
