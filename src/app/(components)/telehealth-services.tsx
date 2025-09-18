
'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const services = [
  {
    title: 'STD care within 2 hours',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=800&h=600&fit=crop',
    imageHint: 'doctor using tablet',
    rowSpan: 'row-span-2',
    link: '#',
  },
  {
    title: "Women's health consult",
    imageUrl: 'https://images.unsplash.com/photo-1528819622759-4233b6a32247?q=80&w=800&h=600&fit=crop',
    imageHint: 'two women talking',
    rowSpan: 'row-span-3',
    link: '#',
  },
  {
    title: "Men's health consult",
    imageUrl: 'https://images.unsplash.com/photo-1530031092839-74b445d47228?q=80&w=800&h=600&fit=crop',
    imageHint: 'man exercising outdoors',
    rowSpan: 'row-span-2',
    link: '#',
  },
  {
    title: 'Check your thyroid health',
    imageUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=800&h=600&fit=crop',
    imageHint: 'smiling woman',
    rowSpan: 'row-span-3',
    link: '#',
  },
  {
    title: 'General wellness, talk to a provider',
    imageUrl: 'https://images.unsplash.com/photo-1551198298-971a820839be?q=80&w=800&h=600&fit=crop',
    imageHint: 'doctor waving',
    rowSpan: 'row-span-2',
    link: '#',
  },
];

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


function ServiceCard({ service }: { service: (typeof services)[0] }) {
  return (
    <div className="group relative flex h-full min-h-[380px] w-full flex-col overflow-hidden rounded-2xl bg-card shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <div 
        className="relative h-3/5 w-full"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)' }}
      >
        <Image
          src={service.imageUrl}
          alt={service.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 80vw, (max-width: 1200px) 30vw, 25vw"
          data-ai-hint={service.imageHint}
          placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(800, 600))}`}
        />
      </div>
      <div className="flex flex-grow flex-col justify-between p-6 pt-8 text-center">
        <h3 className="text-base font-semibold text-foreground">{service.title}</h3>
        <div className="mt-4">
          <Button asChild variant="outline" size="sm" className="rounded-full bg-background">
            <Link href={service.link}>Schedule</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TelehealthServices() {
  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Fast and easy telehealth calls
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-base text-muted-foreground">
            Schedule virtual care visits that accept major insurance plans.
          </p>
        </div>

        <div 
            className="relative"
            style={{
                maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
                WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)',
            }}
        >
            <div className="overflow-x-auto pb-8 -mb-8">
                <div className="grid grid-flow-col auto-cols-[80%] sm:auto-cols-[45%] md:auto-cols-[30%] lg:auto-cols-[22%] gap-6 px-4">
                    {services.map((service, index) => (
                        <div key={index} className={cn('grid', 
                            index % 3 === 0 ? 'md:pt-0' : 
                            index % 3 === 1 ? 'md:pt-12' : 'md:pt-24'
                        )}>
                            <ServiceCard service={service} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </section>
  );
}
