
import { Building, Hospital, Users } from 'lucide-react';
import Image from 'next/image';

const stats = [
  {
    value: 'Thousands',
    label: 'Served Confidentially',
  },
  {
    value: '4+',
    label: 'Major Campuses Covered',
  },
  {
    value: '10+',
    label: 'Health Partners',
  },
];

export function TrustStats() {
  return (
    <section className="bg-muted py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid items-center gap-8 md:grid-cols-2 lg:gap-16">
          <div className="flex justify-center">
            <Image
              src="https://placehold.co/400x400"
              alt="Students in Ghana"
              width={400}
              height={400}
              className="rounded-xl shadow-lg"
              data-ai-hint="diverse students Ghana"
            />
          </div>
          <div className="space-y-8">
            <div>
              <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Trusted by students and health professionals across Ghana
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Our service is built on a foundation of trust, privacy, and strong community partnerships.
              </p>
            </div>
            <div className="space-y-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-start gap-4">
                   <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl">
                    {stat.value.replace(/\D/g, '') || '✓'}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
