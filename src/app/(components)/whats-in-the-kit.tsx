
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TestTube, Droplet, FileText, Package, FlaskConical, Info, Plus } from 'lucide-react';
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

export function WhatsInTheKit() {
  return (
    <section className="bg-muted py-12 md:py-24">
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        <div className="text-center">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Unbox Confidence: <span className="text-primary">What's Inside</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Each DiscreetKit is equipped with everything you need for a simple and reliable self-test experience.
          </p>
        </div>

        <div className="mt-12">
            <TooltipProvider delayDuration={100}>
                 <Card className="relative aspect-video w-full max-w-4xl mx-auto overflow-hidden rounded-2xl shadow-lg">
                    <Image
                        src="https://images.unsplash.com/photo-1583324113620-910f24a2571b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxmbGF0JTIwbGF5JTIwbWVkaWNhbCUyMGtpdHxlbnwwfHx8fDE3NTYxNDg5OTV8MA&ixlib=rb-4.1.0&q=80&w=1080"
                        alt="DiscreetKit contents flat lay"
                        fill
                        className="object-cover"
                        data-ai-hint="medical kit flatlay"
                    />
                    <div className="absolute inset-0 bg-black/10" />

                    {kitContents.map((item) => (
                        <Tooltip key={item.name}>
                            <TooltipTrigger asChild>
                                <button 
                                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                                    style={{ top: item.position.top, left: item.position.left }}
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
