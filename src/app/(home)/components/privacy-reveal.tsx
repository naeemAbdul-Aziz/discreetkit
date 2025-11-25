"use client";
import React from "react";
import { TextRevealCard, TextRevealCardTitle, TextRevealCardDescription } from "@/components/ui/text-reveal-card";

export function PrivacyReveal() {
  return (
    <section className="hidden md:block py-12 md:py-24 bg-background">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
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
    </section>
  );
}
