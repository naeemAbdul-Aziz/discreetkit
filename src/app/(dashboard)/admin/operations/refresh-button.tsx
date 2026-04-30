"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2, Zap } from "lucide-react";

export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <Button
      variant="default"
      onClick={handleRefresh}
      disabled={isPending}
      className="bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-widest px-12 rounded-full h-16 shadow-2xl shadow-slate-900/20 transition-none gap-5 border-none"
    >
      {isPending ? (
        <Loader2 className="h-6 w-6 animate-spin text-brand-teal" />
      ) : (
        <Zap className="h-6 w-6 text-brand-teal" />
      )}
      {isPending ? "SYNCHRONIZING_NODES..." : "SYNC_NODE_STATE"}
    </Button>
  );
}
