
import { howItWorksSteps } from '@/lib/data';
import { ArrowRight } from 'lucide-react';

export function HowItWorks() {
  return (
    <section className="bg-muted py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Simple, Private, and Secure
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Getting your self-test kit is a straightforward and confidential process.
          </p>
        </div>
        <div className="relative mt-12">
            <div className="absolute left-1/2 top-4 hidden h-full w-0.5 -translate-x-1/2 bg-border md:block" aria-hidden="true" />

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
            {howItWorksSteps.map((step, index) => (
              <div 
                key={step.step} 
                className={`relative flex items-center gap-6 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
              >
                <div className="hidden h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground md:flex">
                    <span className="text-lg font-bold">{step.step}</span>
                </div>
                <div className="flex-1 rounded-lg border bg-card p-6 shadow-sm">
                  <h3 className="mb-2 text-xl font-semibold">
                    <span className="md:hidden mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {step.step}
                    </span>
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
