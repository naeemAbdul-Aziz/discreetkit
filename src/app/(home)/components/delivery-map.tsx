"use client";
import React from "react";
import { DottedMap } from "@/components/ui/dotted-map";
import { motion } from "framer-motion";

const GHANA_MARKERS = [
  { lat: 5.6037, lng: -0.1870, size: 0.5, label: "Accra (Hub)" },
  { lat: 6.6885, lng: -1.6244, size: 0.4, label: "Kumasi" },
  { lat: 9.4075, lng: -0.8534, size: 0.4, label: "Tamale" },
  { lat: 4.8845, lng: -1.7554, size: 0.3, label: "Takoradi" },
  { lat: 5.1315, lng: -1.2795, size: 0.3, label: "Cape Coast" },
  { lat: 7.3349, lng: -2.3123, size: 0.3, label: "Sunyani" },
  { lat: 6.6101, lng: 0.4785, size: 0.3, label: "Ho" },
  { lat: 10.7856, lng: -2.3500, size: 0.3, label: "Wa" }
];

export function DeliveryMap() {
  return (
    <div className="py-20 md:py-32 bg-background w-full">
      <div className="max-w-7xl mx-auto text-center px-4 mb-12">
        <p className="font-bold text-xl md:text-4xl text-foreground">
          Nationwide{" "}
          <span className="text-muted-foreground">
            {"Coverage".split("").map((word, idx) => (
              <motion.span
                key={idx}
                className="inline-block"
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: idx * 0.04 }}
              >
                {word}
              </motion.span>
            ))}
          </span>
        </p>
        <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto py-4">
          From Accra to Kumasi and everywhere in between. Our network ensures discreet delivery to every region.
        </p>
      </div>
      
      {/* Map Container */}
      <div className="relative w-full max-w-4xl mx-auto h-[400px] md:h-[600px] rounded-3xl overflow-hidden border border-border shadow-2xl bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-radial from-transparent to-background/20 z-20 pointer-events-none" />
        <DottedMap markers={GHANA_MARKERS} className="text-emerald-500" />
      </div>
    </div>
  );
}
