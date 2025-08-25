
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { discounts, partners } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function DiscountsPage() {
  const srcPartners = partners.filter(p => p.type === 'src');

  return (
    <div className="bg-muted">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4">Student-First Pricing</Badge>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Student & Campus Discounts
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We believe in accessible health for students. We've partnered with SRCs and offer special delivery rates for major campuses in Accra.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          {discounts.map((discount) => (
            <Card key={discount.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{discount.campus}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">
                  {discount.discount > 0 ? `GHS ${discount.discount.toFixed(2)} Off Delivery` : "Free Delivery"}
                </p>
                <p className="mt-2 text-muted-foreground">{discount.notes}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-20 text-center">
            <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                In Partnership With Your SRC
            </h2>
            <p className="mt-2 text-md text-muted-foreground">
                We collaborate with student leadership to make our services even more accessible.
            </p>
            <div className="mt-8 flex justify-center items-center gap-8">
                {srcPartners.map(p => (
                    <div key={p.id}>
                        <Image src={p.logoUrl} alt={`${p.name} logo`} width={120} height={40} className="grayscale" data-ai-hint="logo organization"/>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}
