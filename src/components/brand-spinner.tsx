"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import React from "react";

export type BrandSpinnerSize = "sm" | "md" | "lg";

export type BrandSpinnerProps = {
  variant?: "pulse"; // currently only pulse implemented without inline styles
  size?: BrandSpinnerSize; // tailwind-sized
  src?: string; // URL/path to symbol mark (transparent background)
  speedMs?: number; // animation duration
  className?: string;
  alt?: string;
};

const sizeClassMap: Record<BrandSpinnerSize, string> = {
  sm: "h-5 w-5",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function BrandSpinner({
  variant = "pulse",
  size = "md",
  src = "https://res.cloudinary.com/dzfa6wqb8/image/upload/v1761571651/Artboard_6_oepbgq.svg",
  speedMs = 1200,
  className,
  alt = "Loading",
}: BrandSpinnerProps) {
  const sizeClasses = sizeClassMap[size] ?? sizeClassMap.md;

  // default: pulse
  return (
    <motion.div
      className={["relative inline-block", sizeClasses, className].filter(Boolean).join(" ")}
      role="status"
      aria-label={alt}
      initial={{ opacity: 0.95, scale: 1 }}
      animate={{ opacity: [1, 0.85, 1], scale: [1, 1.06, 1] }}
      transition={{ duration: speedMs / 1000, repeat: Infinity, ease: "easeInOut" }}
    >
      <Image src={src} alt="" fill priority sizes="(max-width: 768px) 32px, 48px" className="object-contain" />
    </motion.div>
  );
}

export default BrandSpinner;
