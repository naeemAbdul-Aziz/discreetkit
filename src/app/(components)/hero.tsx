
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Package, Star, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

const statCards = [
  {
    icon: CheckCircle,
    title: '99% Accuracy',
    subtitle: 'WHO-Approved Tests',
    position: 'top-12 -left-4 md:-left-12',
  },
  {
    icon: Package,
    title: 'Discreet Packaging',
    subtitle: 'Guaranteed Privacy',
    position: 'top-24 -right-4 md:-right-16',
  },
  {
    icon: Star,
    title: '4.9 Star Rating',
    subtitle: '1,600+ Reviews',
    position: 'bottom-20 -left-4 md:-left-20',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Anonymous',
    subtitle: 'No Account Needed',
    position: 'bottom-8 -right-4 md:-right-12',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
    },
  },
};

export function Hero() {
  return (
    <section className="w-full bg-background overflow-hidden">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-12 md:py-24">
          
          {/* Left Column: Text Content */}
          <div className="flex flex-col justify-center text-left">
             <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
             >
                <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    Private Health Answers, <span className="text-primary/80">Delivered with Trust.</span>
                </h1>
                <p className="mt-6 text-lg max-w-prose text-muted-foreground">
                    DiscreetKit empowers you to take control of your health with confidential, reliable, and easy-to-use self-test kits delivered anywhere in Ghana.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                    <Button asChild size="lg">
                        <Link href="/order">
                        Order Your Test Kit
                        <ArrowRight />
                        </Link>
                    </Button>
                    <Button asChild variant="link" size="lg">
                        <Link href="#how-it-works">
                            Learn More <span aria-hidden="true">→</span>
                        </Link>
                    </Button>
                </div>
             </motion.div>
          </div>

          {/* Right Column: Image and Stats */}
          <motion.div 
            className="relative flex items-center justify-center min-h-[400px] md:min-h-[500px]"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Background Shape */}
            <div className="absolute inset-0 bg-primary/5 rounded-3xl -rotate-6 transform-gpu"></div>
            
            {/* Main Image */}
            <motion.div 
                className="relative z-10 w-64 h-64 md:w-80 md:h-80"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <Image
                    src="https://img.freepik.com/free-photo/happy-woman-with-shopping-bags-near-door_23-2147672534.jpg"
                    alt="DiscreetKit test kit box"
                    fill
                    className="object-cover rounded-xl shadow-2xl"
                    priority
                    data-ai-hint="happy woman box"
                />
            </motion.div>
            
            {/* Stat Cards */}
            {statCards.map((card) => (
                <motion.div
                    key={card.title}
                    className={cn(
                        'absolute z-20 p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg border border-white/20',
                        card.position
                    )}
                    variants={itemVariants}
                >
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <card.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">{card.title}</p>
                            <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                        </div>
                    </div>
                </motion.div>
            ))}

          </motion.div>
        </div>
      </div>
    </section>
  );
}
