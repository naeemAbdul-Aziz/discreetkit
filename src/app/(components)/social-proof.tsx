
import { Star } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { partners } from '@/lib/data';

export function SocialProof() {
  return (
    <section className="py-12 md:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-8">
            <blockquote className="text-2xl font-semibold text-foreground italic leading-snug">
              "This is the service I wish I had in university. It's discreet, fast, and removes all the anxiety from the process."
            </blockquote>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Trusted by leading health partners and student bodies
              </p>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                {partners.slice(0, 4).map((partner) => (
                  <div key={partner.id}>
                    <Image
                      src="https://placehold.co/130x40"
                      alt={`${partner.name} Logo`}
                      width={100}
                      height={30}
                      className="aspect-[3/1] object-contain grayscale transition-all hover:grayscale-0"
                      data-ai-hint="media logo"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Card className="bg-primary text-primary-foreground w-full max-w-sm p-8 text-center shadow-xl">
              <CardContent className="p-0">
                <h3 className="text-4xl font-bold">
                  Over 1,600
                </h3>
                <p className="text-lg mb-2">Five Star Reviews</p>
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 fill-current text-yellow-400" />
                  ))}
                </div>
                <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
                    Read our reviews
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
}
