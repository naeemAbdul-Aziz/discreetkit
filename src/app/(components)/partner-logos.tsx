
import Image from 'next/image';
import { partners } from '@/lib/data';

export function PartnerLogos() {
  // We duplicate the partners to create a seamless looping effect.
  const extendedPartners = [...partners, ...partners];

  return (
    <section className="py-12 md:py-16 bg-muted">
      <div className="container mx-auto px-4 md:px-6">
        <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Our Network of Health & Student Partners
        </h2>
        
        <div
          className="group relative w-full max-w-4xl mx-auto overflow-hidden"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 20%, black 80%, transparent)',
          }}
        >
          <div className="flex animate-marquee group-hover:[animation-play-state:paused]">
            {extendedPartners.map((partner, index) => (
              <div key={`${partner.id}-${index}`} className="flex-shrink-0 p-4 mx-4">
                <Image
                  src={partner.logoUrl}
                  alt={`${partner.name} Logo`}
                  width={120}
                  height={40}
                  className="h-10 w-auto object-contain grayscale"
                  data-ai-hint="logo health"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
