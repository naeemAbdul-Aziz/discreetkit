'use client';

import { Button } from '@/components/ui/button';
import { useChatbot } from '@/hooks/use-chatbot';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function FloatingChatTrigger() {
  const { setIsOpen, isOpen } = useChatbot();

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3"
        >
          {/* Trust Indicators (Social Proof) */}
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm border border-purple-100 rounded-full py-1.5 px-3 shadow-sm mb-1"
          >
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="h-5 w-5 rounded-full border-2 border-white bg-purple-100 overflow-hidden"
                >
                  <img 
                    src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                    alt="User" 
                    className="h-full w-full object-cover grayscale-[0.5]"
                  />
                </div>
              ))}
            </div>
            <span className="text-[10px] font-medium text-purple-900/80">Trusted by 10k+ Ghanaians</span>
          </motion.div>

          {/* Main Pill Button */}
          <Button
            onClick={() => setIsOpen(true)}
            className={cn(
              "h-12 px-6 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-lg",
              "flex items-center gap-2.5 transition-all duration-300 hover:scale-105 active:scale-95",
              "border border-white/20"
            )}
          >
            <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold tracking-tight">Ask Pacely</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
