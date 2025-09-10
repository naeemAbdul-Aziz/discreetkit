
import { CheckCircle } from 'lucide-react';
import Image from 'next/image';

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#f0f0f0" offset="20%" />
      <stop stop-color="#e0e0e0" offset="50%" />
      <stop stop-color="#f0f0f0" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#f0f0f0" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);


export function CoverageMap() {
  const mapUrl = "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756555567/stylized-ghana-map_f2s6xl.png";

  return (
    <section className="bg-muted py-12 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            Serving You Across Ghana
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-base text-muted-foreground md:text-lg">
            Discreet delivery and trusted pharmacy pickups, right where you are. We’re growing fast — here’s where you’ll find us today.
          </p>
        </div>

        <div className="mt-12">
           <div className="relative w-full max-w-5xl mx-auto aspect-video overflow-hidden rounded-2xl shadow-xl border">
             <Image 
                src={mapUrl}
                alt="Stylized map of Ghana showing DiscreetKit delivery locations including Accra, Kumasi, and Cape Coast"
                fill
                className="object-contain p-4 md:p-8"
                data-ai-hint="ghana map stylized"
                placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(1280, 720))}`}
             />
             <div className="absolute inset-x-0 bottom-4 flex justify-center">
                 <div className="flex items-center gap-2 rounded-full bg-background/80 p-2 pl-3 pr-4 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <p>Now delivering across Ghana</p>
                 </div>
             </div>
           </div>
        </div>
      </div>
    </section>
  );
}
