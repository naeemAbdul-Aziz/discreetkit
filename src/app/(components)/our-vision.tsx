import Image from 'next/image';
import { Target, ShieldCheck, HeartHandshake } from 'lucide-react';

const visionPoints = [
  {
    icon: Target,
    title: "Born from Understanding",
    description: "DiscreetKit is a direct response to a real-world problem. We saw the fear of judgment and lack of privacy in accessing health products, so we built a service from the ground up with your anonymity as our foundation.",
    imageUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757944590/medium-shot-women-holding-each-other_yqjad1.jpg",
    imageHint: "empathy support friends",
  },
  {
    icon: ShieldCheck,
    title: "Technology as a Shield",
    description: "Our system is engineered to protect, not collect. We intentionally designed it without accounts or name requirements. Your order is tied to an anonymous code, not your identity, eliminating risk and anxiety so you can focus on your health.",
    imageUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757944636/hug_soldier_empathy_oxnes6.jpg",
    imageHint: "private secure online",
  },
  {
    icon: HeartHandshake,
    title: "A Bridge to Professional Care",
    description: "Getting a product is just the first step. We see ourselves as a responsible bridge to what comes next. Through our partnerships with trusted hospitals and clinics, we provide a warm, confidential connection to non-judgmental follow-up care.",
    imageUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757945982/group-people-sitting-facility-waiting-area-reading-health-insurance-fliers-waiting-physician-patients-health-center-having-checkup-appointments-cure-disease_fivf0l.jpg",
    imageHint: "healthcare professional consulting",
  }
];

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


export function OurVision() {
  return (
    <section className="py-12 md:py-24">
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        <div className="text-center">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            The Vision Behind DiscreetKit
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
            We're not just delivering products. We're delivering <strong className="text-primary">privacy, dignity, and peace of mind.</strong>
          </p>
        </div>

        <div className="mt-16 space-y-16 md:space-y-24">
          {visionPoints.map((point, index) => (
            <div
              key={index}
              className="grid items-center gap-8 md:grid-cols-2 md:gap-12"
            >
              <div className={`relative aspect-square h-full w-full max-w-md justify-self-center md:aspect-[4/3] ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <Image
                  src={point.imageUrl}
                  alt={point.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="rounded-2xl object-cover shadow-xl"
                  data-ai-hint={point.imageHint}
                  placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(600, 800))}`}
                />
              </div>
              
              <div className={`space-y-4 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                 <div className="inline-flex items-center gap-3 rounded-full bg-primary/10 px-4 py-2">
                    <point.icon className="h-6 w-6 text-primary" />
                    <h3 className="text-lg font-bold text-primary">{point.title}</h3>
                </div>
                <p className="text-base text-muted-foreground md:text-lg">
                    {point.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
