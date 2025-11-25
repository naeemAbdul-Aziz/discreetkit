"use client";
import React from "react";
import { TextRevealCard, TextRevealCardTitle, TextRevealCardDescription } from "@/components/ui/text-reveal-card";

export function PrivacyReveal() {
  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Mobile: Static Card */}
          <div className="block md:hidden bg-[#1D1E17] p-8 rounded-2xl border border-white/10">
             <h3 className="text-xl font-bold text-white mb-2">Completely Anonymous & Secure</h3>
             <p className="text-[#A9A9A9]">Discretion Guaranteed</p>
          </div>

          {/* Desktop: Reveal Effect */}
          <div className="hidden md:block">
            <TextRevealCard
                text="Your Privacy Matters"
                revealText="Completely Anonymous & Secure"
            >
                <TextRevealCardTitle>Discretion Guaranteed</TextRevealCardTitle>
                <TextRevealCardDescription>
                Hover to reveal our commitment to your privacy
                </TextRevealCardDescription>
            </TextRevealCard>
          </div>
        </div>
      </div>
    </section>
  );
}
