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
    <form action={formAction} className="mt-8 relative w-full max-w-sm mx-auto">
        <div className="relative w-full">
            <input 
                name="suggestion"
                placeholder="I'm looking forward to..." 
                className="h-12 w-full border-b border-border bg-transparent px-4 py-2 pr-12 text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-0"
                required
            />
            <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 h-10 w-10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors hover:bg-transparent"
            >
                <ArrowRight className="h-4 w-4" />
            </button>
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

      <div className="z-10 flex flex-col items-center gap-10 p-6 w-full max-w-lg transition-all duration-500">
        
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
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                 >
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-[#4ade80]">
                        [ WELCOME {welcomeName.toUpperCase()} ]
                    </h1>
                 </motion.div>
            ) : (
                <div className="cursor-pointer">
                     {/* The Ticker is always visible now, no decryption needed */}
                    <h1 className="text-6xl font-bold tracking-tighter md:text-8xl">
                        <NumberTicker value={rawCount} className="text-foreground" />
                    </h1>
                </div>
            )}
            
            <motion.p 
                initial={{ opacity: 0.5 }}
                animate={{ opacity: (isHeld || welcomeName) ? 1 : 0.6 }}
                className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground flex flex-col items-center gap-2"
            >
                {welcomeName ? (
                    <span className="text-[#4ade80] tracking-widest">SPOT SECURED</span>
                ) : isRevealed ? (
                    <span className="text-primary">You're In</span>
                ) : (
                    <>
                        <span>Press & Hold to Join</span>
                        <span className="text-[10px] opacity-50 lowercase tracking-normal">(people have joined)</span>
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
                        className="mt-16 text-center space-y-6"
                    >
                        <div className="h-px w-12 bg-border mx-auto mb-6" />
                        <h3 className="font-bold text-lg tracking-tight">
                            What is <span className="text-primary italic pr-1">DiscreetKit</span>?
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                            A fully <Highlighter active={isRevealed} delay={0.6}>anonymous way to shop</Highlighter>. 
                            <br className="hidden sm:block" />
                            Get the things you feel <Highlighter active={isRevealed} delay={0.8} color="#ef4444">awkward, shy, or judged</Highlighter> buying in a pharmacy delivered to you discreetly. 
                        </p>



                        {/* How it Works Micro-Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground/80 py-6 border-y border-border/50">
                            <div className="flex flex-col items-center gap-2">
                                <span className="font-bold text-foreground">01</span>
                                <span>Place order anonymously</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="font-bold text-foreground">02</span>
                                <span>Routed to nearest partner</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <span className="font-bold text-foreground">03</span>
                                <span>Delivered fast & discreet</span>
                            </div>
                        </div>



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
                 
                 {/* Socials */}
                 <div className="flex justify-center gap-4 py-2">
                        <a href="https://instagram.com/discreetkit" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                        </a>
                        <a href="https://tiktok.com/@discreetkit" target="_blank" rel="noopener noreferrer" className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-primary hover:text-white transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                        </a>
                 </div>

                 <SuggestionForm />
                 
                 <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="pt-8"
                 >

                    <a 
                        href="https://chat.whatsapp.com/BdMvt9UnLPaAPUe4AexDOJ" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group relative block w-full max-w-sm mx-auto overflow-hidden rounded-xl border border-white/10 p-4 transition-all hover:scale-[1.02]"
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0 z-0">
                            <img 
                                src="/beta-invite.png" 
                                alt="Beta Invite" 
                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/50 transition-colors duration-500" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 flex items-center gap-4">
                            {/* WhatsApp Icon Container */}
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366]/20 backdrop-blur-sm text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-all duration-300">
                                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                            </div>

                            <div className="flex flex-col text-left">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">Private Community</span>
                                <span className="text-sm font-bold text-white shadow-sm">Join our Beta. Build with us, For you.</span>
                            </div>

                             <ArrowRight className="ml-auto w-4 h-4 text-white/50 group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </div>
                    </a>
                 </motion.div>
            </motion.div>
         )}

      </div>
    </div>
  );
}
