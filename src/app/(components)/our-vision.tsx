
import { Card, CardContent } from '@/components/ui/card';
import { Target, ShieldCheck, HeartHandshake } from 'lucide-react';

const visionPoints = [
  {
    icon: Target,
    title: "Purpose-Built for Privacy in Ghana",
    description: "DiscreetKit started with a clear goal: to solve a critical problem for young people in Ghana. We saw that the fear of judgment and lack of privacy were preventing many from seeking essential health tests. Our service is designed to remove these barriers, providing a safe and confidential path to health awareness."
  },
  {
    icon: ShieldCheck,
    title: "Technology for Trust & Anonymity",
    description: "Our core mission is to leverage technology to protect your identity. By creating a system with no accounts, no names, and anonymous tracking codes, we remove the friction and anxiety associated with traditional testing. This allows you to focus on your health, not on navigating a complex or intimidating system."
  },
  {
    icon: HeartHandshake,
    title: "A Bridge to Professional Care",
    description: "We are more than just a delivery service; we are a responsible first step. Our work is built on collaboration with trusted hospitals, clinics, and pharmacies. We ensure that if you ever need follow-up, you are connected to professional, confidential, and non-judgmental care from our verified partners."
  }
];

export function OurVision() {
  return (
    <section className="bg-muted py-12 md:py-20">
      <div className="container mx-auto max-w-4xl px-4 md:px-6">
        <div className="text-center">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            The Vision Behind DiscreetKit
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Built to tackle the challenge of <strong>health privacy and access</strong> in Ghana.
          </p>
        </div>

        <div className="mt-12 space-y-8">
          {visionPoints.map((point, index) => (
            <Card key={index} className="bg-background">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <point.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-semibold md:text-xl">{point.title}</h3>
                    <p className="mt-2 text-muted-foreground text-sm md:text-base">{point.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
