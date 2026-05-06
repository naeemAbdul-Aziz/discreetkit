"use client";

import { useEffect, useState } from "react";
import { PharmacyRefillsTable } from "../refills/pharmacy-refills-table";
import { getAssignedSubscriptions } from "@/lib/pharmacy-actions";
import { ShieldCheck, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function VerificationQueuePage() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const subs = await getAssignedSubscriptions();
        // Filter for those needing verification
        const pending = subs.filter((s: any) => !s.prescription_verified || s.status === 'pending_verification');
        setSubscriptions(pending);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-96 rounded-[2rem]" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black tracking-tighter text-slate-900 font-mono uppercase flex items-center gap-3">
          <ShieldCheck className="h-10 w-10 text-brand-teal" />
          Verification Queue
        </h2>
        <p className="text-slate-400 font-black uppercase text-xs tracking-widest">
          Clinical Authorization Required for New Enrollees
        </p>
      </div>

      <Alert className="bg-brand-indigo/5 border-brand-indigo/10 rounded-3xl p-6">
        <Info className="h-5 w-5 text-brand-indigo" />
        <AlertTitle className="text-brand-indigo font-black uppercase tracking-widest text-xs">Clinical Protocol</AlertTitle>
        <AlertDescription className="text-slate-600 font-medium mt-1">
          Please cross-reference the **Hospital Refill Code** with your internal clinical records. Verification is required only for the first refill in the system.
        </AlertDescription>
      </Alert>

      <PharmacyRefillsTable initialSubscriptions={subscriptions} />
    </div>
  );
}
