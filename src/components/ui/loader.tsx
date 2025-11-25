"use client";
import React from "react";
import { motion } from "framer-motion";

export const LoaderOne = () => {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[400px]">
      <div className="relative flex items-center justify-center">
        {/* Outer ring */}
        <motion.div
          className="absolute w-16 h-16 border-4 border-primary/20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Spinning ring */}
        <motion.div
          className="w-16 h-16 border-4 border-transparent border-t-primary rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        
        {/* Inner dot */}
        <motion.div
          className="absolute w-2 h-2 bg-primary rounded-full"
          animate={{
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </div>
  );
};
