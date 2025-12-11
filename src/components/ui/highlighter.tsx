"use client";

import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import React, { useRef } from "react";

interface HighlighterProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}

export function Highlighter({
  children,
  className,
  active = true,
}: HighlighterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <span
      ref={ref}
      className={cn("relative inline-block px-2 rounded-lg", className)}
    >
      <motion.span
        initial={{ scaleX: 0 }}
        animate={isInView && active ? { scaleX: 1 } : {}}
        transition={{
          duration: 0.5,
          ease: "circOut",
          delay: 0.2,
        }}
        className="absolute inset-0 -z-10 h-full w-full origin-left bg-primary/20 rounded-lg skew-y-1 block"
      />
      {children}
    </span>
  );
}
