"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface DottedMapProps {
  markers?: {
    lat: number;
    lng: number;
    size?: number;
    label?: string;
  }[];
  className?: string;
}

export function DottedMap({ markers = [], className }: DottedMapProps) {
  // Projection configuration for Ghana (Southern Focus) - Reusing existing robust projection
  const mapConfig = useMemo(() => ({
    width: 800,
    height: 600,
    minLng: -3.5, // Left boundary (West)
    maxLng: 1.5,  // Right boundary (East)
    minLat: 4.5,  // Bottom boundary (South)
    maxLat: 11.2, // Top boundary (North - extended to cover Tamale)
  }), []);

  const project = (lat: number, lng: number) => {
    // Simple linear projection (Mercator-ish enough for this scale)
    const x = ((lng - mapConfig.minLng) / (mapConfig.maxLng - mapConfig.minLng)) * mapConfig.width;
    // Y is inverted in SVG
    const y = mapConfig.height - ((lat - mapConfig.minLat) / (mapConfig.maxLat - mapConfig.minLat)) * mapConfig.height;
    return { x, y };
  };

  return (
    <div className={`w-full h-full relative overflow-hidden bg-dot-black/[0.2] ${className}`}>
        {/* Background Grid/Pattern to simulate "Dotted" feeling */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

        <svg
          viewBox={`0 0 ${mapConfig.width} ${mapConfig.height}`}
          className="w-full h-full relative z-10"
        >
          {markers.map((marker, i) => {
            const { x, y } = project(marker.lat, marker.lng);
            
            // Check if bounds are somewhat valid
            if (x < 0 || x > mapConfig.width || y < 0 || y > mapConfig.height) return null;

            return (
              <g key={i}>
                {/* Ping Animation */}
                <motion.circle
                  cx={x}
                  cy={y}
                  r={(marker.size || 0.3) * 40} // Scaled size for effect
                  fill="currentColor"
                  className="text-primary/30"
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
                
                {/* Core Dot (Pill Shape or Dot) */}
                <motion.circle
                   cx={x}
                   cy={y}
                   r={(marker.size || 0.3) * 15}
                   fill="currentColor"
                   className="text-primary drop-shadow-md"
                   initial={{ scale: 0 }}
                   animate={{ scale: 1 }}
                   transition={{ delay: i * 0.1, type: "spring" }}
                />

                {/* Label (Optional) */}
                {marker.label && (
                    <motion.text
                        x={x}
                        y={y + 15}
                        textAnchor="middle"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                        className="text-[10px] font-bold fill-muted-foreground uppercase tracking-widest pointer-events-none"
                    >
                        {marker.label}
                    </motion.text>
                )}
              </g>
            );
          })}
        </svg>
    </div>
  );
}
