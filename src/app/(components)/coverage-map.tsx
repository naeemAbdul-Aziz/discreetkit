
import { MapPin, Building, Anchor } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const coverageAreas = [
  {
    name: 'Greater Accra',
    description: 'Full coverage including all major suburbs and university campuses (UG, UPSA, GIMPA, etc).',
    icon: MapPin,
  },
  {
    name: 'Kumasi',
    description: 'Delivery available within the city and to KNUST campus.',
    icon: Building,
  },
  {
    name: 'Cape Coast',
    description: 'Serving the city and students at the University of Cape Coast (UCC).',
    icon: Anchor,
  },
];

export function CoverageMap() {
  return (
    <section className="py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Serving You Across Ghana
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground md:text-lg">
            Discreet delivery and trusted pharmacy pickups, right where you are. We’re growing fast — here’s where you’ll find us today.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8 max-w-5xl mx-auto">
          {coverageAreas.map((area) => (
            <Card key={area.name} className="flex flex-col items-center text-center p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                <area.icon className="h-8 w-8 text-primary" />
              </div>
              <CardHeader className="p-0">
                <CardTitle>{area.name}</CardTitle>
              </CardHeader>
              <CardDescription className="mt-2 text-sm">
                {area.description}
              </CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
