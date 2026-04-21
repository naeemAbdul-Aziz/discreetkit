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
import { Pill, CalendarClock, Phone, User, ShieldCheck } from "lucide-react";
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
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Refill Logged",
        description: "Inventory updated and next delivery scheduled.",
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
        title: "Clinical Verification Success",
        description: "The patient's refill token has been verified and active.",
      });
      window.location.reload();
    } else {
      toast({
        title: "Verification Failed",
        description: result.error || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Medication Refills</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Manage recurring prescriptions for your patients.</p>
        </div>
      </div>

      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 py-4">Patient</TableHead>
              {isHub && <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Hospital Code</TableHead>}
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Product</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Next Refill</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</TableHead>
              <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isHub ? 6 : 5} className="h-48 text-center text-slate-400 font-medium">
                  No active refills found.
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((sub) => {
                const address = sub.delivery_address || {};
                const contactName = address.fullName || sub.user_name || "Anonymous";
                const contactDetail = address.phone || sub.user_email || sub.subscription_code;

                return (
                  <TableRow key={sub.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{contactName}</p>
                          <p className="text-[10px] font-medium text-slate-400">{contactDetail}</p>
                        </div>
                      </div>
                    </TableCell>
                    {isHub && (
                      <TableCell>
                        <code className="text-[10px] font-bold px-2 py-1 bg-slate-100 rounded text-slate-600">
                          {sub.hospital_refill_code || "N/A"}
                        </code>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Pill className="h-3.5 w-3.5 text-slate-400" />
                        <div>
                          <p className="text-sm font-bold text-slate-700">{sub.product_name}</p>
                          <p className="text-[10px] font-medium text-slate-400 capitalize">{sub.frequency} Refill</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-slate-600">
                        <CalendarClock className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-sm font-medium">
                          {sub.next_delivery_date ? format(new Date(sub.next_delivery_date), 'MMM d, yyyy') : 'Pending'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={sub.status === "active" ? "success" : "neutral"}
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isHub && !sub.prescription_verified && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-indigo-100 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 gap-2 rounded-xl text-xs font-bold"
                            onClick={() => handleVerifyToken(sub.id)}
                            disabled={verifyingId === sub.id}
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span className="truncate">{verifyingId === sub.id ? "Verifying..." : "Verify Code"}</span>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className={cn(
                            "h-8 gap-2 rounded-xl text-xs font-bold shadow-sm",
                            sub.status === "active" 
                              ? "bg-slate-900 text-white hover:bg-slate-800" 
                              : "bg-slate-100 text-slate-400 cursor-not-allowed"
                          )}
                          onClick={() => setLoggingId(sub.id)}
                          disabled={sub.status !== "active"}
                        >
                          <Pill className="h-3.5 w-3.5" />
                          <span className="truncate text-xs">Log Refill</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
      </Table>

      <Dialog open={!!loggingId} onOpenChange={(o) => !o && setLoggingId(null)} modal={false}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Medication Refill</DialogTitle>
            <DialogDescription>
              Confirm that you are dispensing this refill. This will update
              inventory and schedule the next due date.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Pharmacist Notes (Optional)</Label>
              <Textarea
                placeholder="e.g. Patient counselling provided. Brand changed to X."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setLoggingId(null)}>
              Cancel
            </Button>
            <Button onClick={handleLogRefill}>Confirm Refill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
