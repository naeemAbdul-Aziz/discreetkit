/**
 * @file partner-logos.tsx
 * @description a sleek, modern component to display partner logos in a grid.
 *              logos are grayscale by default and turn to color on hover.
 */

import Image from 'next/image';
import { Marquee } from '@/components/ui/marquee';

// partner data, including names and logo urls.
const partners = [
    { name: 'Marie Stopes', logoUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1759415106/marie_stopes_logo_zqmikw.webp' },
    { name: 'Top Up Pharmacy', logoUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756318480/topup_x2q874.webp' },
    { name: 'Bedita Pharmacy', logoUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756318479/bedita_ekekhs.png' },
    { name: 'Ernest Chemist', logoUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756318479/ernest_chemist_ebxjug.webp' },
];

export function PartnerLogos() {
  return (
    <section className="py-12 md:py-16 bg-background" aria-labelledby="partners-heading">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
            <h2 id="partners-heading" className="text-lg font-semibold tracking-tight text-foreground">
                In Partnership With Trusted Health Providers
            </h2>
        </div>
        <div className="mt-8" role="region" aria-label="Partner logos carousel" aria-roledescription="carousel">
          <Marquee ariaLabel="Trusted partners">
            {partners.map((partner) => (
              <div key={partner.name} className="relative h-10 w-28 md:h-12 md:w-36" aria-label={partner.name}>
                <Image
                  src={partner.logoUrl}
                  alt={`${partner.name} logo`}
                  fill
                  className="object-contain grayscale transition-all duration-300 hover:grayscale-0"
                  sizes="(max-width: 768px) 30vw, 15vw"
                />
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
