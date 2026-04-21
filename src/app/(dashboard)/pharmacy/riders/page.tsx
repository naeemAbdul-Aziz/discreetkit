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
    <div className="max-w-6xl mx-auto p-4 md:p-12 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-2">
        <div className="space-y-1">
           <h1 className="text-3xl font-bold tracking-tight text-slate-900">Delivery Team</h1>
           <p className="text-slate-500 font-medium text-sm">Manage your delivery riders here.</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="h-11 px-8 rounded-xl bg-brand-indigo hover:bg-brand-indigo/90 font-bold text-sm gap-2 transition-all shadow-sm">
              <Plus className="h-4 w-4" /> Add Rider
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md p-8 rounded-2xl border border-slate-100 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold tracking-tight">Add a new rider</DialogTitle>
              <DialogDescription className="font-medium text-slate-500 pt-1">Register a new rider for your delivery team.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddRider} className="space-y-8 pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Name</Label>
                  <Input
                    placeholder="e.g. Kojo or Bolt Dispatch"
                    value={newRider.name}
                    onChange={(e) => setNewRider({ ...newRider, name: e.target.value })}
                    required
                    className="h-12 border-slate-200 bg-slate-50/30 rounded-xl font-bold focus:ring-brand-indigo"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Phone Number</Label>
                  <Input
                    placeholder="024 XXX XXXX"
                    value={newRider.phone}
                    onChange={(e) => setNewRider({ ...newRider, phone: e.target.value })}
                    required
                    className="h-12 border-slate-200 bg-slate-50/30 rounded-xl font-bold focus:ring-brand-indigo"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={processing} className="w-full h-12 rounded-xl bg-brand-indigo hover:bg-brand-indigo/90 font-bold text-sm">
                   {processing ? "Adding..." : "Add Rider"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {riders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
           <div className="absolute inset-0 bg-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
           <Truck className="h-16 w-16 text-slate-200 mb-6" />
           <h3 className="text-xl font-bold text-slate-900 tracking-tight">No riders yet</h3>
           <p className="text-slate-500 max-w-sm mt-2 font-medium leading-relaxed">
             You haven&apos;t added any riders to your team yet. Add your first rider to start delivering orders.
           </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {riders.map((rider) => (
            <Card key={rider.id} className={cn(
              "group relative overflow-hidden transition-all hover:shadow-sm bg-white border border-slate-100 rounded-2xl p-6 flex flex-col gap-6",
              !rider.is_active && "bg-slate-50 grayscale opacity-80"
            )}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner transition-colors",
                    rider.is_active ? "bg-emerald-50 text-brand-teal" : "bg-slate-200 text-slate-400"
                  )}>
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight leading-none">{rider.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider mt-1.5">
                      <Phone className="h-3 w-3 text-slate-300" /> {rider.phone}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={rider.is_active}
                  onCheckedChange={() => handleToggleStatus(rider.id, rider.is_active)}
                  className="data-[state=checked]:bg-brand-teal scale-75"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="bg-slate-50 p-4 rounded-xl flex flex-col items-center justify-center border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 opacity-60">Deliveries</span>
                    <span className="text-xl font-bold text-slate-900 tabular-nums">{rider.total_deliveries || 0}</span>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-xl flex flex-col items-center justify-center border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1 opacity-60">Status</span>
                    <Badge variant={rider.is_active ? "success" : "neutral"} className="px-3 py-0.5 h-5 font-bold text-[9px] uppercase tracking-tighter rounded-full">
                       {rider.is_active ? "Active" : "Offline"}
                    </Badge>
                 </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                 <Button variant="ghost" className="flex-1 h-10 rounded-xl font-bold text-[10px] uppercase tracking-wider text-slate-400 hover:text-brand-indigo hover:bg-slate-50 transition-all gap-1.5">
                    View Details <ChevronRight className="h-3 w-3" />
                 </Button>
                 <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleDelete(rider.id)}
                  className="h-10 w-10 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all"
                 >
                   <Trash2 className="h-4 w-4" />
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
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 mt-4">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
               <AlertCircle className="h-5 w-5 text-brand-indigo" />
            </div>
            <div className="space-y-1">
               <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Rules for Riders</h4>
               <p className="text-[11px] font-medium text-slate-400 leading-relaxed max-w-xl">
                 Only authorized riders should deliver orders. All interactions are monitored for safety and compliance.
               </p>
            </div>
         </div>

         <div className="flex gap-3">
           <Button variant="ghost" className="text-[10px] font-bold text-white/50 uppercase tracking-wider hover:text-white hover:bg-white/5 px-4 rounded-lg h-9">Rules</Button>
           <Button className="bg-brand-indigo text-white hover:bg-brand-indigo/90 text-[10px] font-bold uppercase tracking-wider px-6 rounded-lg h-9">Get SLA</Button>
         </div>
      </div>
    </div>
  );
}
