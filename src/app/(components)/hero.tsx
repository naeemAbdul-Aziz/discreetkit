
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Star, ShieldCheck, Truck } from 'lucide-react';
import { Card } from '@/components/ui/card';

const statCards = [
    {
        icon: BadgeCheck,
        title: '99% Accuracy',
        description: 'WHO-Approved Kits',
        position: 'top-4 left-4',
        delay: 0.5,
    },
    {
        icon: Star,
        title: '4.9 Stars',
        description: 'From 1,600+ Reviews',
        position: 'bottom-4 -left-8',
        delay: 0.6,
    },
    {
        icon: ShieldCheck,
        title: '100% Private',
        description: 'No Names, No Accounts',
        position: 'top-1/4 -right-10',
        delay: 0.7,
    },
    {
        icon: Truck,
        title: 'Fast Delivery',
        description: '24-48 Hours in Accra',
        position: 'bottom-12 -right-4',
        delay: 0.8,
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


export function Hero() {
  return (
    <section className="bg-muted py-12 md:py-20 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Left Content Column */}
                <motion.div
                    className="text-center md:text-left"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
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
                            Order Your Test Kit
                            <ArrowRight />
                            </Link>
                        </Button>
                    </div>
                </motion.div>

                {/* Right Image Column */}
                <motion.div 
                    className="relative flex items-center justify-center min-h-[350px] md:min-h-[450px]"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                >
                    <Image
                        src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1756313856/woman_smiling_package_g5rnqh.jpg"
                        alt="A happy woman receiving a delivery box, representing discreet and satisfying service"
                        width={500}
                        height={500}
                        className="object-contain rounded-3xl shadow-2xl z-10 w-full max-w-md h-auto"
                        data-ai-hint="happy woman box"
                        placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(500, 500))}`}
                    />

                    {/* Floating Stat Cards */}
                    {statCards.map((card) => (
                        <motion.div
                            key={card.title}
                            className={`absolute z-20 ${card.position}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: card.delay }}
                        >
                            <Card className="p-3 bg-background/80 backdrop-blur-sm shadow-lg w-40">
                                <div className="flex items-center gap-2">
                                    <card.icon className="h-5 w-5 text-primary" />
                                    <h4 className="font-semibold text-sm">{card.title}</h4>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
      </div>
    </section>
  );
}
