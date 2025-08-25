
import { Building, Hospital, Users } from 'lucide-react';

const stats = [
  {
    icon: Building,
    value: '4+',
    label: 'Major Campuses Served',
    description: 'Delivering privacy and peace of mind across major universities in Ghana.'
  },
  {
    icon: Hospital,
    value: '10+',
    label: 'Partner Hospitals & Pharmacies',
    description: 'A trusted network for support, follow-up care, and convenient pickup locations.'
  },
  {
    icon: Users,
    value: 'Thousands',
    label: 'Served Confidentially',
    description: "Empowering thousands to take control of their health without compromise."
  },
];

export function TrustStats() {
  return (
    <section className="bg-muted py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 rounded-lg bg-background shadow-sm">
              <stat.icon className="h-10 w-10 text-primary mb-4" />
              <p className="text-4xl font-bold text-foreground">{stat.value}</p>
              <p className="text-lg font-semibold text-foreground mt-2">{stat.label}</p>
              <p className="text-sm text-muted-foreground mt-2">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
