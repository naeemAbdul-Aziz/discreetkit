/**
 * @file partner-logos.tsx
 * @description a sleek, modern component to display partner logos in a grid.
 */

"use client";

import Image from "next/image";

const partners = [
  {
    name: "Marie Stopes",
    logo: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1758223637/marie-stopes-logo_do0j8g.png",
  },
  {
    name: "Ghana Health Service",
    logo: "https://placehold.co/200x80/transparent/111?text=Ghana+Health",
  },
  {
    name: "Planned Parenthood",
    logo: "https://placehold.co/200x80/transparent/111?text=Planned+Parenthood",
  },
  {
    name: "World Health Organization",
    logo: "https://placehold.co/200x80/transparent/111?text=WHO",
  },
];

export function PartnerLogos() {
  return (
    <div className="py-10 bg-background border-y border-border/40">
      <div className="max-w-screen-xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            Trusted by Global Health Leaders
          </p>
        </div>
        <div className="flex justify-center">
          <ul className="inline-grid grid-cols-2 gap-x-10 gap-y-8 md:gap-x-16 md:grid-cols-4 lg:grid-cols-4">
            {partners.map((partner, i) => (
              <li key={i} className="flex items-center justify-center">
                <div className="relative h-16 w-32 md:w-40 grayscale opacity-60 transition-all duration-300 hover:grayscale-0 hover:opacity-100">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

