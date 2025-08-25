
'use client';

import { features } from '@/lib/data';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

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
    <section className="bg-muted py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Our Science-Backed Products
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We've built every part of our service with your <strong>privacy, convenience, and well-being</strong> in mind.
          </p>
        </div>
        <motion.div 
          className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature, index) => (
             <motion.div key={index} variants={itemVariants}>
                <Card className="h-full transform transition-transform duration-300 hover:-translate-y-2">
                    <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <feature.icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                    </CardContent>
                </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
