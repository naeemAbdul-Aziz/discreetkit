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
  Loader2
} from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
          title: "Network Error",
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

      toast({ title: "Registration Successful", description: `${newRider.name} is now part of your unit.` });
      setIsAddOpen(false);
      setNewRider({ name: "", phone: "" });
      await fetchRiders(pharmacyId);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
      toast({ title: "Personnel Removed" });
      await fetchRiders(pharmacyId);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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
      toast({ title: !currentStatus ? "Personnel Activated" : "Personnel Deactivated" });
      await fetchRiders(pharmacyId);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 gap-4">
        <Loader2 className="h-10 w-10 text-brand-indigo animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Syncing Registry...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-12 space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2">
        <div className="space-y-2">
           <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Logistics Registry</h1>
           <p className="text-slate-500 font-medium flex items-center gap-2">
             <ShieldCheck className="h-4 w-4 text-brand-indigo" /> 
             <span className="uppercase tracking-widest text-[10px] font-black text-brand-indigo">Authorized Personnel & Asset-Light Fleet</span>
           </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="h-12 px-8 rounded-xl bg-brand-indigo hover:bg-brand-indigo/90 font-black text-sm gap-3 transition-all hover:scale-[1.02] shadow-sm">
              <Plus className="h-4 w-4" /> Commission New Unit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-extrabold tracking-tight">New Fleet Entry</DialogTitle>
              <DialogDescription className="font-semibold text-slate-400 pt-1">Register a new courier service or individual rider for order assignments.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddRider} className="space-y-8 pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Identified Name / Callsign</Label>
                  <Input
                    placeholder="e.g. Kojo or Bolt Dispatch"
                    value={newRider.name}
                    onChange={(e) => setNewRider({ ...newRider, name: e.target.value })}
                    required
                    className="h-14 border-slate-200 bg-slate-50/30 rounded-2xl font-bold focus:ring-brand-indigo"
                  />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Direct Operational Contact</Label>
                  <Input
                    placeholder="024 XXX XXXX"
                    value={newRider.phone}
                    onChange={(e) => setNewRider({ ...newRider, phone: e.target.value })}
                    required
                    className="h-14 border-slate-200 bg-slate-50/30 rounded-2xl font-bold focus:ring-brand-indigo"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={processing} className="w-full h-14 rounded-2xl bg-brand-indigo hover:bg-brand-indigo/90 font-black text-sm">
                   {processing ? "Registering..." : "Initialize Commission"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {riders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="absolute inset-0 bg-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
           <img 
             src="/fleet_empty_state.png" 
             alt="Empty Registry" 
             className="h-56 w-auto mb-8 opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 hover:scale-105" 
           />
           <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Fleet Command Silent</h3>
           <p className="text-slate-400 max-w-sm mt-3 font-semibold leading-relaxed">
             You haven&apos;t commissioned any riders yet. Add your first courier to start dispatching orders through the DiscreetKit system.
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {riders.map((rider) => (
            <Card key={rider.id} className={cn(
              "group relative overflow-hidden transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white border border-slate-100 rounded-[2.5rem] p-7 flex flex-col gap-8",
              !rider.is_active && "bg-slate-50/80 grayscale opacity-80"
            )}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-5">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-colors",
                    rider.is_active ? "bg-emerald-50 text-brand-teal" : "bg-slate-200 text-slate-400"
                  )}>
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 tracking-tighter leading-none">{rider.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 flex items-center gap-2 uppercase tracking-[0.1em] mt-2">
                      <Phone className="h-3 w-3 text-slate-300" /> {rider.phone}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={rider.is_active}
                  onCheckedChange={() => handleToggleStatus(rider.id, rider.is_active)}
                  className="data-[state=checked]:bg-brand-teal"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50/50 p-5 rounded-3xl flex flex-col items-center justify-center border border-slate-100/50">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-60">Deliveries</span>
                    <span className="text-2xl font-black text-slate-900 tabular-nums">{rider.total_deliveries || 0}</span>
                 </div>
                 <div className="bg-slate-50/50 p-5 rounded-3xl flex flex-col items-center justify-center border border-slate-100/50">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-60">Operational Status</span>
                    <Badge variant={rider.is_active ? "success" : "neutral"} className="px-3 py-0.5 h-6 font-black text-[9px] uppercase tracking-tighter rounded-full">
                       {rider.is_active ? "Ready" : "Offline"}
                    </Badge>
                 </div>
              </div>

              <div className="flex items-center gap-3 mt-2">
                 <Button variant="ghost" className="flex-1 h-12 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-brand-indigo hover:bg-slate-50 transition-all gap-2">
                    Unit Intelligence <ChevronRight className="h-4 w-4" />
                 </Button>
                 <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(rider.id)}
                  className="h-12 w-12 rounded-2xl text-rose-50 hover:text-rose-600 hover:bg-rose-50 transition-all"
                 >
                   <Trash2 className="h-5 w-5" />
                 </Button>
              </div>
              
              {/* Status Indicator Bar */}
              <div className={cn(
                "h-2 w-full absolute bottom-0 left-0 transition-all duration-700",
                rider.is_active ? "bg-brand-teal shadow-[0_-4px_12px_rgba(13,148,136,0.2)]" : "bg-slate-200"
              )} />
            </Card>
          ))}
        </div>
      )}

      {/* Compliance / Security Section */}
      <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 mt-4 overflow-hidden relative group">
         <div className="absolute top-0 right-0 w-64 h-64 bg-brand-indigo/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-brand-indigo/20 transition-all duration-1000" />
         
         <div className="flex items-center gap-6 relative z-10">
           <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-inner">
              <AlertCircle className="h-6 w-6 text-brand-indigo" />
           </div>
           <div className="space-y-1">
              <h4 className="text-xs font-black text-white uppercase tracking-widest">Fleet Operations Protocol</h4>
              <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-xl">
                Unauthorized personnel assignment may lead to account revocation. All courier interactions are strictly monitored for partner compliance and security integrity.
              </p>
           </div>
         </div>

         <div className="flex gap-4 relative z-10">
           <Button variant="ghost" className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white hover:bg-white/5 px-6 rounded-xl">Review Guidelines</Button>
           <Button className="bg-brand-indigo text-white hover:bg-brand-indigo/90 text-[10px] font-black uppercase tracking-widest px-8 rounded-xl h-11">Download SLA</Button>
         </div>
      </div>
    </div>
  );
}
