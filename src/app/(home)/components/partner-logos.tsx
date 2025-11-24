/**
 * @file partner-logos.tsx
 * @description a sleek, modern component to display partner logos in a grid.
 *              logos are grayscale by default and turn to color on hover.
 */

'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

const partners = [
  { name: 'Marie Stopes', logo: 'https://placehold.co/200x80/transparent/111?text=Marie+Stopes' },
  { name: 'Planned Parenthood', logo: 'https://placehold.co/200x80/transparent/111?text=Planned+Parenthood' },
  { name: 'WHO', logo: 'https://placehold.co/200x80/transparent/111?text=WHO' },
  { name: 'Ghana Health Service', logo: 'https://placehold.co/200x80/transparent/111?text=Ghana+Health' },
];

// Duplicate for infinite scroll
const marqueePartners = [...partners, ...partners, ...partners];

export function PartnerLogos() {
  return (
    <section className="py-20 bg-background overflow-hidden border-y border-border/40">
      <div className="container mx-auto px-6 mb-12 text-center">
        <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
          Trusted by Global Health Leaders
        </p>
      </div>
      
      <div className="relative flex w-full overflow-hidden mask-gradient">
        {/* Gradient Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r from-background to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l from-background to-transparent" />

        <motion.div 
          className="flex gap-24 items-center whitespace-nowrap"
          animate={{ x: [0, -1000] }}
          transition={{ 
            repeat: Infinity, 
            ease: "linear", 
            duration: 30 
          }}
        >
          {marqueePartners.map((partner, i) => (
            <div key={i} className="relative h-16 w-48 shrink-0 grayscale opacity-50 transition-all duration-500 hover:grayscale-0 hover:opacity-100 cursor-pointer">
              <Image
                src={partner.logo}
                alt={partner.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
