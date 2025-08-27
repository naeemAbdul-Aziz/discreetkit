
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative w-full h-[60vh] md:h-[70vh] text-white overflow-hidden">
      <Image
        src="https://img.freepik.com/free-photo/happy-client-with-their-box-delivered_23-2151323385.jpg"
        alt="A happy woman receiving a delivery box, representing discreet and satisfying service"
        fill
        className="object-cover"
        priority
        data-ai-hint="happy woman box"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
      
      <div className="relative h-full flex flex-col justify-center items-start p-4 md:p-8">
        <div className="container mx-auto">
             <motion.div
                className="max-w-xl text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
             >
                <h1 className="font-headline text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                    Private Health Answers, <span className="opacity-80">Delivered with Trust.</span>
                </h1>
                <p className="mt-4 text-base max-w-prose text-white/90 md:text-lg">
                    DiscreetKit empowers you to take control of your health with confidential, reliable, and easy-to-use self-test kits delivered anywhere in Ghana.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-start">
                    <Button asChild size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                        <Link href="/order">
                        Order Your Test Kit
                        <ArrowRight />
                        </Link>
                    </Button>
                    <Button asChild variant="link" size="lg" className="text-white hover:text-white/80">
                        <Link href="#how-it-works">
                            Learn More <span aria-hidden="true">→</span>
                        </Link>
                    </Button>
                </div>
             </motion.div>
        </div>
      </div>
    </section>
  );
}
