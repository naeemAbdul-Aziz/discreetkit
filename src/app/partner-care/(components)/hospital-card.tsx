

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Bot, MessageCircle, Phone, Globe, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Partner } from '@/lib/data';

const WhatsAppIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current">
        <title>WhatsApp</title>
        <path d="M12.04 2.016c-5.52 0-9.985 4.464-9.985 9.984 0 1.74.444 3.37 1.252 4.794l-1.39 5.022 5.134-1.355a9.949 9.949 0 0 0 4.99 1.27h.002c5.52 0 9.985-4.465 9.985-9.985 0-5.52-4.465-9.985-9.986-9.985zm0 18.355a8.31 8.31 0 0 1-4.223-1.183l-.302-.18-3.145.825.84-3.05-.2-.315a8.28 8.28 0 0 1-1.28-4.448c0-4.594 3.72-8.314 8.314-8.314s8.313 3.72 8.313 8.314-3.72 8.313-8.313 8.313zM17.134 14.162c-.22-.11-.924-.457-1.067-.508s-.248-.078-.352.078-.403.508-.494.615-.182.116-.337.039-1.26-.465-2.4-1.475-1.13-1.838-1.033-2.03.09-.16.196-.26s.22-.26.33-.435.056-.22.028-.41s-.352-.84-.482-1.15-.26-.28-.38-.28-.27-.005-.41-.005-.352-.023-.54.255-.712.69-.712 1.69c0 1.03.73 1.956.83 2.09.1.134 1.41 2.15 3.42 3.018.47.206.84.33 1.12.42.5.15 1.05.13 1.45.08.45-.06.92-.37 1.05-.72s.13-.64.09-.72c-.04-.08-.15-.13-.33-.24z" />
    </svg>
)


export function HospitalCard({ hospital }: { hospital: Partner }) {
  const { id, name, logo_url, location, services, is_preferred, contact } = hospital;

  return (
    <Card className={cn(
    "flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-4 transition-all duration-300 relative",
    is_preferred ? "border-primary/50" : ""
    )}>
    {is_preferred && (
        <div className="absolute -top-3 -right-3 z-10">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Award className="h-6 w-6" />
            <span className="sr-only">Preferred Partner</span>
        </div>
        </div>
    )}
    
    <div className="relative flex h-32 items-center justify-center overflow-hidden bg-white p-4 rounded-lg">
        {logo_url ? (
        <Image
            src={logo_url}
            alt={`${name} Logo`}
            width={150}
            height={60}
            className="object-contain"
            data-ai-hint="logo"
        />
        ) : (
        <span className="font-bold text-muted-foreground">{name}</span>
        )}
    </div>

    <div className="flex flex-grow flex-col pt-4">
        <div className="flex-grow">
        <h3 className="text-lg font-bold text-foreground leading-tight pr-10">{name}</h3>
        {location && <p className="mt-1 text-sm text-muted-foreground">{location}</p>}

        {services && services.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
            {services.map((service) => (
                <Badge key={service} variant="secondary" className="bg-primary/10 text-primary">
                {service}
                </Badge>
            ))}
            </div>
        )}
        </div>
        
        <div className="mt-6 flex flex-wrap gap-2">
            {contact?.phone && (
                <Button asChild size="sm" className="flex-1 min-w-[100px]">
                    <a href={`tel:${contact.phone}`}>
                        <Phone />
                        Call Now
                    </a>
                </Button>
            )}
             {contact?.whatsapp && (
                <Button asChild size="sm" variant="accent" className="flex-1 bg-green-500 hover:bg-green-600 text-white min-w-[100px]">
                     <a href={`https://wa.me/233${contact.whatsapp.slice(1)}`} target="_blank" rel="noopener noreferrer">
                        <WhatsAppIcon />
                        WhatsApp
                    </a>
                </Button>
            )}
             {contact?.website && (
                <Button asChild size="sm" variant="outline" className="flex-1 min-w-[100px]">
                     <a href={contact.website} target="_blank" rel="noopener noreferrer">
                        <Globe />
                        Website
                    </a>
                </Button>
            )}
        </div>
    </div>
    </Card>
  );
}
