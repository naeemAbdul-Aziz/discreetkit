

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { partners } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Loader2 } from 'lucide-react';
import { Suspense } from 'react';

function PartnersContent() {
  const partnerTypes = ['hospital', 'pharmacy', 'src'];
  const categorizedPartners = partnerTypes.map(type => ({
    type,
    title: `${type.charAt(0).toUpperCase() + type.slice(1)}s`,
    list: partners.filter(p => p.type === type),
  }));

  return (
    <>
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Our Trusted Partners
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We collaborate with reputable health institutions, pharmacies, and student bodies to provide a seamless and trustworthy service.
          </p>
        </div>

        <div className="mt-16 space-y-16">
          {categorizedPartners.map(category => (
            <div key={category.type}>
              <h2 className="mb-8 text-center font-headline text-3xl font-bold">{category.title}</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {category.list.map((partner) => (
                  <Link href={partner.url} key={partner.id} target="_blank" rel="noopener noreferrer">
                    <Card className="group h-full overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                      <CardHeader className="p-0">
                         <div className="relative h-40 w-full bg-muted">
                           <Image 
                              src="https://picsum.photos/400/200"
                              alt={`${partner.name} background`} 
                              fill
                              className="object-cover grayscale group-hover:grayscale-0 transition-all" 
                              data-ai-hint="organization building"
                            />
                         </div>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl">{partner.name}</CardTitle>
                            <Badge variant="outline" className="mt-2 capitalize">{partner.type}</Badge>
                          </div>
                          <ArrowUpRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:rotate-45" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
    </>
  )
}

function PartnersLoading() {
    return (
        <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
    )
}

export default function PartnersPage() {
  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-12 md:py-20 md:px-6">
          <Suspense fallback={<PartnersLoading />}>
            <PartnersContent />
          </Suspense>
      </div>
    </div>
  );
}
