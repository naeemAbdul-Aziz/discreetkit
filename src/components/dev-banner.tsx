"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function DevBanner() {
  const [isVisible, setIsVisible] = useState(false);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("dev-banner-dismissed", "true");
  };

  useEffect(() => {
    // Check if previously dismissed in this session
    const dismissed = sessionStorage.getItem("dev-banner-dismissed");
    if (!dismissed) {
      setIsVisible(true);
      
      // Auto-dismiss after 30 seconds for verification
      const timer = setTimeout(() => {
        handleDismiss();
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="bg-brand-indigo text-white/95 text-center py-1.5 px-4 text-[10px] font-bold uppercase tracking-widest fixed top-0 left-0 right-0 z-[100] shadow-lg flex items-center justify-between sm:justify-center gap-4 border-b border-white/10 backdrop-blur-md"
        >
          <span>🚧 Still under development. We know you can't wait. Check back later!</span>
          <button 
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded-full transition-colors sm:absolute sm:right-4"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
