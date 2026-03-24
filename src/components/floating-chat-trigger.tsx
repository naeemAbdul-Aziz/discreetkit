"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

const AbstractIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 2" opacity="0.3" />
    <circle cx="12" cy="12" r="3.5" fill="currentColor" />
    <circle cx="12" cy="4" r="1.5" fill="currentColor" />
    <circle cx="12" cy="20" r="1.5" fill="currentColor" />
    <circle cx="4" cy="12" r="1.5" fill="currentColor" />
    <circle cx="20" cy="12" r="1.5" fill="currentColor" />
    <circle cx="6.34" cy="6.34" r="1.2" fill="currentColor" />
    <circle cx="17.66" cy="17.66" r="1.2" fill="currentColor" />
    <circle cx="6.34" cy="17.66" r="1.2" fill="currentColor" />
    <circle cx="17.66" cy="6.34" r="1.2" fill="currentColor" />
  </svg>
);

export function FloatingChatTrigger() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide the floating trigger when already on the dedicated chat page
  if (pathname?.startsWith("/chat")) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          className="fixed bottom-6 right-6 z-[100]"
        >
          <Button
            onClick={() => router.push('/chat')}
            className={cn(
              "h-14 rounded-full bg-brand-indigo hover:opacity-90 text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-white/10 group pl-2 pr-5 flex items-center gap-3"
            )}
            aria-label="Ask Pacely"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full overflow-hidden shadow-sm border border-white/20 transition-transform duration-300 group-hover:scale-110">
              <img src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1765475269/pacely_avator_fb9b17.png" alt="Pacely" className="h-full w-full object-cover bg-white" />
            </div>
            <span className="font-semibold text-sm tracking-wide">Ask pacely</span>
          </Button>
        </motion.div>
    </AnimatePresence>
  );
}
