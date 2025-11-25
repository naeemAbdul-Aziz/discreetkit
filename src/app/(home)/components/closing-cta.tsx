/**
 * @file closing-cta.tsx
 * @description A premium, immersive final call-to-action with brand colors.
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { SparklesCore } from '@/components/ui/sparkles';

export function ClosingCta() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-primary">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-primary/90 mix-blend-multiply z-10" />
        <img 
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
          alt="Abstract Background" 
          className="w-full h-full object-cover opacity-50"
        />
      </div>

      {/* Sparkles Effect - Desktop only */}
      <div className="absolute inset-0 hidden md:block z-10">
        <SparklesCore
          id="cta-sparkles"
          background="transparent"
          minSize={0.8}
          maxSize={2}
          particleDensity={100}
          speed={2.5}
          particleColor="#ffffff"
          className="w-full h-full opacity-40"
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90"
          >
            <ShieldCheck className="w-4 h-4 text-white" />
            <span className="text-sm font-medium">100% Private & Confidential</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-headline text-3xl md:text-6xl font-black tracking-tighter text-white mb-6 md:mb-8 leading-[0.9]"
          >
            Your health,<br />
            <span className="text-background">
              on your terms.
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base md:text-lg text-white/80 max-w-2xl mb-8 md:mb-12 leading-relaxed"
          >
            Join thousands of Ghanaians who trust DiscreetKit for their essential health needs. No waiting rooms, no awkward conversations. Just results.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
          >
            <Button asChild size="lg" className="h-11 md:h-14 px-5 md:px-8 text-sm md:text-lg rounded-full w-full sm:w-auto bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300">
              <Link href="/products">
                Shop Essentials
                <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 md:h-14 px-5 md:px-8 text-sm md:text-lg rounded-full w-full sm:w-auto border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all duration-300">
              <Link href="/partner-care">
                Talk to a Professional
              </Link>
            </Button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
