
'use client';

import { motion } from 'framer-motion';
import { MapPin, University, Building } from 'lucide-react';
import Image from 'next/image';

const locations = [
  { name: 'Accra', icon: Building },
  { name: 'University of Ghana, Legon', icon: University },
  { name: 'UPSA', icon: University },
  { name: 'Kumasi', icon: Building },
  { name: 'GIMPA', icon: University },
  { name: 'Cape Coast', icon: Building },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
    },
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
            We're rapidly expanding our discreet delivery and pharmacy pickup services. Check out our current key service areas below.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <motion.div 
            className="relative flex items-center justify-center rounded-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
             <Image
              src="https://placehold.co/500x500"
              alt="Map of Ghana showing delivery zones"
              width={500}
              height={500}
              className="rounded-xl shadow-xl object-cover opacity-20"
              data-ai-hint="map Ghana"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
            <p className="absolute bottom-4 font-bold text-muted-foreground">Stylized Map of Ghana</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-4"
          >
            {locations.map((location, index) => (
              <motion.div key={index} variants={itemVariants}>
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <location.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="font-semibold text-lg text-foreground">{location.name}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
