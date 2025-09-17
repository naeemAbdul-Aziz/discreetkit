'use client';

import Image from 'next/image';
import { partners } from '@/lib/data';
import { motion } from 'framer-motion';

const marqueeVariants = {
  animate: {
    x: [0, -1000],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 25,
        ease: "linear",
      },
    },
  },
};

export function PartnerLogos() {
  const extendedPartners = [...partners, ...partners];

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Our Network of Health & Student Partners
        </h2>
        
        <div className="relative w-full overflow-hidden" style={{ maskImage: 'linear-gradient(to right, transparent, white 10%, white 90%, transparent)' }}>
          <motion.div
            className="flex gap-x-12"
            variants={marqueeVariants}
            animate="animate"
          >
            {extendedPartners.map((partner, index) => (
                <div key={`${partner.id}-${index}`} className="flex-shrink-0 p-2">
                    <Image
                    src={partner.logoUrl}
                    alt={`${partner.name} Logo`}
                    width={100}
                    height={35}
                    className="h-auto w-auto aspect-[3/1] object-contain grayscale transition-all hover:grayscale-0"
                    data-ai-hint="logo health"
                    />
                </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
