
import Image from 'next/image';
import { Target, ShieldCheck, HeartHandshake } from 'lucide-react';

const visionPoints = [
  {
    icon: Target,
    title: "A Service Born from Understanding",
    description: "DiscreetKit isn't just a business; it's a direct response to a real-world problem we saw affecting young people across Ghana. We listened to the quiet concerns and understood the powerful barriers—the fear of being judged, the anxiety of bumping into someone you know, the lack of a truly private option for essential health testing.",
    details: "That's why we built this service from the ground up, with your privacy as our unbreakable foundation. We believe everyone deserves a safe space to take control of their health, and our mission is to provide that space, no questions asked.",
    imageUrl: "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757944590/medium-shot-women-holding-each-other_yqjad1.jpg",
    imageHint: "empathy support friends",
  },
  {
    icon: ShieldCheck,
    title: "Technology as Your Shield",
    description: "In a world where data is everything, we use technology not to collect, but to protect. Our entire system is engineered for anonymity. We intentionally designed it without user accounts, name requirements, or email sign-ups. Your order is tied to a unique, anonymous code—not your identity.",
    details: "This isn't just a feature; it's our promise. By stripping away the need for personal data, we eliminate the risk and anxiety. You can focus entirely on your health, confident that your privacy is shielded by a system built to forget you.",
    imageUrl: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxzb21lb25lJTIwdXNpbmclMjBsYXB0b3AlMjBwcml2YXRlbHl8ZW58MHx8fHwxNzU2Mzk5MDQwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    imageHint: "person using laptop privately",
  },
  {
    icon: HeartHandshake,
    title: "More Than a Kit—A Bridge to Care",
    description: "A self-test is just the first step. True peace of mind comes from knowing what to do next. We see ourselves as a responsible bridge, not just a delivery service. That's why we've built strong partnerships with trusted hospitals, clinics, and professional counselors.",
    details: "If your result is positive, we don't leave you stranded. We provide a warm, confidential connection to our partners who offer discounted, non-judgmental follow-up care. Your well-being is our ultimate goal, and we are committed to supporting you on every step of your health journey.",
    imageUrl: "https://images.unsplash.com/photo-1576091160550-2173dba9996a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxoZWFsdGhjYXJlJTIwcHJvZmVzc2lvbmFsJTIwY29uc3VsdGluZ3xlbnwwfHx8fDE3NTYzOTU4ODF8MA&ixlib=rb-4.1.0&q=80&w=1080",
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
    <section className="bg-background py-12 md:py-24">
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        <div className="text-center">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            The Vision Behind DiscreetKit
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base text-muted-foreground md:text-lg">
            We're not just delivering test kits. We're delivering <strong className="text-primary">privacy, dignity, and peace of mind.</strong>
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
                  className="rounded-2xl object-cover shadow-xl"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  data-ai-hint={point.imageHint}
                  placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(400, 300))}`}
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
                <p className="text-base text-foreground">
                    {point.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
