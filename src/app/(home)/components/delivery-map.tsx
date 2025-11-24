"use client";
import React from "react";
import { motion } from "framer-motion";

export function DeliveryMap() {
  // Simplified SVG map of Ghana's southern region (approximate)
  // Focusing on the triangle of Accra, Kumasi, Cape Coast
  
  const locations = [
    { name: "Accra", x: 250, y: 300, color: "#187f76" }, // Bottom Right
    { name: "Kumasi", x: 150, y: 150, color: "#eab308" }, // Top Left
    { name: "Cape Coast", x: 100, y: 320, color: "#64748b" }, // Bottom Left
  ];

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center bg-muted/20 rounded-3xl overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#187f76_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <svg width="400" height="400" viewBox="0 0 400 400" className="w-full h-full max-w-[500px]">
        {/* Connecting Lines */}
        <motion.path
          d="M250 300 L150 150"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
        />
        <motion.path
          d="M150 150 L100 320"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, delay: 0.5, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
        />
        <motion.path
          d="M100 320 L250 300"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 1, repeat: Infinity, ease: "linear", repeatType: "reverse" }}
        />

        {/* Location Dots */}
        {locations.map((loc, i) => (
          <g key={loc.name}>
             <motion.circle
              cx={loc.x}
              cy={loc.y}
              r="6"
              fill={loc.color}
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            />
            <circle cx={loc.x} cy={loc.y} r="12" fill={loc.color} opacity="0.2" />
            <text x={loc.x} y={loc.y + 25} textAnchor="middle" className="text-xs font-bold fill-foreground" style={{ fontSize: '12px', fontWeight: 'bold' }}>
              {loc.name}
            </text>
          </g>
        ))}
      </svg>
      
      <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm p-3 rounded-xl border shadow-sm">
        <p className="text-xs font-medium text-muted-foreground">Active Coverage Zones</p>
        <div className="flex items-center gap-2 mt-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-bold">Live Delivery Network</span>
        </div>
      </div>
    </div>
  );
}
