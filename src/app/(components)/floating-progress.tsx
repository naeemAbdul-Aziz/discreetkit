
'use client';

import { motion } from 'framer-motion';
import { steps } from '@/lib/data';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

type FloatingProgressProps = {
  activeStep: number;
};

export function FloatingProgress({ activeStep }: FloatingProgressProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return null;
  }

  return (
    <div className="pointer-events-none sticky top-0 flex h-screen w-full items-center">
      <div className="container relative mx-auto h-full max-w-5xl px-4 md:px-6">
        <div className="absolute left-10 top-1/2 h-1/2 w-full -translate-y-1/2 transform">
          <div className="relative h-full w-px bg-border">
            <motion.div
              className="absolute left-0 top-0 w-px bg-primary"
              initial={{ height: '0%' }}
              animate={{ height: `${(activeStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          <div className="absolute -left-px top-0 flex h-full w-px flex-col justify-between">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ scale: 1 }}
                animate={{ scale: activeStep >= index ? 1.1 : 1 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border-2 bg-background transition-colors',
                  activeStep >= index ? 'border-primary' : 'border-border'
                )}
              >
                <div
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full transition-colors',
                    activeStep >= index ? 'bg-primary' : 'bg-muted'
                  )}
                >
                  <span
                    className={cn(
                      'font-bold transition-colors',
                      activeStep >= index
                        ? 'text-primary-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {step.number}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
