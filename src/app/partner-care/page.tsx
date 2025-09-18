

import { partners, faqItems } from '@/lib/data';
import { PartnerCareHeader } from './(components)/partner-care-header';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';


const partnerFaqItems = [
    {
        question: "I need a confidential confirmatory test after a self-test. Who should I see?",
        answer: "For a fully confidential and professional confirmatory test, we recommend either Nyaho Medical Centre or Akai House Clinic. Both are experienced in handling these situations with discretion and care."
    },
    {
        question: "I'm looking for professional counselling about my sexual health.",
        answer: "Nyaho Medical Centre provides excellent counselling services. They offer a safe space to discuss your concerns with a professional."
    },
    {
        question: "Where can I get general health advice or other wellness products?",
        answer: "Bedita Pharmacy and Ernest Chemist are great resources for general health consultations and a wide range of wellness products. Their pharmacists can provide professional advice."
    },
    {
        question: "I have a specific concern about STIs or dermatology.",
        answer: "Akai House Clinic specializes in Sexual Health and Dermatology. They are an excellent choice for specialized care in these areas."
    }
]

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
        
        <PartnerCareHeader />

        <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-foreground">Our Trusted Partners</h3>
            <p className="mt-2 text-muted-foreground">Handpicked for their professionalism and discretion.</p>
        </div>

        {partners.length > 0 ? (
            <div className="mt-12 grid grid-cols-1 gap-16">
            {partners.map((hospital, index) => (
                <div key={hospital.id} className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
                    <div className={cn("relative flex h-48 w-full items-center justify-center rounded-2xl bg-white p-6 shadow-md md:h-64", index % 2 === 1 && "md:order-last")}>
                         {hospital.logo_url ? (
                            <Image
                                src={hospital.logo_url}
                                alt={`${hospital.name} Logo`}
                                width={200}
                                height={80}
                                className="object-contain"
                                data-ai-hint="logo"
                            />
                            ) : (
                            <span className="font-bold text-muted-foreground">{hospital.name}</span>
                        )}
                    </div>
                     <div className={cn("flex flex-col justify-center", index % 2 === 1 && "md:order-first")}>
                        <h3 className="text-2xl font-bold text-foreground">{hospital.name}</h3>
                        <p className="mt-1 text-base text-muted-foreground">{hospital.location}</p>
                        
                        {hospital.services && hospital.services.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                            {hospital.services.map((service) => (
                                <Badge key={service} variant="secondary" className="bg-primary/10 text-primary">
                                {service}
                                </Badge>
                            ))}
                            </div>
                        )}
                        
                        <div className="mt-6 flex flex-wrap gap-2">
                           {hospital.contact?.phone && (
                                <Button asChild size="sm">
                                    <a href={`tel:${hospital.contact.phone}`}>
                                        <Phone />
                                        Call Now
                                    </a>
                                </Button>
                            )}
                            {hospital.contact?.whatsapp && (
                                <Button asChild size="sm" variant="accent" className="bg-green-500 hover:bg-green-600 text-white">
                                    <a href={`https://wa.me/233${hospital.contact.whatsapp.slice(1)}`} target="_blank" rel="noopener noreferrer">
                                        <WhatsAppIcon />
                                        WhatsApp
                                    </a>
                                </Button>
                            )}
                            {hospital.contact?.website && (
                                <Button asChild size="sm" variant="outline">
                                    <a href={hospital.contact.website} target="_blank" rel="noopener noreferrer">
                                        <Globe />
                                        Website
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            ))}
          </div>
        ) : (
            <div className="text-center py-16">
                <p className="text-muted-foreground">No partner hospitals are listed at this time. Please check back later.</p>
            </div>
        )}

        <div className="mt-24 max-w-3xl mx-auto">
            <div className="text-center">
                <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                    A Guide to Your Care Options
                </h2>
                <p className="mt-4 text-base text-muted-foreground">
                    Find the right support for your needs.
                </p>
            </div>
             <div className="mt-8">
                <Accordion type="single" collapsible className="w-full">
                    {partnerFaqItems.map((item, index) => (
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
