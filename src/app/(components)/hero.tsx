
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

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


export function Hero() {
  return (
    <section className="bg-muted py-12 md:py-20 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Content Column */}
            <div
                className="text-center md:text-left"
            >
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                    Private Health Answers, <span className="font-light italic text-primary">Delivered Discreetly.</span>
                </h1>
                <p className="mt-4 max-w-md mx-auto md:mx-0 text-base text-muted-foreground">
                    DiscreetKit empowers you to take control of your health with confidential, WHO-approved self-test kits delivered right to your door.
                </p>
                
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                    <Button asChild size="lg" className="w-full sm:w-auto">
                        <Link href="/#products">
                        View Test Kits
                        <ArrowRight />
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Right Image Column */}
            <div 
                className="relative flex items-center justify-center min-h-[350px] md:min-h-[450px]"
            >
                <Image
                    src="https://res.cloudinary.com/dzfa6wqb8/image/upload/w_500,h_500,c_fill,q_auto,f_auto/v1756313856/woman_smiling_package_g5rnqh.jpg"
                    alt="A happy woman receiving a delivery box, representing discreet and satisfying service"
                    width={500}
                    height={500}
                    priority
                    className="object-contain rounded-3xl shadow-2xl z-10 w-full max-w-md h-auto"
                    data-ai-hint="happy woman box"
                    placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(500, 500))}`}
                />
            </div>
        </div>
      </div>
    </section>
  );
}
