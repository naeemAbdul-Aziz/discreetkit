
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
        
        <div className="relative mt-12 max-w-2xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 h-full w-0.5 bg-border -translate-x-1/2" aria-hidden="true"></div>

          <div className="relative flex flex-col gap-12">
            {howItWorksSteps.slice(0, 4).map((step, index) => (
              <div key={step.step} className="relative flex items-start md:items-center gap-6">
                 {/* Step Circle */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-primary font-bold text-xl z-10 flex-shrink-0">
                  {step.step}
                </div>
                {/* Content */}
                <div className="bg-card p-6 rounded-xl border shadow-sm w-full">
                  <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
