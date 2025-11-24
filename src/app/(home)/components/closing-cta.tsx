/**
 * @file closing-cta.tsx
 * @description A premium, immersive final call-to-action.
 */

'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function ClosingCta() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-foreground text-background">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="container relative z-10 mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90"
          >
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">100% Private & Confidential</span>
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-headline text-4xl md:text-7xl font-black tracking-tighter text-white mb-8 leading-[0.9]"
          >
            Your health,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-300">
              on your terms.
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mb-12 leading-relaxed"
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
            <Button asChild size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-all duration-300">
              <Link href="/products">
                Shop Essentials
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-white/30 text-white bg-white/5 hover:bg-white/20 hover:text-white backdrop-blur-sm transition-all duration-300">
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
