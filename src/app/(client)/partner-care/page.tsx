'use client';

import { useState } from 'react';
import { marieStopesData } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Phone, MessageSquare, Globe, ArrowRight, Check, Calendar, ExternalLink } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { TriageHero } from './(components)/triage-hero';
import { MobileActionBar } from './(components)/mobile-action-bar';
import { BookingModal } from './(components)/booking-modal';
import { cn } from '@/lib/utils';

import { HowItWorksPartner } from '@/app/partner-care/(components)/how-it-works';

export default function PartnerCarePage() {
  const [activeService, setActiveService] = useState('contraception');

  const scrollToServices = () => {
    const element = document.getElementById('services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-background min-h-screen pb-24 md:pb-0">
      
      <TriageHero onServiceSelect={(id) => {
        setActiveService(id);
        scrollToServices();
      }} />

      <div className="container mx-auto px-4 md:px-6">
        
        {/* Restored How It Works Section */}
        <div className="mb-24">
          <HowItWorksPartner />
        </div>

        <Separator id="services" className="mb-16" />

        {/* Services Grid (Vertical on Mobile) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {marieStopesData.services.map((service, index) => (
            <Card key={index} className="group overflow-hidden border-border/50 hover:border-primary/50 transition-all hover:shadow-lg">
              <div className="relative h-48 w-full overflow-hidden">
                <Image
                  src={service.imageUrl}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="font-bold text-lg">{service.title}</h3>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3">
                  {service.description}
                </p>
                <div className="flex flex-col gap-3 mt-6">
                  <BookingModal>
                    <Button className="w-full font-semibold shadow-sm hover:shadow-md transition-all bg-primary text-primary-foreground" size="default">
                      <Calendar className="mr-2 h-4 w-4" />
                      Request Appointment
                    </Button>
                  </BookingModal>
                  
                  <Button variant="outline" className="w-full border-border/40 hover:bg-accent/50 hover:text-accent-foreground transition-colors" asChild>
                    <Link href={marieStopesData.website || '#'} target="_blank" className="flex items-center justify-center group/link">
                      <span>Visit Website</span>
                      <ExternalLink className="ml-2 h-3 w-3 opacity-50 group-hover/link:opacity-100 transition-opacity" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-24">
          <h2 className="font-headline text-3xl font-bold text-center mb-12">Common Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {marieStopesData.faqs.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50">
                <AccordionTrigger className="text-left text-base hover:no-underline py-6">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

      </div>

      {/* Mobile Action Bar */}
      {marieStopesData.contact.phone && marieStopesData.contact.whatsapp && (
        <MobileActionBar 
          phone={marieStopesData.contact.phone} 
          whatsapp={marieStopesData.contact.whatsapp} 
        />
      )}
    </div>
  );
}
