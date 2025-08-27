
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { steps } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const currentStep = steps[activeStep];

  useEffect(() => {
    if (isHovered) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000); // Change step every 4 seconds

    return () => clearInterval(interval);
  }, [isHovered]);

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.4, ease: 'easeIn' } },
  };

  const handleStepClick = (index: number) => {
    setActiveStep(index);
    setIsHovered(true);
    setTimeout(() => setIsHovered(false), 5000); // Resume auto-play after 5 seconds
  };

  return (
    <section id="how-it-works" className="bg-background py-12 md:py-24">
      <motion.div 
        className="container mx-auto max-w-5xl px-4 md:px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ staggerChildren: 0.2 }}
      >
        <div className="text-center mb-12">
          <motion.h2 
            className="mt-2 font-headline text-2xl font-bold text-foreground md:text-3xl"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            A Responsible Path to Your Health Answers
          </motion.h2>
          <motion.p 
            className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            Get your results in 4 simple, private, and secure steps.
          </motion.p>
        </div>

        <div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Left: Step Selector */}
          <motion.div 
            className="flex md:flex-col md:justify-center gap-4"
            variants={{ hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } }}
            transition={{ duration: 0.5 }}
          >
             <div className="flex flex-row md:flex-col justify-between md:justify-start md:gap-y-4 w-full">
              {steps.map((step, index) => (
                <button
                  key={step.number}
                  onClick={() => handleStepClick(index)}
                  className="text-left w-full p-3 rounded-lg transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary text-xl font-bold transition-colors bg-primary/10 text-primary">
                      {step.number}
                    </div>
                    <span className="font-semibold text-sm hidden sm:inline">{step.title}</span>
                  </div>
                  <div className="relative h-1 mt-3 rounded-full overflow-hidden bg-muted">
                    <AnimatePresence>
                      {activeStep === index && (
                        <motion.div
                          className="absolute left-0 top-0 h-full bg-primary"
                          initial={{ width: '0%' }}
                          animate={{ width: '100%' }}
                          exit={{ width: '0%' }}
                          transition={{ duration: 4, ease: 'linear' }}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right: Step Content */}
          <motion.div 
            className="md:col-span-2"
            variants={{ hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden bg-card p-6 md:p-8 min-h-[450px] shadow-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="flex flex-col h-full"
                >
                  <CardContent className="p-0 flex flex-col flex-grow">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-shrink-0 bg-primary/10 p-4 rounded-lg">
                            <currentStep.icon className="h-10 w-10 text-primary" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl md:text-2xl font-bold">{currentStep.title}</h3>
                            <p className="text-muted-foreground text-sm mt-2">{currentStep.description}</p>
                        </div>
                    </div>
                     <div className="border-t pt-6 mt-6 flex-grow">
                        <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-4">Key Details</h4>
                        <ul className="space-y-3">
                            {currentStep.details.map((detail, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <ArrowRight className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                                    <span className="text-sm text-muted-foreground">{detail}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                  </CardContent>
                </motion.div>
              </AnimatePresence>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
