
'use client';

import { features } from '@/lib/data';
import { motion } from 'framer-motion';
import Image from 'next/image';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};


export function FeatureGrid() {
  return (
    <section className="bg-muted py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            A Service Designed for You
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We've built every part of our service with your <strong>privacy, convenience, and well-being</strong> in mind.
          </p>
        </div>
        <motion.div 
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => (
             <motion.div key={index} variants={itemVariants}>
                <motion.div 
                    className="h-full transform transition-transform duration-300 bg-background border p-6 rounded-xl flex flex-col items-start gap-4 overflow-hidden"
                    whileHover={{ scale: 1.05, y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
                >
                    <Image
                        src={feature.image}
                        alt={feature.title}
                        width={400}
                        height={250}
                        className="w-full h-48 object-cover rounded-md -mt-6 -mx-6"
                        data-ai-hint={feature.dataAiHint}
                    />
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
