
import { getSupabaseClient } from '@/lib/supabase';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PartnerShowcaseCard } from '../partner-care/(components)/partner-showcase-card';

export const dynamic = 'force-dynamic';

async function getPreferredPartners() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('hospitals')
      .select('*')
      .eq('is_preferred', true)
      .order('name', { ascending: true });

    if (error) {
        console.error("Error fetching preferred partners:", error);
        return [];
    }
    return data;
}

export async function PartnerShowcase() {
  const partners = await getPreferredPartners();

  if (partners.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Connect with Trusted Care
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground">
            Explore our network of preferred partners for confidential, professional health services.
          </p>
        </div>
        
        <div
          className="relative w-full max-w-6xl mx-auto"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          }}
        >
            <Carousel
                opts={{
                align: 'start',
                loop: true,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-4">
                {partners.map((partner) => (
                    <CarouselItem key={partner.id} className="pl-4 basis-full sm:basis-1/2 md:basis-1/2 lg:basis-1/3">
                        <div className="p-1 h-full">
                            <PartnerShowcaseCard partner={hospital as any} />
                        </div>
                    </CarouselItem>
                ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-0 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10" />
                <CarouselNext className="absolute right-0 translate-x-1/2 top-1/2 -translate-y-1/2 z-10" />
            </Carousel>
        </div>
      </div>
    </section>
  );
}
