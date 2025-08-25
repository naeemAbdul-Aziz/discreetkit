
import { Building, Hospital, Users } from 'lucide-react';

const stats = [
  {
    icon: Building,
    value: '4+',
    label: 'Major Campuses Served',
  },
  {
    icon: Hospital,
    value: '10+',
    label: 'Partner Hospitals & Pharmacies',
  },
  {
    icon: Users,
    value: 'Thousands',
    label: 'Served Confidentially',
  },
];

export function TrustStats() {
  return (
    <section className="bg-muted py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <stat.icon className="h-10 w-10 text-green-600 mb-3" />
              <p className="text-4xl font-bold text-foreground">{stat.value}</p>
              <p className="text-md text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
