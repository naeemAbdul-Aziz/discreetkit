"use client";
import React from "react";
import { TextReveal } from "@/components/ui/text-reveal";

export function PrivacyReveal() {
  return (
    <section className="bg-background relative">
      <TextReveal text="Your Privacy Matters. Completely Anonymous & Secure." className="h-[60vh] md:h-[120vh]" />
    </section>
  );
}
