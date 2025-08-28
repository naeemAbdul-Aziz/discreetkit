
import { MessageSquare, Star } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { partners } from '@/lib/data';
import { PartnerLogos } from './partner-logos';

export function SocialProof() {
  return (
    <section className="py-12 md:py-24 bg-muted">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center p-4">
          
          <div className="space-y-8">
            <blockquote className="text-2xl font-semibold text-foreground italic leading-snug">
              "This is the service I wish I had in university. It's discreet, fast, and removes all the anxiety from the process."
            </blockquote>
             <PartnerLogos />
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
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    Read our reviews
                    <MessageSquare />
                </Button>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
}
