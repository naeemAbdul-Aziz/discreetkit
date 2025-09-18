
import { getSupabaseClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Bot, MessageCircle, Phone, Globe, MapPin, Stethoscope } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export const dynamic = 'force-dynamic';

type Hospital = {
  id: string;
  name: string;
  logo_url: string | null;
  location: string | null;
  services: string[] | null;
  contact: any; // JSONB column, can be flexible
  is_preferred: boolean | null;
};

// Helper to add UTM parameters to a URL
const withUtmParams = (url: string) => {
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
    return data;
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


export default async function PartnerDetailPage({ params }: { params: { id: string } }) {
  const hospital = await getHospital(params.id);

  if (!hospital) {
    notFound();
  }

  const { name, logo_url, location, services, contact, is_preferred } = hospital;
  
  const hasWhatsapp = contact?.whatsapp;
  const hasBookingUrl = contact?.booking_url;
  const hasPhone = contact?.phone;
  const hasWebsite = contact?.website;

  return (
    <div className="bg-muted">
        <div className="container mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-24">
            <Card className="overflow-hidden rounded-2xl shadow-lg">
                <CardHeader className="p-0">
                    <div className="relative flex h-48 md:h-64 items-center justify-center bg-white p-8">
                         {logo_url ? (
                            <Image
                                src={logo_url}
                                alt={`${name} Logo`}
                                width={250}
                                height={100}
                                className="object-contain"
                                data-ai-hint="logo"
                                placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(250, 100))}`}
                            />
                            ) : (
                            <span className="font-bold text-muted-foreground">{name}</span>
                        )}
                        {is_preferred && (
                             <div className="absolute right-4 top-4 z-10 flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                                <Award className="h-4 w-4" />
                                Preferred Partner
                            </div>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left Column (Main Info) */}
                        <div className="md:col-span-2 space-y-6">
                            <CardTitle className="font-headline text-3xl md:text-4xl">{name}</CardTitle>
                            
                            {location && (
                                <div className="flex items-start gap-3 text-muted-foreground">
                                    <MapPin className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                                    <span>{location}</span>
                                </div>
                            )}

                             <Alert variant="default" className="bg-primary/5">
                                <Stethoscope className="h-4 w-4 !text-primary" />
                                <AlertTitle className="font-semibold !text-primary">Confidential Service</AlertTitle>
                                <AlertDescription>
                                    Mention **DiscreetKit** when you get in touch for a priority and confidential experience.
                                </AlertDescription>
                            </Alert>

                            {services && services.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-3">Services Offered</h3>
                                    <div className="flex flex-wrap gap-2">
                                    {services.map((service) => (
                                        <Badge key={service} variant="secondary" className="bg-primary/10 text-primary px-3 py-1 text-sm">
                                        {service}
                                        </Badge>
                                    ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column (Contact Actions) */}
                        <div className="md:col-span-1">
                             <Card className="bg-muted/50 p-4">
                                <h3 className="font-semibold text-center mb-4">Get in Touch</h3>
                                <div className="flex flex-col space-y-3">
                                    {hasWhatsapp && (
                                        <Button asChild size="lg">
                                            <Link href={withUtmParams(hasWhatsapp)} target="_blank" rel="noopener noreferrer">
                                                <MessageCircle />
                                                Chat on WhatsApp
                                            </Link>
                                        </Button>
                                    )}
                                    {hasBookingUrl && (
                                        <Button asChild variant="outline" size="lg">
                                            <Link href={withUtmParams(hasBookingUrl)} target="_blank" rel="noopener noreferrer">
                                                <Globe />
                                                Book an Appointment
                                            </Link>
                                        </Button>
                                    )}
                                    {hasWebsite && (
                                         <Button asChild variant="outline" size="lg">
                                            <Link href={withUtmParams(hasWebsite)} target="_blank" rel="noopener noreferrer">
                                                <Globe />
                                                Visit Website
                                            </Link>
                                        </Button>
                                    )}
                                    {hasPhone && (
                                        <Button asChild variant="ghost" size="lg">
                                            <Link href={`tel:${hasPhone}`}>
                                                <Phone />
                                                Call Now
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </CardContent>
            </Card>
             <div className="mt-8 text-center">
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
