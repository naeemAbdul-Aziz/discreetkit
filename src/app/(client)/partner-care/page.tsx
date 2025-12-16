'use client';

import { marieStopesData } from '@/lib/data';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Phone, MessageSquare, ArrowRight, ShieldCheck, Lock, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Highlighter } from '@/components/ui/highlighter';
import { cn } from '@/lib/utils';

const categories = ['Sexual Health', 'Reproductive Health', 'General Wellness'] as const;

export default function PartnerCarePage() {
  return (
    <div className="bg-background min-h-screen">
      
      {/* Hero Section - Sophisticated, Minimal */}
      <section className="relative overflow-hidden pt-28 pb-20 md:pt-36 md:pb-32">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <ShieldCheck className="w-4 h-4" />
              Official Healthcare Partner
            </div>
            
            <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-foreground leading-[0.95] mb-6">
              Professional Care.<br />
              <Highlighter className="text-primary italic font-light">Zero Judgment.</Highlighter>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              As a DiscreetKit customer, you get exclusive access to confidential, priority care at Marie Stopes Ghana. Your access code is on your order confirmation.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="h-12 px-8 rounded-full shadow-lg hover:scale-105 transition-transform">
                <Link href="/products">
                  Shop Now to Get Your Code
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Signals - Compact */}
      <section className="py-12 border-y border-border/50 bg-secondary/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Lock, title: '100% Confidential', description: 'Your visit and records are private.' },
              { icon: UserCheck, title: 'Priority Access', description: 'Skip the usual queue with your code.' },
              { icon: ShieldCheck, title: 'Verified Partner', description: 'Licensed, trusted healthcare.' },
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid - Categorized, No Booking */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">Available Services</h2>
            <p className="text-muted-foreground">
              Present your unique Partner Access Code at any Marie Stopes centre to access these services.
            </p>
          </motion.div>

          {categories.map((category, catIndex) => (
            <div key={category} className="mb-16 last:mb-0">
              <h3 className="text-xl font-semibold text-foreground border-b border-border pb-3 mb-6">{category}</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marieStopesData.services.filter(s => s.category === category).map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/20 hover:shadow-lg transition-all"
                  >
                    <h4 className="font-semibold text-lg text-foreground mb-2">{service.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How to Access - Simple Steps */}
      <section className="py-20 md:py-28 bg-secondary/30 border-y border-border/50">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
          <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground mb-12">Getting access is simple.</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Order from DiscreetKit', description: 'Complete any purchase on our platform.' },
              { step: '2', title: 'Get Your Code', description: 'Your unique Partner Access Code is on the order confirmation.' },
              { step: '3', title: 'Visit Marie Stopes', description: 'Present your code at any centre for priority, confidential care.' },
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <h2 className="font-headline text-3xl font-bold text-center mb-12">Common Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            {marieStopesData.faqs.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50">
                <AccordionTrigger className="text-left text-base hover:no-underline py-6">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Contact Footer */}
      <section className="py-12 border-t border-border/50">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <p className="text-muted-foreground mb-4">Need to speak with Marie Stopes directly?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {marieStopesData.contact.phone && (
              <Button variant="outline" asChild className="rounded-full">
                <a href={`tel:${marieStopesData.contact.phone}`}>
                  <Phone className="mr-2 h-4 w-4" />
                  {marieStopesData.contact.phone}
                </a>
              </Button>
            )}
            {marieStopesData.contact.whatsapp && (
              <Button variant="outline" asChild className="rounded-full">
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
