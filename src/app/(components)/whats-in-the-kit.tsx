
import { Card, CardContent } from '@/components/ui/card';
import { TestTube, Droplet, FileText, Package, FlaskConical } from 'lucide-react';

const kitContents = [
  {
    icon: TestTube,
    name: 'Test Cassette',
    description: 'The core of the kit, designed for clear and accurate readings.',
  },
  {
    icon: Droplet,
    name: 'Buffer Solution',
    description: 'A sterile solution required to process the test correctly.',
  },
    {
    icon: FlaskConical,
    name: 'Alcohol Pad',
    description: 'For cleaning the sample area to ensure a sterile process.',
  },
  {
    icon: Droplet,
    name: 'Sterile Lancet',
    description: 'A tiny, single-use lancet for a quick and virtually painless sample collection.',
  },
  {
    icon: FileText,
    name: 'Instruction Manual',
    description: 'Simple, step-by-step visual guide to walk you through the process.',
  },
  {
    icon: Package,
    name: 'Discreet Pouch',
    description: 'Your entire kit comes inside a plain, unbranded pouch for privacy.',
  },
];

export function WhatsInTheKit() {
  return (
    <section className="bg-muted py-12 md:py-24">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        <div className="text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Unbox Confidence: <span className="text-primary">What's Inside</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Each DiscreetKit is equipped with everything you need for a simple and reliable self-test experience.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
          {kitContents.map((item, index) => (
            <Card key={index} className="bg-background text-center">
              <CardContent className="p-6">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">{item.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
