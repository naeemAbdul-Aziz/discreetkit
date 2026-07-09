"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DashboardChatbot } from "./dashboard-chatbot";
import { Chatbot } from "./chatbot";
import { useMediaQuery } from "@/hooks/use-media-query";

export function FloatingChatTrigger() {
  const router = useRouter();
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Hide the floating trigger when on dedicated chat or copilot pages
  if (pathname?.startsWith("/chat") || pathname?.endsWith("/copilot")) {
    return null;
  }

  const isAdmin = pathname?.startsWith("/admin");
  const isPharmacy = pathname?.startsWith("/pharmacy");
  const isDashboard = isAdmin || isPharmacy;
  const role = isAdmin ? "admin" : (isPharmacy ? "pharmacy" : undefined);

  const triggerButton = (
    <Button
      className={cn(
        "h-14 rounded-full bg-brand-teal hover:bg-brand-teal/90 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 group pl-2 pr-5 flex items-center gap-3"
      )}
      aria-label="Ask Pacely"
      onClick={() => {
        if (!isDesktop) {
          if (isDashboard) {
            router.push(isAdmin ? '/admin/copilot' : '/pharmacy/copilot');
          } else {
            router.push('/chat');
          }
        }
      }}
    >
      <div className="relative flex h-9 w-9 items-center justify-center rounded-full overflow-hidden shadow-sm border border-white/30 transition-transform duration-300 group-hover:scale-110 bg-white">
        <img src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1765475269/pacely_avator_fb9b17.png" alt="Pacely" className="h-full w-full object-cover" />
      </div>
      <span className="font-semibold text-[13px] tracking-[0.05em] uppercase text-white/90">
        {isDashboard ? "Ask Copilot" : "Ask Pacely"}
      </span>
    </Button>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.8 }}
        className="fixed bottom-6 right-6 z-[100]"
      >
        {isDesktop ? (
          <Dialog>
            <DialogTrigger asChild>
              {triggerButton}
            </DialogTrigger>
            <DialogContent className={cn(
              "max-w-xl h-[640px] flex flex-col p-0 overflow-hidden bg-white rounded-3xl border border-slate-200/50 shadow-2xl",
              !isDashboard && "max-w-lg h-[600px]"
            )}>
              <DialogHeader className="p-6 pb-4 border-b bg-slate-50/50 text-center sm:text-center shrink-0">
                <DialogTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                  {isDashboard 
                    ? (isAdmin ? "Admin Operations" : "Pharmacy Protocol")
                    : "Customer Support Assistant"
                  }
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-hidden relative">
                {isDashboard ? (
                  <DashboardChatbot role={role!} />
                ) : (
                  <Chatbot hideClose={true} />
                )}
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          triggerButton
        )}
      </motion.div>
    </AnimatePresence>
  );
}
