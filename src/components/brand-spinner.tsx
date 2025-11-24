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
  size = "md",
  className,
}: BrandSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={["relative flex items-center justify-center", currentSize, className].filter(Boolean).join(" ")}>
      <svg className="animate-spin text-current w-full h-full" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  );
}

export default BrandSpinner;
