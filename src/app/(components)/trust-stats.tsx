
'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const stats = [
  {
    value: 'Thousands',
    label: 'Served Confidentially',
  },
  {
    value: '4+',
    label: 'Major Campuses Covered',
  },
  {
    value: '10+',
    label: 'Health Partners',
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

export function TrustStats() {
  return (
    <section className="bg-background py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
           <motion.div 
             className="relative flex h-[350px] min-h-[300px] items-center justify-center md:h-[450px]"
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 0.7 }}
           >
            <div className="absolute right-0 top-0 w-3/4 max-w-[320px] md:w-2/3">
              <Image
                src="https://images.unsplash.com/photo-1584012961505-507d844cc8a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxzdHVkZW50JTIwZ2hhbmF8ZW58MHx8fHwxNzU2MTQzNzg2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Happy student in Ghana"
                width={400}
                height={500}
                className="rounded-xl object-cover shadow-lg"
                data-ai-hint="student ghana"
                placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(400, 500))}`}
              />
            </div>
            <div className="absolute bottom-0 left-0 w-2/4 max-w-[250px] md:w-1/2 transform -rotate-6">
               <Image
                src="https://images.unsplash.com/photo-1666886573553-6548db92db79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxoZWFsdGglMjBwcm9mZXNzaW9uYWx8ZW58MHx8fHwxNzU2MTQzNzg2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Health professional"
                width={400}
                height={300}
                className="rounded-xl object-cover shadow-2xl border-4 border-background"
                data-ai-hint="health professional"
                placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(400, 300))}`}
              />
            </div>
          </motion.div>
          <div className="space-y-8">
            <div>
              <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                Trusted by students and health professionals across Ghana
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                Our service is built on a foundation of <span className="font-semibold text-primary">trust, privacy, and strong community partnerships</span>.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4 md:gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</p>
                    <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
