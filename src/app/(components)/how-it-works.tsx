
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { steps } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const currentStep = steps[activeStep];

  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeIn' } },
  };

  return (
    <section id="how-it-works" className="bg-background py-12 md:py-24">
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="mt-2 font-headline text-2xl font-bold text-foreground md:text-3xl">
            A Responsible Path to Your Health Answers
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
            Get your results in 4 simple, private, and secure steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Left: Step Selector */}
          <div className="flex flex-row md:flex-col justify-center md:justify-start gap-4">
            {steps.map((step, index) => (
              <button
                key={step.number}
                onClick={() => setActiveStep(index)}
                className={cn(
                  'flex-1 md:flex-none p-4 rounded-lg text-left transition-all duration-300 border-2',
                  activeStep === index
                    ? 'bg-primary/10 border-primary shadow-lg'
                    : 'bg-muted/50 border-transparent hover:bg-primary/5'
                )}
              >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "flex h-8 w-8 md:h-10 md:w-10 flex-shrink-0 items-center justify-center rounded-full text-lg md:text-xl font-bold transition-colors",
                        activeStep === index ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    )}>
                        {step.number}
                    </div>
                    <span className="hidden sm:inline font-semibold text-sm md:text-base">{step.title}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Right: Step Content */}
          <div className="md:col-span-2">
            <Card className="overflow-hidden bg-card p-6 md:p-8 min-h-[450px] shadow-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <CardContent className="p-0 flex flex-col h-full">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-shrink-0 bg-primary/10 p-4 rounded-lg hidden md:block">
                            <currentStep.icon className="h-10 w-10 text-primary" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl md:text-2xl font-bold">{currentStep.title}</h3>
                            <p className="text-muted-foreground text-sm mt-2">{currentStep.description}</p>
                        </div>
                    </div>
                     <div className="border-t pt-6 mt-6">
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
          </div>
        </div>
      </div>
    </section>
  );
}
