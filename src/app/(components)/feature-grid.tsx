
'use client';

import { features } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInView } from 'react-intersection-observer';
import { cn } from '@/lib/utils';

export function FeatureGrid() {
  return (
    <section className="bg-background py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            A Service Designed for You
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We've built every part of our service with your privacy, convenience, and well-being in mind.
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ feature, index }: { feature: (typeof features)[0], index: number }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div
      ref={ref}
      className={cn(
        'opacity-0 transition-all duration-500 ease-out',
        inView ? 'animate-stagger-in' : 'translate-y-10'
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
        <Card className="h-full transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
        <CardHeader className="flex flex-row items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
            <feature.icon className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle>{feature.title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">{feature.description}</p>
        </CardContent>
        </Card>
    </div>
  );
}
