
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

type Hospital = {
  id: string;
  name: string;
  logo_url: string | null;
  location: string | null;
  services: string[] | null;
  contact: any;
  is_preferred: boolean | null;
};

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


export function PartnerShowcaseCard({ partner }: { partner: Hospital }) {
  const { id, name, logo_url, services } = partner;

  // Use a placeholder image if logo_url is null
  const imageUrl = logo_url || `https://picsum.photos/seed/${id}/400/250`;
  const imageHint = logo_url ? 'hospital logo' : 'abstract building';

  return (
    <Link href={`/partner-care/${id}`} className="group block h-full">
        <div className="relative h-full w-full overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
        {/* Image container */}
        <div className="relative h-40 w-full bg-muted">
            <Image
                src={imageUrl}
                alt={`${name} Logo`}
                fill
                className="object-contain p-8"
                data-ai-hint={imageHint}
                sizes="(max-width: 768px) 80vw, 30vw"
                placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(400, 250))}`}
            />
        </div>

        {/* Diagonal content background */}
        <div 
            className="absolute bottom-0 left-0 right-0 top-32 bg-card"
            style={{ clipPath: 'polygon(0 15%, 100% 0, 100% 100%, 0% 100%)' }}
        />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-end p-6 pt-10 text-center">
            <h3 className="text-lg font-bold text-foreground">{name}</h3>
            {services && services.length > 0 && (
                <p className="mt-1 text-sm text-muted-foreground">
                    {services.slice(0, 2).join(' • ')}
                </p>
            )}
            <div className="mt-4">
                <Button variant="outline" size="sm" className="rounded-full bg-background">
                    View Details
                    <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
            </div>
        </div>
        </div>
    </Link>
  );
}
