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
      
      // Auto-dismiss after 10 seconds
      const timer = setTimeout(() => {
        handleDismiss();
      }, 10000);
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
          className="bg-amber-500 text-white text-center py-2 px-4 text-sm font-medium fixed top-0 left-0 right-0 z-[60] shadow-md flex items-center justify-between sm:justify-center gap-4"
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
