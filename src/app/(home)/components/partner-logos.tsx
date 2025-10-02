/**
 * @file partner-logos.tsx
 * @description a sleek, modern component to display partner logos in a grid.
 *              logos are grayscale by default and turn to color on hover.
 */

import Image from 'next/image';

// partner data, including names and logo urls.
const partners = [
    { name: 'Marie Stopes', logoUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1758223637/marie-stopes-logo_do0j8g.png' },
    { name: 'Top Up Pharmacy', logoUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756318480/topup_x2q874.webp' },
    { name: 'Bedita Pharmacy', logoUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756318479/bedita_ekekhs.png' },
    { name: 'Ernest Chemist', logoUrl: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756318479/ernest_chemist_ebxjug.webp' },
];

export function PartnerLogos() {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
                In Partnership With Trusted Health Providers
            </h2>
        </div>
        <div className="mt-8 grid grid-cols-2 items-center justify-items-center gap-x-8 gap-y-10 sm:grid-cols-4">
          {partners.map((partner) => (
            <div key={partner.name} className="relative h-12 w-36">
              <Image
                src={partner.logoUrl}
                alt={`${partner.name} logo`}
                fill
                className="object-contain grayscale transition-all duration-300 hover:grayscale-0"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
