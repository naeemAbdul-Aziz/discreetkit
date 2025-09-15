
import Image from 'next/image';
import { partners } from '@/lib/data';

export function PartnerLogos() {
  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Trusted by leading health partners and student bodies
        </h2>
        
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 md:gap-x-12 md:gap-y-6">
            {partners.map((partner) => (
                <div key={partner.id} className="p-2">
                    <Image
                    src={partner.logoUrl}
                    alt={`${partner.name} Logo`}
                    width={100}
                    height={35}
                    className="h-auto w-auto aspect-[3/1] object-contain grayscale transition-all hover:grayscale-0"
                    data-ai-hint="logo health"
                    />
                </div>
            ))}
        </div>
      </div>
    </section>
  );
}
