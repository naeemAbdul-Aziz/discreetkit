/**
 * @file partner-referral.tsx
 * @description a component that highlights the partnership with care providers and
 *              encourages users to seek follow-up support if needed.
 */

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, HeartHandshake } from 'lucide-react';

// a shimmer effect for image placeholders to improve loading perception.
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

// converts the shimmer svg to a base64 string for the placeholder.
const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export function PartnerReferral() {
  return (
    <section className="py-12 md:py-24">
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        <Card className="relative grid grid-cols-1 overflow-hidden rounded-2xl md:grid-cols-2">
            
            {/* image container */}
            <div className="relative h-64 md:h-auto min-h-[350px]">
              <Image
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&fit=crop"
                  alt="a healthcare professional showing information on a tablet to a patient"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  data-ai-hint="doctor patient tablet"
                  placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(800, 600))}`}
              />
            </div>

            {/* content container */}
            <div className="relative flex flex-col justify-center bg-card p-8 md:p-12">
                {/* this pseudo-element creates the curved cutout on desktop. */}
                <div 
                    className="absolute bottom-0 left-0 hidden h-24 w-24 -translate-x-1/2 bg-transparent md:block"
                    style={{
                        content: '""',
                        borderBottomLeftRadius: '100%',
                        boxShadow: '2.5rem 2.5rem 0 0 hsl(var(--card))'
                    }}
                ></div>
                
                 {/* this pseudo-element creates the curved cutout on mobile. */}
                <div
                    className="absolute -top-12 left-0 h-12 w-full bg-transparent md:hidden"
                    style={{
                        content: '""',
                        borderBottomLeftRadius: '100%',
                        borderBottomRightRadius: '100%',
                        boxShadow: '0 2.5rem 0 0 hsl(var(--card))'
                    }}
                ></div>

                <HeartHandshake className="mb-4 h-10 w-10 text-primary" />
                <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Your Bridge to Confidential Care
                </h2>
                <p className="mt-4 text-base text-muted-foreground">
                Need to talk to someone or get a confirmatory test? We've built a relationship with a trusted, non-judgmental partner who is ready to support you.
                </p>
                <p className="mt-2 text-base text-muted-foreground">
                Mention DiscreetKit when you contact them to ensure a private and respectful experience.
                </p>
                <div className="mt-8">
                <Button asChild size="lg">
                    <Link href="/partner-care">
                    Learn About Our Partner
                    <ArrowRight />
                    </Link>
                </Button>
                </div>
            </div>
        </Card>
      </div>
    </section>
  );
}
