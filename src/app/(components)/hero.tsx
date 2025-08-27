
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="bg-muted py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

            {/* Left Content Column */}
            <motion.div
                className="text-center md:text-left"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
            >
                <h1 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Private Health Answers, <span className="opacity-80">Delivered with Trust.</span>
                </h1>
                <p className="mt-4 text-base max-w-prose mx-auto md:mx-0 text-muted-foreground">
                    DiscreetKit empowers you to take control of your health with confidential, reliable, and easy-to-use self-test kits delivered anywhere in Ghana.
                </p>
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
                className="relative flex items-center justify-center min-h-[300px] md:min-h-[350px]"
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
                    priority
                    data-ai-hint="happy woman box"
                />
            </motion.div>
        </div>
      </div>
    </section>
  );
}
