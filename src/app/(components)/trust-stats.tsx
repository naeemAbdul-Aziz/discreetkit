
import { Building, Hospital, Users } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: 'Thousands',
    label: 'Served Confidentially',
  },
  {
    icon: Building,
    value: '4+',
    label: 'Major Campuses',
  },
  {
    icon: Hospital,
    value: '10+',
    label: 'Health Partners',
  },
];

export function TrustStats() {
  return (
    <section className="bg-background py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="max-w-md">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Trusted by students and health professionals across Ghana
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <stat.icon className="mx-auto h-10 w-10 text-primary" />
                  <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
