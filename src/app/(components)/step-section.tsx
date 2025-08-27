
'use client';

import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import type { Step } from '@/lib/data';

type StepSectionProps = {
  step: Step;
  index: number;
  onVisible: () => void;
};

export function StepSection({ step, index, onVisible }: StepSectionProps) {
  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView) {
      onVisible();
    }
  }, [inView, onVisible]);

  return (
    <div ref={ref} className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
      <div className={`flex items-center justify-center ${index % 2 === 1 ? 'md:order-last' : ''}`}>
        <div className="relative flex h-full min-h-[350px] w-full items-center justify-center p-8">
            <step.icon className="h-48 w-48 text-primary/10" strokeWidth={0.5} />
             <div className="absolute flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <step.icon className="h-12 w-12 text-primary" strokeWidth={1.5} />
            </div>
        </div>
      </div>
      <div className="flex flex-col justify-center">
        <Card className="bg-card p-6 shadow-lg md:p-8">
          <CardContent className="p-0">
            <h3 className="text-xl font-bold md:text-2xl">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            <div className="mt-6 border-t pt-6">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Key Details
              </h4>
              <ul className="space-y-3">
                {step.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <ArrowRight className="mt-1 h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="text-sm text-muted-foreground">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
