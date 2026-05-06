"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
    Pill, 
    CalendarClock, 
    Phone, 
    User, 
    ShieldCheck, 
    Terminal, 
    Zap, 
    Activity, 
    History, 
    Repeat, 
    ShieldAlert,
    Clock,
    Info,
    CheckCircle2,
    Calendar,
    ArrowRight,
    Loader2
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { logRefill } from "@/lib/pharmacy-actions";
import { Label } from "@/components/ui/label";
import { usePharmacy } from "@/components/dashboard/pharmacy-context";
import { verifyRefillToken } from "@/lib/hub-actions";
import { cn } from "@/lib/utils";

export function PharmacyRefillsTable({
  initialSubscriptions,
}: {
  initialSubscriptions: any[];
}) {
  const { toast } = useToast();
  const { isHub } = usePharmacy();
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [loggingId, setLoggingId] = useState<string | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  
  const handleLogRefill = async () => {
    if (!loggingId) return;

    const result = await logRefill(loggingId, notes);

    if (result.error) {
      toast({
        title: "PROTOCOL_FAILURE",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "REFILL_LOGGED",
        description: "Inventory updated and next fulfillment stream scheduled.",
      });
      setLoggingId(null);
      setNotes("");
      window.location.reload();
    }
  };

  const handleVerifyToken = async (id: string) => {
    setVerifyingId(id);
    const result = await verifyRefillToken(id);
    setVerifyingId(null);

    if (result.success) {
      toast({
        title: "CLINICAL_VERIFICATION_SUCCESS",
        description: "Patient refill token verified and synchronized.",
      });
      window.location.reload();
    } else {
      toast({
        title: "VERIFICATION_FAILURE",
        description: result.error || "Operational discrepancy detected.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-16">
      <div className="rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/5 overflow-hidden transition-none">
        <Table className="min-w-[1000px]">
          <TableHeader className="bg-slate-50/30 border-b border-slate-50">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 py-10 pl-12">ENROLLEE_IDENTITY</TableHead>
              {isHub && <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 py-10">HOSPITAL_CODE</TableHead>}
              <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 py-10">PAYLOAD_DESIGNATION</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 py-10">NEXT_PULSE</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 py-10">SYNC_STATUS</TableHead>
              <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 py-10 pr-12">OPERATIONAL_ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isHub ? 6 : 5} className="py-60 text-center">
                    <div className="flex flex-col items-center justify-center gap-10">
                        <div className="h-32 w-32 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-2xl shadow-slate-900/5">
                            <ShieldAlert className="h-16 w-16 text-slate-100" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Matrix Registry Nominal</h3>
                            <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.25em] max-w-md mx-auto leading-relaxed">
                                No active refill streams or enrollment protocols detected in the current node sector.
                            </p>
                        </div>
                    </div>
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((sub) => {
                const address = sub.delivery_address || {};
                const contactName = address.fullName || sub.user_name || "ANONYMOUS_ENROLLEE";
                const contactDetail = address.phone || sub.user_email || sub.subscription_code;

                return (
                  <TableRow key={sub.id} className="group border-slate-50 hover:bg-slate-50/30 transition-none">
                    <TableCell className="py-10 pl-12">
                      <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-3xl bg-slate-900 flex items-center justify-center text-brand-teal shadow-2xl shadow-slate-900/10 transition-none">
                          <User className="h-7 w-7" />
                        </div>
                        <div className="space-y-3">
                          <p className="text-lg font-black text-slate-900 tracking-tighter uppercase leading-none">{contactName.toUpperCase()}</p>
                          <div className="h-10 px-5 rounded-full bg-slate-50 border border-slate-100 flex items-center gap-3 shadow-sm">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none tabular-nums">{contactDetail.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    {isHub && (
                      <TableCell className="py-10">
                        <div className="flex items-center gap-3 font-black text-[12px] text-slate-900 uppercase tracking-widest leading-none">
                            <Terminal className="h-5 w-5 text-brand-teal" />
                            {sub.hospital_refill_code || "N/A"}
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="py-10">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm">
                            <Pill className="h-5 w-5" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-base font-black text-slate-900 tracking-tight uppercase leading-none">{sub.product_name.toUpperCase()}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{sub.frequency.toUpperCase()} CYCLE</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-10">
                      <div className="flex items-center gap-4 text-slate-600">
                        <div className="h-10 px-5 rounded-full bg-amber-50 border border-amber-100 flex items-center gap-3 shadow-sm">
                            <CalendarClock className="h-4 w-4 text-amber-500" />
                            <span className="text-[11px] font-black uppercase tracking-widest text-amber-700 leading-none">
                                {sub.next_delivery_date ? format(new Date(sub.next_delivery_date), 'dd MMM yyyy').toUpperCase() : 'PENDING'}
                            </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-10">
                        <div className={cn(
                            "flex items-center gap-3 px-5 py-2 rounded-full shadow-sm w-fit",
                            sub.status === "active" ? "bg-brand-teal/10 text-brand-teal border border-brand-teal/20" : "bg-slate-50 text-slate-400 border border-slate-100"
                        )}>
                            <div className={cn("h-2 w-2 rounded-full", sub.status === "active" ? "bg-brand-teal shadow-[0_0_8px_rgba(20,184,166,0.6)]" : "bg-slate-300")} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{sub.status.toUpperCase()}</span>
                        </div>
                    </TableCell>
                    <TableCell className="py-10 text-right pr-12">
                      <div className="flex items-center justify-end gap-5">
                        {isHub && !sub.prescription_verified && (
                          <Button
                            onClick={() => handleVerifyToken(sub.id)}
                            disabled={verifyingId === sub.id}
                            className="h-14 px-10 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-widest gap-4 shadow-2xl shadow-slate-900/10 transition-none border-none"
                          >
                            {verifyingId === sub.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="h-5 w-5 text-brand-teal" />}
                            VERIFY_NODE
                          </Button>
                        )}
                        <Button
                          onClick={() => setLoggingId(sub.id)}
                          disabled={sub.status !== "active"}
                          className={cn(
                            "h-14 px-10 rounded-full font-black text-[11px] uppercase tracking-widest gap-4 shadow-sm transition-none border-none",
                            sub.status === "active" 
                              ? "bg-slate-900 hover:bg-slate-800 text-white shadow-2xl shadow-slate-900/10" 
                              : "bg-slate-50 text-slate-200 cursor-not-allowed"
                          )}
                        >
                          <Zap className={cn("h-5 w-5", sub.status === "active" ? "text-brand-teal" : "text-slate-100")} />
                          LOG_REFILL
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!loggingId} onOpenChange={(o) => !o && setLoggingId(null)}>
        <DialogContent className="sm:max-w-[560px] rounded-[40px] border-none shadow-2xl p-16 bg-white transition-none outline-none">
          <DialogHeader className="space-y-10">
            <div className="h-20 w-20 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                <Pill className="h-10 w-10 text-brand-teal" />
            </div>
            <div className="space-y-4">
                <DialogTitle className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Log Refill</DialogTitle>
                <DialogDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none mt-2">
                    Confirm enrollment fulfillment. This will synchronize inventory and map the next temporal pulse.
                </DialogDescription>
            </div>
          </DialogHeader>

          <div className="py-10 space-y-8">
            <div className="space-y-4">
              <Label className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 pl-6">Operational Notes (Optional)</Label>
              <Textarea
                placeholder="E.G. PATIENT_COUNSELLING_PROVIDED. BRAND_IDENTITY_SYNCED."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[160px] border-none bg-slate-50/50 rounded-3xl font-black text-[12px] uppercase tracking-widest px-8 py-8 leading-relaxed resize-none shadow-sm focus-visible:ring-0"
              />
            </div>

            <div className="bg-slate-900 p-10 rounded-3xl border border-slate-800 space-y-5 shadow-2xl transition-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-teal/5 rounded-bl-full -mr-10 -mt-10" />
                <div className="flex items-center gap-4">
                    <Zap className="h-5 w-5 text-brand-teal" />
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] leading-none">Registry Synchronization</p>
                </div>
                <p className="text-[12px] text-slate-300 leading-relaxed font-black uppercase tracking-tight">
                    Confirming this refill logs a fiscal event and provisions the next fulfillment stream automatically. Matrix integrity monitored.
                </p>
            </div>
          </div>

          <DialogFooter className="gap-6 pt-10 border-t border-slate-50">
            <Button 
                variant="ghost" 
                onClick={() => setLoggingId(null)}
                className="w-full h-16 rounded-full font-black text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-none border-none shadow-sm"
            >
                ABORT_LOG
            </Button>
            <Button 
                onClick={handleLogRefill}
                className="bg-slate-900 hover:bg-slate-800 text-white w-full h-16 rounded-full font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-slate-900/30 transition-none border-none gap-5"
            >
                <ShieldCheck className="h-6 w-6 text-brand-teal" />
                CONFIRM_REFILL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
