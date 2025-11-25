"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PartnerReferral() {
  return (
    <div className="container mx-auto px-4 md:px-6 py-12 md:py-24">
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-8 md:p-16 text-center">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-900 to-slate-900 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Own a Pharmacy?
          </h2>
          <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
            Join the DiscreetKit network and reach thousands of customers who value privacy. 
            We bring the orders; you handle the fulfillment.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-12 px-8 text-base bg-emerald-500 hover:bg-emerald-600 text-white rounded-full">
              <Link href="/partner-with-us">
                Partner With Us
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
