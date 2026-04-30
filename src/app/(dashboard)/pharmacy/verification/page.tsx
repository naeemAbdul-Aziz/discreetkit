"use client";

import { useEffect, useState } from "react";
import { PharmacyRefillsTable } from "../refills/pharmacy-refills-table";
import { getAssignedSubscriptions } from "@/lib/pharmacy-actions";
import { ShieldCheck, Info, Zap, Terminal, Activity, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { cn } from "@/lib/utils";

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
      <div className="flex flex-col items-center justify-center py-60 gap-10">
        <Skeleton className="h-16 w-[480px] rounded-full bg-slate-50/50" />
        <Skeleton className="h-[640px] w-full rounded-3xl bg-slate-50/50 shadow-2xl shadow-slate-900/5" />
      </div>
    );
  }

  return (
    <DashboardShell
        title="VERIFICATION_QUEUE"
        subtitle="Clinical authorization required for new fulfillment enrollees"
        breadcrumbs={[{ label: 'PHARMACY_ROOT', href: '/pharmacy/dashboard' }, { label: 'VERIFICATION_QUEUE' }]}
    >
      <div className="space-y-16">
        <div className="bg-slate-900 p-12 rounded-3xl border border-slate-800 flex items-start gap-8 shadow-2xl transition-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-teal/5 rounded-bl-full -mr-12 -mt-12" />
            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-2xl">
                <Info className="h-8 w-8 text-brand-teal" />
            </div>
            <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 leading-none">CLINICAL_PROTOCOL_ALPHA</h4>
                <p className="text-[12px] font-black text-slate-300 leading-relaxed max-w-3xl uppercase tracking-tight">
                    Cross-reference the <span className="text-white">HOSPITAL_REFILL_CODE</span> with internal clinical records. Verification is required exclusively for the primary enrollment refill in the system.
                </p>
            </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/5 overflow-hidden transition-none">
            <PharmacyRefillsTable initialSubscriptions={subscriptions} />
        </div>
      </div>
    </DashboardShell>
  );
}
