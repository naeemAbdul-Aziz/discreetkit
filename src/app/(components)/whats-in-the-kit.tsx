import { Card } from '@/components/ui/card';
import { TestTube, Droplet, FileText, Package, FlaskConical, Plus } from 'lucide-react';
import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const kitContents = [
  {
    icon: TestTube,
    name: 'Test Cassette',
    description: 'The core of the kit, designed for clear and accurate readings.',
    position: { top: '35%', left: '30%' },
  },
  {
    icon: Droplet,
    name: 'Buffer Solution',
    description: 'A sterile solution required to process the test correctly.',
    position: { top: '60%', left: '15%' },
  },
  {
    icon: FlaskConical,
    name: 'Alcohol Pad',
    description: 'For cleaning the sample area to ensure a sterile process.',
    position: { top: '20%', left: '60%' },
  },
  {
    icon: Droplet,
    name: 'Sterile Lancet',
    description: 'A tiny, single-use lancet for a quick and virtually painless sample collection.',
    position: { top: '75%', left: '40%' },
  },
  {
    icon: FileText,
    name: 'Instruction Manual',
    description: 'Simple, step-by-step visual guide to walk you through the process.',
    position: { top: '50%', left: '75%' },
  },
  {
    icon: Package,
    name: 'Discreet Pouch',
    description: 'Your entire kit comes inside a plain, unbranded pouch for privacy.',
    position: { top: '80%', left: '70%' },
  },
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


export function WhatsInTheKit() {
  return (
    <section className="py-12 md:py-24">
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        <div className="text-center">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            What's Inside the Box?
          </h2>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Each DiscreetKit is equipped with everything you need for a simple and reliable self-test experience.
          </p>
        </div>

        <div className="mt-12">
            <TooltipProvider delayDuration={100}>
                 <Card className="relative aspect-video w-full max-w-4xl mx-auto overflow-hidden shadow-lg">
                    <Image
                        src="https://images.unsplash.com/photo-1583324113620-910f24a2571b?w=1080&h=608&fit=crop&q=75"
                        alt="DiscreetKit contents flat lay including test cassette, buffer solution, lancet and alcohol pad."
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 80vw"
                        data-ai-hint="medical kit flatlay"
                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(1080, 608))}`}
                    />
                    <div className="absolute inset-0 bg-black/10" />

                    {kitContents.map((item) => (
                        <Tooltip key={item.name}>
                            <TooltipTrigger asChild>
                                <button 
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                    style={{ top: item.position.top, left: item.position.left }}
                                    aria-label={`Info about ${item.name}`}
                                >
                                    <span className="relative flex h-5 w-5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-5 w-5 bg-primary items-center justify-center text-primary-foreground">
                                            <Plus className="h-3 w-3" />
                                        </span>
                                    </span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="flex items-center gap-3 p-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                                        <item.icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{item.name}</h4>
                                        <p className="text-sm text-muted-foreground max-w-xs">{item.description}</p>
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                 </Card>
            </TooltipProvider>
        </div>
      </div>
    </section>
  );
}
