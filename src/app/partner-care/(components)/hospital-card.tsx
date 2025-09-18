
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Award, Bot, MessageCircle, Phone, Globe, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the type for the hospital prop based on your Supabase schema
type Hospital = {
  id: string;
  name: string;
  logo_url: string | null;
  location: string | null;
  services: string[] | null;
  contact: any; // JSONB column, can be flexible
  is_preferred: boolean | null;
};

export function HospitalCard({ hospital }: { hospital: Hospital }) {
  const { id, name, logo_url, location, services, is_preferred } = hospital;

  return (
    <Link href={`/partner-care/${id}`} className="group block h-full">
        <Card className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-4 transition-all duration-300 group-hover:shadow-lg",
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
            <h3 className="text-lg font-bold text-foreground leading-tight">{name}</h3>
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
            
            <div className="mt-6 flex justify-end">
                <div className="flex items-center text-sm font-semibold text-primary">
                    View Details
                    <ArrowRight className="ml-1 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
            </div>
        </div>
        </Card>
    </Link>
  );
}
