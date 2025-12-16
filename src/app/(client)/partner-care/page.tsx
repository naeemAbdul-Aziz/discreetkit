'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, ShieldCheck, Lock, UserCheck, Phone, MessageSquare, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { variants } from '@/lib/motion';
import { Highlighter } from '@/components/ui/highlighter';
import { cn } from '@/lib/utils';
import { marieStopesData } from '@/lib/data';

const categories = ['Sexual Health', 'Reproductive Health', 'General Wellness'] as const;

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#1a1a1a" offset="20%" />
      <stop stop-color="#2a2a2a" offset="50%" />
      <stop stop-color="#1a1a1a" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#1a1a1a" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export default function PartnerCarePage() {
  return (
    <div className="bg-background min-h-screen">
      
      {/* ─────────────────────────────────────────────────────────────────────────
          HERO SECTION - Cinematic, full-bleed with premium overlay
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757955894/counselling_old_lady_modern_xbthvs.jpg"
            alt="Professional Care"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-background z-10" />
        </div>

        {/* Content */}
        <div className="container relative z-20 mx-auto px-4 md:px-6 pt-32 pb-20">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={variants.staggerContainer}
            className="max-w-4xl"
          >
            <motion.div 
              variants={variants.fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90 mb-8"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Exclusive Partner Access</span>
            </motion.div>
            
            <motion.h1 
              variants={variants.fadeUp}
              className="font-headline text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-white leading-[0.95] mb-6"
            >
              Professional Care.<br />
              <Highlighter className="text-primary italic font-light">Zero Judgment.</Highlighter>
            </motion.h1>
            
            <motion.p 
              variants={variants.fadeUp}
              className="text-lg md:text-xl text-white/80 max-w-xl mb-10 leading-relaxed"
            >
              Your DiscreetKit purchase unlocks exclusive, confidential healthcare at Marie Stopes Ghana. 
              Your access code is on your order confirmation.
            </motion.p>

            <motion.div variants={variants.fadeUp} className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="h-12 md:h-14 px-8 md:px-10 text-base md:text-lg rounded-full shadow-xl hover:scale-105 transition-all duration-300 bg-white text-foreground hover:bg-white/90">
                <Link href="/products">
                  Shop Now to Unlock
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 md:h-14 px-8 md:px-10 text-base md:text-lg rounded-full border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all">
                <a href="#services">
                  View Services
                </a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          TRUST SIGNALS - Sleek horizontal strip
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-10 md:py-14 border-b border-border/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              { icon: Lock, title: '100% Confidential', description: 'Your visit and records stay private.' },
              { icon: UserCheck, title: 'Priority Access', description: 'Skip the queue with your code.' },
              { icon: ShieldCheck, title: 'Licensed Care', description: 'Verified, professional healthcare.' },
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-5"
              >
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-lg">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          HOW IT WORKS - Premium 3-step visual
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Getting exclusive partner access is seamless.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { step: '01', title: 'Order from DiscreetKit', description: 'Complete any purchase on our platform to receive your unique Partner Access Code.', image: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1765658493/anonymous_ordering_z64cfi.png' },
              { step: '02', title: 'Get Your Code', description: 'Your code appears on the order confirmation page. Keep it safe.', image: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1765658493/mystery_box_d2bvzi.png' },
              { step: '03', title: 'Visit Marie Stopes', description: 'Present your code at any centre for priority, confidential care.', image: 'https://res.cloudinary.com/dzfa6wqb8/image/upload/v1757955894/counselling_old_lady_modern_xbthvs.jpg' },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="group relative h-[400px] rounded-3xl overflow-hidden border border-white/5"
              >
                {/* Background Image */}
                <div className="absolute inset-0 bg-black/30 z-10 transition-colors duration-500 group-hover:bg-transparent" />
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-all duration-700 scale-100 group-hover:scale-110 opacity-70 group-hover:opacity-100 grayscale-[20%] group-hover:grayscale-0"
                  placeholder={`data:image/svg+xml;base64,${toBase64(shimmer(400, 500))}`}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20" />

                {/* Content */}
                <div className="absolute inset-0 z-30 flex flex-col justify-end p-8">
                  <span className="text-primary font-mono font-bold text-sm mb-2">{item.step}</span>
                  <h3 className="text-2xl font-bold text-white tracking-tight mb-2">{item.title}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          SERVICES - Cinematic Checkerboard Grid (from homepage)
      ───────────────────────────────────────────────────────────────────────── */}
      <section id="services" className="py-20 md:py-28 bg-secondary/30 border-y border-border/30">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="font-headline text-3xl md:text-5xl font-bold tracking-tight mb-4">Available Services</h2>
            <p className="text-muted-foreground text-lg">
              Present your Partner Access Code at any Marie Stopes centre.
            </p>
          </motion.div>

          {categories.map((category) => {
            const services = marieStopesData.services.filter(s => s.category === category);
            if (services.length === 0) return null;
            
            return (
              <div key={category} className="mb-16 last:mb-0">
                <h3 className="text-lg font-semibold text-muted-foreground uppercase tracking-wider mb-6">{category}</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="group p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:shadow-xl transition-all duration-300"
                    >
                      <h4 className="font-semibold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">{service.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          FAQ - Clean, minimal
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-headline text-3xl md:text-4xl font-bold text-center mb-12"
          >
            Common Questions
          </motion.h2>
          <Accordion type="single" collapsible className="w-full">
            {marieStopesData.faqs.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/40">
                <AccordionTrigger className="text-left text-base hover:no-underline py-5 font-medium">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          CLOSING CTA - Immersive call to action
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 overflow-hidden bg-primary">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-primary/90 mix-blend-multiply z-10" />
          <img 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
            alt="Abstract Background" 
            className="w-full h-full object-cover opacity-50"
          />
        </div>

        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-headline text-3xl md:text-5xl font-black tracking-tighter text-white mb-6 leading-[0.95]"
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-white/80 max-w-xl mb-10"
            >
              Place your first order and unlock exclusive access to confidential healthcare.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button asChild size="lg" className="h-14 px-10 text-lg rounded-full bg-white text-primary hover:bg-white/90 hover:scale-105 transition-all duration-300">
                <Link href="/products">
                  Shop Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          CONTACT FOOTER - Minimal
      ───────────────────────────────────────────────────────────────────────── */}
      <section className="py-10 border-t border-border/30">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-muted-foreground mb-4 text-sm">Need to speak with Marie Stopes directly?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {marieStopesData.contact.phone && (
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <a href={`tel:${marieStopesData.contact.phone}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  {marieStopesData.contact.phone}
                </a>
              </Button>
            )}
            {marieStopesData.contact.whatsapp && (
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <a href={`https://wa.me/${marieStopesData.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  WhatsApp
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>
      
    </div>
  );
}
