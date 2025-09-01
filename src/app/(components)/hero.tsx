
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

export function Hero() {
  return (
    <section className="bg-muted py-12 md:py-20 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

            {/* Left Content Column */}
            <motion.div
                className="text-center md:text-left"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
            >
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
                    Private Health Answers, <span className="font-light italic">Delivered with Trust.</span>
                </h1>
                
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                    <Button asChild size="lg" className="w-full sm:w-auto">
                        <Link href="/order">
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
    </section>
  );
}
