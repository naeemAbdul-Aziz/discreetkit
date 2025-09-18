
import { partners } from '@/lib/data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function PartnersPage() {
  return (
    <div className="bg-muted">
      <div className="container mx-auto px-4 py-12 md:px-6 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Our Network of Trusted Partners
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
              We've partnered with respected health facilities and student bodies to ensure you have access to confidential, professional, and discounted follow-up care when you need it.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {partners.map((partner) => (
              <Card key={partner.id} className="flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-4 transition-shadow hover:shadow-lg">
                <div className="relative flex h-32 items-center justify-center overflow-hidden bg-white p-4 rounded-lg">
                  <Image
                    src={partner.logoUrl}
                    alt={`${partner.name} Logo`}
                    width={150}
                    height={60}
                    className="object-contain"
                  />
                </div>
                <div className="flex flex-grow flex-col pt-4 text-left">
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-foreground leading-tight">{partner.name}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{partner.description}</p>
                  </div>
                  
                  <div className="mt-6 flex flex-col space-y-3">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                        <span>{partner.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button asChild variant="outline" size="sm">
                            <Link href={`tel:${partner.phone}`}>
                                <Phone className="mr-2 h-4 w-4" />
                                Call Now
                            </Link>
                        </Button>
                         <Button asChild variant="secondary" size="sm">
                            <Link href={partner.mapUrl || '#'} target="_blank" rel="noopener noreferrer">
                                <MapPin className="mr-2 h-4 w-4" />
                                Get Directions
                            </Link>
                        </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
           <Card className="mt-12 bg-primary/10 border-primary/20">
                <CardContent className="p-6">
                    <div className="text-center">
                        <h3 className="font-bold text-lg text-primary">A Note on Confidentiality</h3>
                        <p className="text-muted-foreground text-sm mt-2">
                            When you contact our partners, simply mention you were referred by **DiscreetKit**. This will ensure you receive the appropriate discounted and confidential service. Your privacy is their priority as much as it is ours.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
