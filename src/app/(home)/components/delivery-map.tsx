"use client";
import React from "react";
import WorldMap from "@/components/ui/world-map";
import { motion } from "framer-motion";

export function DeliveryMap() {
  return (
    <div className="w-full h-[500px] bg-muted/20 rounded-3xl overflow-hidden">
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
  );
}
