"use client";

import React from "react";
import { motion } from "framer-motion";

interface HighlighterProps {
  children: React.ReactNode;
  active?: boolean;
  className?: string;
  delay?: number;
  color?: string;
}

export function Highlighter({ 
  children, 
  active = true, 
  className = "",
  delay = 0,
  color = "hsl(var(--primary) / 0.2)"
}: HighlighterProps) {
  return (
    <span className={`relative inline-block ${className}`}>
      <motion.span
        initial={{ scaleX: 0 }}
        animate={active ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ 
            duration: 0.8, 
            ease: "circOut", 
            delay: delay 
        }}
        style={{ originX: 0, backgroundColor: color }}
        className="absolute bottom-0 left-0 right-0 -z-10 h-[0.4em] translate-y-[0px] rotate-[-1deg] rounded-sm"
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
}
