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
            className="flex items-center justify-center gap-2 text-primary/80 text-sm font-medium mt-6"
        >
            <CheckIcon className="h-4 w-4" />
            <span>Noted. We'll look into it.</span>
        </motion.div>
    );
  }

  return (
    <form action={formAction} className="mt-8 relative max-w-xs mx-auto w-full">
        <div className="relative group">
            <Input 
                name="suggestion"
                placeholder="I want to see..." 
                className="pr-10 bg-transparent border-x-0 border-t-0 border-b border-border/50 rounded-none focus-visible:ring-0 px-0 text-center placeholder:text-muted-foreground/40 h-12 text-base transition-colors group-focus-within:border-primary/50"
                required
            />
            <Button 
                type="submit" 
                size="icon" 
                variant="ghost" 
                className="absolute right-0 top-1 h-10 w-10 hover:bg-transparent hover:text-primary opacity-50 hover:opacity-100 transition-opacity"
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

import { NumberTicker } from "@/components/ui/number-ticker";

// ... imports remain the same, remove CipherReveal if unused

export default function AccessPage() {
  const [isHeld, setIsHeld] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [rawCount, setRawCount] = useState(1247); // Number type for ticker
  const [welcomeName, setWelcomeName] = useState<string | null>(null);
  const touchStartTime = useRef<number>(0);
  
  useEffect(() => {
    const fetchCount = async () => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.rpc('get_waitlist_count');
        if (!error && data !== null) {
            setRawCount(data + 700);
        }
    };
    fetchCount();
  }, []);
  
  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const startInteraction = () => {
    if (isRevealed || welcomeName) return;
    setIsHeld(true);
    touchStartTime.current = Date.now();
    vibrate(10); 

    // Auto-reveal after 800ms hold (simpler than full cipher decode)
    setTimeout(() => {
        if (Date.now() - touchStartTime.current >= 800) {
            handleRevealComplete();
        }
    }, 800);
  };

  const endInteraction = () => {
    if (isRevealed || welcomeName) return;
    setIsHeld(false);
  };

  const handleRevealComplete = () => {
    if (!isRevealed) {
        setIsRevealed(true);
        vibrate([50, 50, 50]); 
    }
  };

  const handleJoinSuccess = (name: string) => {
    setWelcomeName(name);
    vibrate([50, 100, 50]);
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
      {/* Background Matrix Effect */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle at center, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      ></div>

      <div className="z-10 flex flex-col items-center gap-12 sm:gap-16 p-6 w-full max-w-lg transition-all duration-500">
        
        {/* Helper Icon */}
        {!isRevealed && !welcomeName && (
             <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.95, 1.05, 0.95] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="mb-[-28px] text-primary/40"
             >
                <Fingerprint className="w-16 h-16" strokeWidth={1} />
             </motion.div>
        )}

        {/* Main Display: Count OR Welcome Message */}
        <div className="text-center transition-all duration-700">
            {welcomeName ? (
                 <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-6"
                 >
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-[#4ade80]">
                        [ WELCOME {welcomeName.toUpperCase()} ]
                    </h1>
                 </motion.div>
            ) : (
                <div className="cursor-pointer">
                     {/* The Ticker is always visible now, no decryption needed */}
                    <h1 className="text-7xl font-bold tracking-tighter md:text-9xl">
                        <NumberTicker value={rawCount} className="text-foreground" />
                    </h1>
                </div>
            )}
            
            <motion.p 
                initial={{ opacity: 0.5 }}
                animate={{ opacity: (isHeld || welcomeName) ? 1 : 0.6 }}
                className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground flex flex-col items-center gap-2"
            >
                {welcomeName ? (
                    <span className="text-[#4ade80] tracking-widest">SPOT SECURED</span>
                ) : isRevealed ? (
                    <span className="text-primary font-medium">YOU'RE IN</span>
                ) : (
                    <>
                        <span>Press & Hold to Join</span>
                        <span className="opacity-50 tracking-normal normal-case font-sans text-[10px]">(people have joined)</span>
                    </>
                )}
            </motion.p>
        </div>

        {/* Content Container */}
        <AnimatePresence>
            {isRevealed && !welcomeName && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full"
                >
                    <WaitlistForm onSuccess={handleJoinSuccess} />
                    
                    {/* Informative Content */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-20 text-center space-y-4"
                    >
                        <div className="h-px w-8 bg-border/50 mx-auto mb-8" />
                        
                        <h3 className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                            What is DiscreetKit?
                        </h3>
                        
                        <p className="text-base md:text-lg text-foreground/90 leading-relaxed max-w-sm mx-auto font-light">
                            A fully <Highlighter active={isRevealed} delay={0.6}>anonymous way to shop</Highlighter>. 
                            <br className="block" />
                            Get the things you feel <Highlighter active={isRevealed} delay={0.8} color="#ef4444">awkward, shy, or judged</Highlighter> buying in a store.
                        </p>

                        <SuggestionForm />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
         
         {/* Success Message After Join */}
         {welcomeName && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center space-y-8 max-w-md mx-auto"
            >
                 <p className="text-sm text-muted-foreground">
                    You're on the list. <br/> We'll text you when we launch.
                 </p>
                 <SuggestionForm />
            </motion.div>
         )}

      </div>
    </div>
  );
}
