
import Image from 'next/image';
import { howItWorksSteps } from '@/lib/data';

export function HowItWorks() {
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
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {howItWorksSteps.slice(0,4).map((step) => (
            <div key={step.step} className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary font-bold text-xl">
                {step.step}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
