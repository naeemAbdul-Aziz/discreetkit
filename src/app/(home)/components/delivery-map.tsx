"use client";
import React from "react";
import WorldMap from "@/components/ui/world-map";
import { motion } from "framer-motion";

export function DeliveryMap() {
  return (
    <div className="py-20 md:py-40 bg-background w-full">
      <div className="max-w-7xl mx-auto text-center px-4">
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
          From Accra to Kumasi, we&apos;ve got you covered. 100% private, anonymous delivery across Ghana.
        </p>
      </div>
      <div className="w-full h-[400px] md:h-[500px] mt-8">
        <WorldMap
            dots={[
            {
                start: { lat: 5.6037, lng: -0.1870, label: "Accra (Hub)" }, // Accra
                end: { lat: 6.6885, lng: -1.6244, label: "Kumasi" }, // Kumasi
            },
            {
                start: { lat: 5.6037, lng: -0.1870, label: "Accra (Hub)" }, // Accra
                end: { lat: 5.1315, lng: -1.2795, label: "Cape Coast" }, // Cape Coast
            },
            {
                start: { lat: 6.6885, lng: -1.6244, label: "Kumasi" },
                end: { lat: 5.1315, lng: -1.2795, label: "Cape Coast" },
            }
            ]}
        />
      </div>
    </div>
  );
}
