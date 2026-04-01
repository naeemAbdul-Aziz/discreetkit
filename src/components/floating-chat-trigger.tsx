"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DashboardChatbot } from "./dashboard-chatbot";
import { useMediaQuery } from "@/hooks/use-media-query";

export function FloatingChatTrigger() {
  const router = useRouter();
  const pathname = usePathname();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Hide the floating trigger when already on the dedicated chat page
  if (pathname?.startsWith("/chat")) {
    return null;
  }

  const isAdmin = pathname?.startsWith("/admin");
  const isPharmacy = pathname?.startsWith("/pharmacy");
  const isDashboard = isAdmin || isPharmacy;
  const role = isAdmin ? "admin" : (isPharmacy ? "pharmacy" : undefined);

  const triggerButton = (
    <Button
      onClick={() => {
        if (!isDashboard) router.push('/chat');
      }}
      className={cn(
        "h-14 rounded-full bg-brand-teal hover:bg-brand-teal/90 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20 group pl-2 pr-5 flex items-center gap-3"
      )}
      aria-label="Ask Pacely"
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
        {isDashboard ? (
          isDesktop ? (
            <Dialog>
              <DialogTrigger asChild>
                {triggerButton}
              </DialogTrigger>
              <DialogContent className="max-w-xl h-[640px] flex flex-col p-0 overflow-hidden bg-white rounded-3xl border border-slate-200/50 shadow-xl">
                <DialogHeader className="p-6 pb-4 border-b bg-slate-50/50 text-center sm:text-center">
                  <DialogTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    {isAdmin ? "Admin Operations" : "Pharmacy Protocol"}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-hidden relative">
                  <DashboardChatbot role={role!} />
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Sheet>
              <SheetTrigger asChild>
                {triggerButton}
              </SheetTrigger>
              <SheetContent className="w-full sm:w-[500px] flex flex-col p-0 bg-white border-l border-slate-100">
                <SheetHeader className="p-5 border-b">
                  <SheetTitle className="text-sm font-bold text-slate-900">
                    {isAdmin ? "Admin Command" : "Pharmacy Copilot"}
                  </SheetTitle>
                </SheetHeader>
                <div className="flex-1 overflow-hidden">
                  <DashboardChatbot role={role!} />
                </div>
              </SheetContent>
            </Sheet>
          )
        ) : (
          triggerButton
        )}
      </motion.div>
    </AnimatePresence>
  );
}
