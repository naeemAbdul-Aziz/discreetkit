"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CipherReveal } from "@/components/ui/cipher-reveal";
import { WaitlistForm } from "@/components/waitlist-form";
import { Highlighter } from "@/components/ui/highlighter";

import { getSupabaseClient } from "@/lib/supabase";

import { useFormState } from "react-dom";
import { saveSuggestion } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Fingerprint } from "lucide-react";

// Check mark icon for success state
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SuggestionForm() {
  const [state, formAction] = useFormState(saveSuggestion, {
    message: "",
    success: false,
  });

  if (state.success) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 text-primary text-sm font-medium mt-6"
        >
            <CheckIcon className="h-4 w-4" />
            <span>Noted. We'll look into it.</span>
        </motion.div>
    );
  }

  return (
    <form action={formAction} className="mt-8 relative max-w-sm mx-auto">
        <div className="relative">
            <Input 
                name="suggestion"
                placeholder="What specific item are you looking for?" 
                className="pr-12 bg-transparent border-x-0 border-t-0 border-b border-border rounded-none focus-visible:ring-0 px-0 text-center placeholder:text-muted-foreground/50 h-10"
                required
            />
            <Button 
                type="submit" 
                size="icon" 
                variant="ghost" 
                className="absolute right-0 top-0 h-10 w-10 hover:bg-transparent hover:text-primary"
            >
                <ArrowRight className="h-4 w-4" />
            </Button>
        </div>
        {state.message && !state.success && (
            <p className="text-xs text-red-500 mt-2">{state.message}</p>
        )}
    </form>
  );
}

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
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background text-foreground select-none"
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

      <div className="z-10 flex flex-col items-center gap-8 p-6 w-full max-w-lg transition-all duration-500">
        
        {/* Helper Icon (Only visible when not revealed) */}
        {!isRevealed && (
             <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mb-[-20px] text-primary/40"
             >
                <Fingerprint className="w-16 h-16" strokeWidth={1} />
             </motion.div>
        )}

        {/* The Cipher Display */}
        <div className="text-center">
            <h1 className="text-6xl font-bold tracking-tighter md:text-8xl cursor-pointer">
                <CipherReveal 
                    text="0x8F..." 
                    revealText={count}
                    isRevealing={isHeld || isRevealed} 
                    onRevealComplete={handleRevealComplete}
                    className={isRevealed ? "text-primary transition-colors duration-500" : "text-foreground/80"}
                />
            </h1>
            
            <motion.p 
                initial={{ opacity: 0.5 }}
                animate={{ opacity: isHeld ? 1 : 0.6 }}
                className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground flex flex-col items-center gap-2"
            >
                {isRevealed ? (
                    <span className="text-primary">Early Access Granted</span>
                ) : (
                    <>
                        <span>Press & Hold to Decrypt</span>
                        <span className="text-[10px] opacity-50 lowercase tracking-normal">(people in queue)</span>
                    </>
                )}
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
                        className="mt-12 text-center space-y-4"
                    >
                        <div className="h-px w-12 bg-border mx-auto mb-6" />
                        <h3 className="font-bold text-lg">What is DiscreetKit?</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The world's first fully <Highlighter active={isRevealed} delay={0.6}>anonymous pharmacy</Highlighter>. 
                            <br className="hidden sm:block" />
                            We make accessible to you the things you would feel <Highlighter active={isRevealed} delay={0.8} color="#ef4444">embarrassed, shy, stigmatized</Highlighter> or judged to walk into a pharmacy and get.
                        </p>
                        <p className="text-sm text-muted-foreground/80">
                            We only need your phone number to signal when we launch. It is encrypted and never shared.
                        </p>

                        <SuggestionForm />
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
