
'use client';

import { motion } from 'framer-motion';
import { University, Building } from 'lucide-react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const locations = [
  { name: 'Accra', icon: Building, top: '57%', left: '50%' },
  { name: 'University of Ghana, Legon', icon: University, top: '50%', left: '53%' },
  { name: 'UPSA', icon: University, top: '44%', left: '48%' },
  { name: 'Kumasi', icon: Building, top: '35%', left: '30%' },
  { name: 'GIMPA', icon: University, top: '52%', left: '42%' },
  { name: 'Cape Coast', icon: Building, top: '75%', left: '35%' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
  },
};

export function CoverageMap() {
  return (
    <section className="bg-background py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Serving You Across Ghana
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Discreet delivery and trusted pharmacy pickups, right where you are. We’re growing fast — here’s where you’ll find us today.
          </p>
        </div>

        <div className="mt-12">
          <TooltipProvider>
            <motion.div
              className="relative w-full max-w-4xl mx-auto aspect-[16/10]"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >
              <Image
                src="https://images.unsplash.com/photo-1619454019329-8e629471f2cd?w=1200&h=800&fit=crop"
                alt="Map of Ghana"
                fill
                className="object-contain opacity-20"
                data-ai-hint="map ghana stylized"
              />

              {locations.map((location) => (
                <Tooltip key={location.name}>
                  <TooltipTrigger asChild>
                    <motion.div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2"
                      style={{ top: location.top, left: location.left }}
                      variants={itemVariants}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center cursor-pointer">
                          <div className="w-5 h-5 rounded-full bg-primary shadow-lg flex items-center justify-center">
                             <location.icon className="h-3 w-3 text-primary-foreground" />
                          </div>
                      </div>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{location.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </motion.div>
          </TooltipProvider>
        </div>
      </div>
    </section>
  );
}
