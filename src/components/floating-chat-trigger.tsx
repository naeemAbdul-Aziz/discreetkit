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
import { DashboardChatbot } from "./dashboard-chatbot";

export function FloatingChatTrigger() {
  const router = useRouter();
  const pathname = usePathname();

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
        "h-14 rounded-full bg-brand-indigo hover:bg-brand-indigo/90 text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border border-white/10 group pl-2 pr-5 flex items-center gap-3"
      )}
      aria-label="Ask Pacely"
    >
      <div className="relative flex h-8 w-8 items-center justify-center rounded-full overflow-hidden shadow-sm border border-white/20 transition-transform duration-300 group-hover:scale-110">
        <img src="https://res.cloudinary.com/dzfa6wqb8/image/upload/v1765475269/pacely_avator_fb9b17.png" alt="Pacely" className="h-full w-full object-cover bg-white" />
      </div>
      <span className="font-semibold text-sm tracking-wide">
        {isDashboard ? "Ask Copilot" : "Ask pacely"}
      </span>
    </Button>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.8 }}
        className="fixed bottom-6 right-6 z-[100]"
      >
        {isDashboard ? (
          <Sheet>
            <SheetTrigger asChild>
              {triggerButton}
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-6 bg-[#f5f5f1]">
              <SheetHeader>
                <SheetTitle className="text-xl font-bold tracking-tight">
                  {isAdmin ? "Admin Command Center" : "Pharmacy Copilot"}
                </SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-hidden">
                <DashboardChatbot role={role!} />
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          triggerButton
        )}
      </motion.div>
    </AnimatePresence>
  );
}
