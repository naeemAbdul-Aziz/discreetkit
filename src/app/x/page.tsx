"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CipherReveal } from "@/components/ui/cipher-reveal";
import { WaitlistForm } from "@/components/waitlist-form";

export default function XPage() {
  const [isHeld, setIsHeld] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const touchStartTime = useRef<number>(0);
  
  // Haptic feedback function
  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const startInteraction = () => {
    if (isRevealed) return;
    setIsHeld(true);
    touchStartTime.current = Date.now();
    vibrate(10); // Light tap on start
  };

  const endInteraction = () => {
    if (isRevealed) return;
    setIsHeld(false);
    
    // Check if held long enough to trigger full reveal (optional logic, 
    // currently we rely on the component's internal timer or user holding it)
  };

  // Callback when CipherReveal finishes the animation
  const handleRevealComplete = () => {
    if (!isRevealed) {
        setIsRevealed(true);
        vibrate([50, 50, 50]); // Success vibration
    }
  };

  return (
    <div 
      className="relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground"
      onMouseDown={startInteraction}
      onMouseUp={endInteraction}
      onMouseLeave={endInteraction}
      onTouchStart={startInteraction}
      onTouchEnd={endInteraction}
    >
      {/* Background Matrix Effect (Optional/Subtle) */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle at center, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      ></div>

      <div className="z-10 flex flex-col items-center gap-8">
        
        {/* The Cipher Display */}
        <div className="cursor-pointer select-none text-center">
            <h1 className="text-6xl font-bold tracking-tighter md:text-8xl">
                <CipherReveal 
                    text="0x8F..." 
                    revealText="1,247" 
                    isRevealing={isHeld || isRevealed} 
                    onRevealComplete={handleRevealComplete}
                    className={isRevealed ? "text-primary" : "text-foreground"}
                />
            </h1>
            <motion.p 
                initial={{ opacity: 0.5 }}
                animate={{ opacity: isHeld ? 0.8 : 0.4 }}
                className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
                {isRevealed ? "People Waiting" : "Press to Reveal Variable X"}
            </motion.p>
        </div>

        {/* Form Container */}
        <AnimatePresence>
            {isRevealed && (
                <div className="w-full px-8">
                    <WaitlistForm />
                </div>
            )}
        </AnimatePresence>

      </div>
      
      {/* Footer Branding */}
      <div className="absolute bottom-8 font-mono text-[10px] text-muted-foreground">
        DISCREETKIT // X
      </div>
    </div>
  );
}
