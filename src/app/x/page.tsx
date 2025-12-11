"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CipherReveal } from "@/components/ui/cipher-reveal";
import { WaitlistForm } from "@/components/waitlist-form";
import { Highlighter } from "@/components/ui/highlighter";

import { getSupabaseClient } from "@/lib/supabase";

export default function XPage() {
  const [isHeld, setIsHeld] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [count, setCount] = useState("1,247"); // Fallback / Loading state
  const touchStartTime = useRef<number>(0);
  
  useEffect(() => {
    const fetchCount = async () => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.rpc('get_waitlist_count');
        if (!error && data !== null) {
            // Format with commas
            setCount(data.toLocaleString());
        }
    };
    fetchCount();
  }, []);
  
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
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground"
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

      <div className="z-10 flex flex-col items-center gap-8 p-6">
        
        {/* The Cipher Display */}
        <div className="cursor-pointer select-none text-center">
            <h1 className="text-6xl font-bold tracking-tighter md:text-8xl">
                <CipherReveal 
                    text="0x8F..." 
                    revealText={count}
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
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full"
                >
                    <WaitlistForm />
                    
                    {/* Informative Content */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 text-center max-w-md mx-auto space-y-4"
                    >
                        <div className="h-px w-12 bg-border mx-auto mb-6" />
                        <h3 className="font-bold text-lg">What is DiscreetKit?</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The world's first fully <Highlighter active={isRevealed} delay={0.6}>anonymous pharmacy</Highlighter>. 
                            No accounts, <Highlighter active={isRevealed} delay={0.8}>no tracking</Highlighter>, 
                            just results delivered to your door.
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                            We only need your phone number to signal when we launch. It is encrypted and never shared.
                        </p>
                    </motion.div>
                </motion.div>
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
