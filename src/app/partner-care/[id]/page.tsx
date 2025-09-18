
import { getSupabaseClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Bot, MessageCircle, Phone, Globe, MapPin, Stethoscope, TestTube2, HeartHandshake, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export const dynamic = 'force-dynamic';

type Hospital = {
  id: string;
  name: string;
  logo_url: string | null;
  location: string | null;
  services: string[] | null;
  contact: any; // JSONB column, can be flexible
  is_preferred: boolean | null;
  // Add new fields from your anatomy doc
  tagline: string | null;
  about: string | null;
  hours: string | null;
  gps_address: string | null;
  faq: { question: string; answer: string }[] | null;
};

// Helper to add UTM parameters to a URL
const withUtmParams = (url: string) => {
  if (!url) return '#';
  const utmParams = 'utm_source=discreetkit&utm_medium=referral&utm_campaign=hospital-referral';
  try {
    const urlObj = new URL(url);
    urlObj.search ? (urlObj.search += `&${utmParams}`) : (urlObj.search = `?${utmParams}`);
    return urlObj.toString();
  } catch (error) {
    return '#';
  }
};


async function getHospital(id: string): Promise<Hospital | null> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
        console.error("Error fetching hospital:", error);
        return null;
    }
    // Manually add placeholder data for now as per the new anatomy
    const hospitalData = data as any;
    hospitalData.tagline = hospitalData.tagline || 'Confidential Sexual & Reproductive Health Care in Accra';
    hospitalData.about = hospitalData.about || `At ${hospitalData.name}, we prioritise your health by providing confidential STI testing, counselling, and treatment with experienced clinicians. Our partnership with DiscreetKit ensures you receive seamless, private, and respectful care every step of the way.`;
    hospitalData.hours = hospitalData.hours || 'Mon - Fri, 9:00 AM - 5:00 PM';
    hospitalData.gps_address = hospitalData.gps_address || 'GA-123-4567';
    hospitalData.faq = hospitalData.faq || [
        { question: "Will my results be confidential?", answer: "Yes, all consultations and results are 100% confidential. Your privacy is our highest priority." },
        { question: "How long will results take?", answer: "Rapid test results are typically available within 20-30 minutes. Other tests may take 24-48 hours." },
        { question: "What if I test positive?", answer: "Our counselors will provide immediate support and guide you through the next steps for confirmatory testing and treatment in a private, judgment-free environment." }
    ];
     hospitalData.services = hospitalData.services || ["STI Testing", "Counseling & Support", "Contraceptive Care", "Treatment & Referrals"];


    return hospitalData;
}

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


const serviceIcons: { [key: string]: React.ElementType } = {
    'STI Testing': TestTube2,
    'Counseling & Support': HeartHandshake,
    'Contraceptive Care': Check,
    'Treatment & Referrals': Stethoscope,
    'General Health': Stethoscope,
    'Pharmacy': Stethoscope,
    'Confirmatory Testing': TestTube2,
    'Counseling': HeartHandshake,
}

