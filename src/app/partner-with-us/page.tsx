'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Truck, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';

export default function PartnerPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-emerald-500/30">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#0f172a] to-[#0f172a]" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Proposal for Strategic Fulfillment Partnership
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.1]"
            >
              The Invisible Customer is <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Your Biggest Opportunity.
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-2xl text-slate-400 mb-12 leading-relaxed max-w-3xl mx-auto"
            >
              Every day, thousands of young Ghanaians walk past your pharmacy needing essential health products, but they don't come in. <span className="text-slate-200 font-semibold">We bring them to you.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button asChild size="lg" className="h-14 px-8 text-lg bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-500/20 transition-all hover:scale-105">
                <Link href="mailto:partners@discreetkit.com?subject=Partnership Inquiry">
                  Join the Network
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* The Problem (The Hook) */}
      <section className="py-20 bg-[#0f172a] border-t border-slate-800">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                The Problem: <span className="text-red-400">Stigma Blocks Sales.</span>
              </h2>
              <div className="space-y-6 text-lg text-slate-400 leading-relaxed">
                <p>
                  Why do young people avoid buying HIV tests or contraceptives publicly? Because they are terrified of being seen.
                </p>
                <p>
                  With <strong className="text-white">15,290+ new HIV infections</strong> last year and <strong className="text-white">60% of users preferring confidential testing</strong>, this stigma isn't just a social issue—it's a massive economic blocker.
                </p>
                <p>
                  That moment of hesitation costs you a sale and potentially costs them their health.
                </p>
              </div>
            </div>
            <div className="relative h-[400px] bg-slate-900 rounded-3xl border border-slate-800 p-8 flex flex-col justify-center items-center text-center">
               <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(68,68,68,.2)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat transition-[background-position_0s_ease] hover:bg-[position:200%_0,0_0] duration-1000" />
               <Lock className="w-24 h-24 text-slate-700 mb-6" />
               <h3 className="text-2xl font-bold text-slate-300 mb-2">The "Pharmacy Stare"</h3>
               <p className="text-slate-500 max-w-sm">
                 The fear of judgment prevents 635,000+ tertiary students from accessing the care they need.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution (The Bridge) */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
        
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              The Solution: <br />
              <span className="text-emerald-400">We Are The Digital Bridge.</span>
            </h2>
            <p className="text-xl text-slate-400">
              DiscreetKit acts as the "Uber for Privacy." We let customers order anonymously online, and we route those orders directly to you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card 
              icon={TrendingUp}
              title="New Revenue Stream"
              description="We capture the market that is currently too shy to buy. You get the sale; we handle the customer relationship."
            />
            <Card 
              icon={Truck}
              title="Zero Logistics"
              description="Our unbranded riders handle the pickup and delivery. You just pack the item. No fleet required."
            />
            <Card 
              icon={ShieldCheck}
              title="Future-Proof"
              description="The government is moving towards de-stigmatized access. Partnering with us puts your pharmacy ahead of the curve."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#0f172a]">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-emerald-900/20 to-slate-900 border border-emerald-500/20 rounded-3xl p-12 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">
              Ready to Capture the Invisible Market?
            </h2>
            <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto relative z-10">
              We would welcome the opportunity to discuss a commission structure and pilot program with your pharmacy.
            </p>
            
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="h-14 px-8 text-lg bg-emerald-500 hover:bg-emerald-600 text-white rounded-full">
                <Link href="mailto:partners@discreetkit.com?subject=Partnership Inquiry">
                  Request Partnership Deck
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-full bg-transparent">
                <Link href="/">
                  View Consumer Site
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Card({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-[#0f172a] p-8 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-colors group">
      <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-emerald-500/20 transition-colors">
        <Icon className="w-6 h-6 text-emerald-400" />
      </div>
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <p className="text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
