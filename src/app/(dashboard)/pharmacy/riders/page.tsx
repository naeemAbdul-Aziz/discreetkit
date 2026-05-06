"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Trash2, 
  Truck, 
  Phone, 
  User, 
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Terminal,
  Zap,
  Activity,
  History,
  Repeat,
  ShieldAlert
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

interface Rider {
  id: number;
  pharmacy_id: number;
  name: string;
  phone: string;
  is_active: boolean;
  total_deliveries: number;
  last_active_at: string | null;
  created_at: string;
}

export default function RidersPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [pharmacyId, setPharmacyId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newRider, setNewRider] = useState({ name: "", phone: "" });
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const fetchRiders = useCallback(
    async (pharmId: number) => {
      const supabase = getSupabaseClient();
      try {
        const { data, error } = await supabase
          .from("pharmacy_riders")
          .select("*")
          .eq("pharmacy_id", pharmId)
          .order("is_active", { ascending: false })
          .order("name");

        if (error) throw error;
        setRiders(data || []);
      } catch (error: any) {
        toast({
          title: "PROTOCOL_FAILURE",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    async function init() {
      const supabase = getSupabaseClient();
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: pharmacy } = await supabase
          .from("pharmacies")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (pharmacy) {
          setPharmacyId(pharmacy.id);
          await fetchRiders(pharmacy.id);
        }
      } catch (error) {
        setLoading(false);
      }
    }
    init();
  }, [fetchRiders]);

  async function handleAddRider(e: React.FormEvent) {
    e.preventDefault();
    if (!pharmacyId) return;

    setProcessing(true);
    const supabase = getSupabaseClient();

    try {
      const { error } = await supabase
        .from("pharmacy_riders")
        .insert({
          pharmacy_id: pharmacyId,
          name: newRider.name,
          phone: newRider.phone,
          is_active: true,
        });

      if (error) throw error;

      toast({ 
        title: "REGISTRATION_COMPLETE", 
        description: `${newRider.name.toUpperCase()} provisioned for logistics stream.` 
      });
      setIsAddOpen(false);
      setNewRider({ name: "", phone: "" });
      await fetchRiders(pharmacyId);
    } catch (error: any) {
      toast({ 
        title: "PROTOCOL_FAILURE", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setProcessing(false);
    }
  }

  async function handleDelete(id: number) {
    if (!pharmacyId) return;

    const supabase = getSupabaseClient();
    try {
      const { error } = await supabase
        .from("pharmacy_riders")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "PERSONNEL_DECOMMISSIONED" });
      await fetchRiders(pharmacyId);
    } catch (error: any) {
      toast({ 
        title: "PROTOCOL_FAILURE", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  }

  async function handleToggleStatus(id: number, currentStatus: boolean) {
    if (!pharmacyId) return;

    const supabase = getSupabaseClient();
    try {
      const { error } = await supabase
        .from("pharmacy_riders")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;
      toast({ 
        title: !currentStatus ? "NODE_ACTIVATED" : "NODE_DEACTIVATED",
        description: !currentStatus ? "Personnel synchronized with active fleet." : "Personnel stream unassigned from matrix."
      });
      await fetchRiders(pharmacyId);
    } catch (error: any) {
      toast({ 
        title: "PROTOCOL_FAILURE", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-60 gap-10">
        <Loader2 className="h-16 w-16 text-brand-teal animate-spin" />
        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">SYNCHRONIZING_PERSONNEL_REGISTRY...</p>
      </div>
    );
  }

  return (
    <DashboardShell
        title="DISPATCH_PERSONNEL"
        subtitle="Manage logistics nodes and unbranded delivery fulfillment team"
        breadcrumbs={[{ label: 'PHARMACY_ROOT', href: '/pharmacy/dashboard' }, { label: 'DISPATCH_PERSONNEL' }]}
        headerAction={
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="h-16 px-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-widest gap-5 shadow-2xl shadow-slate-900/20 transition-none border-none">
                  <Plus className="h-6 w-6 text-brand-teal" />
                  REGISTER_NEW_RIDER
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[560px] rounded-[40px] border-none shadow-2xl p-16 bg-white transition-none outline-none">
                <DialogHeader className="space-y-10">
                  <div className="h-20 w-20 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                    <User className="h-10 w-10 text-brand-teal" />
                  </div>
                  <div className="space-y-4">
                    <DialogTitle className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Register Rider</DialogTitle>
                    <DialogDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none mt-2">Add a new unbranded logistics node to your fulfillment unit.</DialogDescription>
                  </div>
                </DialogHeader>
                <form onSubmit={handleAddRider} className="space-y-10 pt-8">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Label className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 pl-6">Personnel Designation</Label>
                      <Input
                        placeholder="E.G. KOJO_NODE_01"
                        value={newRider.name}
                        onChange={(e) => setNewRider({ ...newRider, name: e.target.value })}
                        required
                        className="h-16 border-none bg-slate-50/50 rounded-2xl font-black text-[11px] uppercase tracking-widest px-8 shadow-sm focus-visible:ring-0"
                      />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 pl-6">Secure Comms Number</Label>
                      <Input
                        placeholder="024_000_0000"
                        value={newRider.phone}
                        onChange={(e) => setNewRider({ ...newRider, phone: e.target.value })}
                        required
                        className="h-16 border-none bg-slate-50/30 rounded-2xl font-black text-[11px] uppercase tracking-widest px-8 shadow-sm focus-visible:ring-0 tabular-nums"
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-6 pt-10 border-t border-slate-50">
                    <Button 
                        type="button"
                        variant="ghost"
                        onClick={() => setIsAddOpen(false)}
                        className="w-full h-16 rounded-full font-black text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-none border-none shadow-sm"
                    >
                        ABORT_REGISTRATION
                    </Button>
                    <Button 
                        type="submit" 
                        disabled={processing} 
                        className="bg-slate-900 hover:bg-slate-800 text-white w-full h-16 rounded-full font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-slate-900/30 transition-none border-none gap-5"
                    >
                        {processing ? "SYNCHRONIZING..." : "CONFIRM_REGISTRATION"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        }
    >
      {riders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-80 bg-slate-50/20 rounded-3xl border border-dashed border-slate-100">
           <div className="h-32 w-32 rounded-3xl bg-white border border-slate-100 flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-slate-900/5">
                <Truck className="h-16 w-16 text-slate-100" />
           </div>
           <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">No Active Logistics Nodes</h3>
           <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.25em] mt-6 max-w-md mx-auto leading-relaxed text-center">
             Node registry currently empty. Register dispatch personnel to synchronize with the fulfillment matrix.
           </p>
        </div>
      ) : (
        <div className="rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/5 overflow-hidden transition-none">
          <Table>
            <TableHeader className="bg-slate-50/30 border-b border-slate-50">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 py-10 pl-12">NODE_IDENTITY</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 py-10 text-center">SYNC_STATUS</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 py-10 text-center">FULFILLMENT_YIELD</TableHead>
                <TableHead className="text-right pr-12 text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 py-10">OPERATIONAL_ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riders.map((rider) => (
                <TableRow key={rider.id} className="group border-slate-50 hover:bg-slate-50/30 transition-none">
                  <TableCell className="py-10 pl-12">
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-16 h-16 rounded-3xl flex items-center justify-center shadow-2xl transition-none",
                        rider.is_active ? "bg-slate-900 text-brand-teal shadow-slate-900/10" : "bg-slate-50 text-slate-200 shadow-none border border-slate-100"
                      )}>
                        <User className="h-7 w-7" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="text-lg font-black text-slate-900 tracking-tighter leading-none uppercase">{rider.name}</h3>
                        <div className="flex items-center gap-3">
                            <div className="h-10 px-5 rounded-full bg-slate-50 border border-slate-100 flex items-center gap-3 shadow-sm">
                                <Phone className="h-3.5 w-3.5 text-slate-300" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none tabular-nums">{rider.phone}</span>
                            </div>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-10 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Switch
                        checked={rider.is_active}
                        onCheckedChange={() => handleToggleStatus(rider.id, rider.is_active)}
                        className="data-[state=checked]:bg-brand-teal scale-100 transition-none"
                      />
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest leading-none",
                        rider.is_active ? "text-emerald-500" : "text-slate-300"
                      )}>
                        {rider.is_active ? 'ACTIVE_SYNC' : 'NODE_OFFLINE'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-10 text-center">
                    <div className="inline-flex flex-col items-center gap-2">
                        <span className="text-2xl font-black text-slate-900 tabular-nums tracking-tighter leading-none">{rider.total_deliveries || 0}</span>
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">STREAMS_FINALIZED</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-12 py-10">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(rider.id)}
                      className="h-14 w-14 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl border border-transparent hover:border-rose-100 transition-none shadow-sm"
                    >
                      <Trash2 className="h-6 w-6" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Compliance / Security Section */}
      <div className="bg-slate-900 p-12 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-10 mt-16 shadow-2xl transition-none relative overflow-hidden">
         <div className="absolute top-0 right-0 w-24 h-24 bg-brand-teal/5 rounded-bl-full -mr-12 -mt-12" />
         <div className="flex items-center gap-8">
            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-2xl">
               <ShieldCheck className="h-8 w-8 text-brand-teal" />
            </div>
            <div className="space-y-3">
               <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] leading-none">PRIVACY_PROTOCOL_OMEGA</h4>
               <p className="text-[12px] font-black text-slate-300 leading-relaxed max-w-2xl uppercase tracking-tight">
                 Logistics nodes must adhere to 100% unbranded fulfillment mandates. Operational discretion is mandatory. Terminal interactions are logged for root compliance auditing.
               </p>
            </div>
         </div>
         <Zap className="h-10 w-10 text-brand-teal/20" />
      </div>
    </DashboardShell>
  );
}