export default async function PartnerDetailPage({ params }: { params: { id: string } }) {
  const hospital = await getHospital(params.id);

  if (!hospital) {
    notFound();
  }

  const { name, logo_url, location, services, contact, is_preferred, tagline, about, hours, gps_address, faq } = hospital;
  
  const hasWhatsapp = contact?.whatsapp;
  const hasBookingUrl = contact?.booking_url;
  const hasPhone = contact?.phone;
  const hasWebsite = contact?.website;
  const hasEmail = contact?.email;

  const howItWorksSteps = [
    { number: 1, title: "Book Your Appointment", description: "Use the links provided to book online, chat on WhatsApp, or call directly. Mention you were referred by DiscreetKit." },
    { number: 2, title: "Confidential Consultation", description: "Have a private discussion with a healthcare professional about your needs in a safe and non-judgmental environment." },
    { number: 3, title: "Testing & Support", description: "Undergo any necessary tests or receive counseling from experienced clinicians." },
    { number: 4, title: "Receive Next Steps", description: "Get your results privately and discuss a treatment plan or next steps for your health journey." },
  ];

  return (
    <div className="bg-muted">
        <div className="container mx-auto max-w-5xl px-4 py-12 md:px-6 md:py-24">
            
            {/* 1. Hero / Intro Section */}
            <header className="text-center mb-12">
                 <div className="relative mx-auto flex h-32 w-64 max-w-full items-center justify-center mb-6">
                     {logo_url ? (
                        <Image
                            src={logo_url}
                            alt={`${name} Logo`}
                            fill
                            className="object-contain"
                            data-ai-hint="logo"
                            priority
                        />
                        ) : (
                        <span className="font-bold text-muted-foreground">{name}</span>
                    )}
                </div>
                <h1 className="font-headline text-3xl md:text-4xl font-bold">{name}</h1>
                <p className="mt-2 text-lg text-primary">{tagline}</p>
                <div className="mt-4 text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{location}</span>
                </div>
                <Alert variant="default" className="max-w-xl mx-auto mt-6 bg-primary/5 border-primary/20">
                    <Stethoscope className="h-4 w-4 !text-primary" />
                    <AlertDescription className="!text-primary">
                        Trusted partner offering discreet, professional follow-up care for DiscreetKit users.
                    </AlertDescription>
                </Alert>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-12">
                   
                    {/* 2. About the Partner */}
                    <Card>
                        <CardHeader><CardTitle>About {name}</CardTitle></CardHeader>
                        <CardContent><p className="text-muted-foreground">{about}</p></CardContent>
                    </Card>

                    {/* 3. Key Services */}
                    <Card>
                        <CardHeader><CardTitle>Key Services</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {services && services.map(service => {
                                const Icon = serviceIcons[service] || Stethoscope;
                                return (
                                <div key={service} className="flex items-start gap-4 rounded-lg bg-muted p-4">
                                    <Icon className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">{service}</h4>
                                        <p className="text-sm text-muted-foreground">Professional and confidential care.</p>
                                    </div>
                                </div>
                            )})}
                        </CardContent>
                    </Card>

                    {/* 4. How It Works */}
                    <Card>
                        <CardHeader><CardTitle>How It Works at {name}</CardTitle></CardHeader>
                        <CardContent>
                             <div className="relative">
                                <div className="absolute left-5 top-5 h-[calc(100%-2.5rem)] w-0.5 bg-border -translate-x-1/2" aria-hidden="true"></div>
                                <div className="space-y-8">
                                    {howItWorksSteps.map((step) => (
                                    <div key={step.number} className="flex items-start gap-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background font-bold text-primary z-10 flex-shrink-0">
                                        {step.number}
                                        </div>
                                        <div className="flex-1 space-y-1 pt-1">
                                        <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                                        <p className="text-base text-muted-foreground">{step.description}</p>
                                        </div>
                                    </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 5. Q&A */}
                    {faq && faq.length > 0 && (
                        <Card>
                             <CardHeader><CardTitle>Common Questions</CardTitle></CardHeader>
                             <CardContent>
                                 <Accordion type="single" collapsible className="w-full">
                                    {faq.map((item, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger>{item.question}</AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
                                    </AccordionItem>
                                    ))}
                                </Accordion>
                             </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
                   
                    {/* 7. Call-to-Action Card */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Book Your Private Appointment</CardTitle>
                            <CardDescription>Your details remain private. Only you choose to share them with the hospital.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col space-y-3">
                            {hasBookingUrl ? (
                                <Button asChild size="lg">
                                    <Link href={withUtmParams(hasBookingUrl)} target="_blank" rel="noopener noreferrer">
                                        <Globe /> Book Online Now
                                    </Link>
                                </Button>
                            ) : hasWhatsapp ? (
                                <Button asChild size="lg">
                                    <Link href={withUtmParams(hasWhatsapp)} target="_blank" rel="noopener noreferrer">
                                        <MessageCircle /> Chat on WhatsApp
                                    </Link>
                                </Button>
                            ) : (
                                <Button asChild size="lg">
                                    <Link href={`tel:${hasPhone}`}>
                                        <Phone /> Call to Book
                                    </Link>
                                </Button>
                            )}
                             {hasWhatsapp && hasBookingUrl && (
                                <Button asChild variant="outline" size="lg">
                                    <Link href={withUtmParams(hasWhatsapp)} target="_blank" rel="noopener noreferrer">
                                        <MessageCircle /> Chat on WhatsApp
                                    </Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                     {/* 6. Practical Info Card */}
                    <Card>
                        <CardHeader><CardTitle>Practical Information</CardTitle></CardHeader>
                        <CardContent className="space-y-4 text-sm">
                           <div className="flex items-start gap-3">
                               <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                               <div>
                                   <p className="font-semibold">Address</p>
                                   <p className="text-muted-foreground">{location}</p>
                                   <p className="text-muted-foreground">GPS: {gps_address}</p>
                               </div>
                           </div>
                            <div className="flex items-start gap-3">
                               <Phone className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                               <div>
                                   <p className="font-semibold">Phone</p>
                                   <Link href={`tel:${hasPhone}`} className="text-muted-foreground hover:text-primary">{hasPhone}</Link>
                               </div>
                           </div>
                           {hasEmail && (
                            <div className="flex items-start gap-3">
                               <MessageCircle className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                               <div>
                                   <p className="font-semibold">Email</p>
                                   <Link href={`mailto:${hasEmail}`} className="text-muted-foreground hover:text-primary">{hasEmail}</Link>
                               </div>
                           </div>
                           )}
                           {hasWebsite && (
                             <div className="flex items-start gap-3">
                               <Globe className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                               <div>
                                   <p className="font-semibold">Website</p>
                                   <Link href={withUtmParams(hasWebsite)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">Visit Website</Link>
                               </div>
                           </div>
                           )}
                           <div className="flex items-start gap-3">
                               <Clock className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                               <div>
                                   <p className="font-semibold">Opening Hours</p>
                                   <p className="text-muted-foreground">{hours}</p>
                               </div>
                           </div>
                        </CardContent>
                    </Card>

                </div>
            </div>


             <div className="mt-12 text-center">
                <Button asChild variant="link">
                    <Link href="/partner-care">
                        &larr; Back to all partners
                    </Link>
                </Button>
            </div>
        </div>
    </div>
  );
}
// Add Clock icon to imports
import { Clock } from 'lucide-react';
