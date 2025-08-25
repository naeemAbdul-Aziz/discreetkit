
'use client';

import { howItWorksSteps } from '@/lib/data';
import { motion } from 'framer-motion';
import { useIsMobile } from '@/hooks/use-mobile';
import Image from 'next/image';

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const itemVariants = (fromLeft: boolean, isMobile: boolean) => ({
    hidden: { opacity: 0, x: isMobile ? -50 : (fromLeft ? -50 : 50) },
    visible: { 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.5, ease: "easeInOut" }
    },
});

export function HowItWorks() {
  const isMobile = useIsMobile();
  return (
    <section className="bg-muted py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works: A Simple 4-Step Process
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            We've made getting a self-test kit straightforward and completely private. Follow these simple steps to take control of your health.
          </p>
        </div>
        
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div 
                className="relative mt-12 max-w-4xl mx-auto"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={containerVariants}
            >
              {/* Vertical line */}
              <div className="absolute left-6 md:left-1/2 top-0 h-full w-0.5 bg-border -translate-x-1/2" aria-hidden="true"></div>

              <div className="relative flex flex-col gap-12">
                {howItWorksSteps.slice(0, 4).map((step, index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <motion.div 
                        key={step.step} 
                        className="relative flex items-start gap-6 md:gap-8"
                        variants={itemVariants(isEven, isMobile)}
                    >
                      <div className={`flex items-start gap-6 md:gap-8 w-full ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                         {/* Step Circle */}
                        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary font-bold text-xl z-10 flex-shrink-0">
                          {step.step}
                        </div>
                        {/* Content */}
                        <div className="bg-card p-6 rounded-xl border shadow-sm w-full md:w-[calc(50%-2.5rem)]">
                          <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                          <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            <div className="flex items-center justify-center">
              <Image
                src="https://placehold.co/300x200"
                alt="Discreet plain brown box"
                width={300}
                height={200}
                className="rounded-xl shadow-lg"
                data-ai-hint="plain box"
              />
            </div>
        </div>
      </div>
    </section>
  );
}
