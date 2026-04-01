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

      toast({ title: "Registration Successful", description: `${newRider.name} is now part of your fleet.` });
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
      toast({ title: "Rider Decommissioned" });
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
        <Loader2 className="h-10 w-10 text-brand-teal animate-spin" />
        <p className="text-sm font-black uppercase tracking-widest text-slate-400">Syncing Fleet Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
           <h1 className="text-4xl font-black tracking-tight text-slate-900 font-mono">RIDERS_FLT</h1>
           <p className="text-slate-500 font-bold flex items-center gap-2">
             <ShieldCheck className="h-4 w-4 text-emerald-500" /> Authorized Personnel & Logistics Registry
           </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="h-14 px-8 rounded-2xl bg-brand-teal hover:bg-brand-teal-dark font-black text-sm gap-3 shadow-xl shadow-brand-teal/20">
              <Plus className="h-5 w-5" /> Commission New Rider
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md p-8 rounded-3xl border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black tracking-tight">New Fleet Entry</DialogTitle>
              <DialogDescription className="font-medium text-slate-500">Register a new courier service or individual rider for order assignments.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddRider} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Name / Service Callsign</Label>
                  <Input
                    placeholder="e.g. Kojo or Bolt Dispatch"
                    value={newRider.name}
                    onChange={(e) => setNewRider({ ...newRider, name: e.target.value })}
                    required
                    className="h-12 border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-2">
                   <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Direct Contact</Label>
                  <Input
                    placeholder="024 XXX XXXX"
                    value={newRider.phone}
                    onChange={(e) => setNewRider({ ...newRider, phone: e.target.value })}
                    required
                    className="h-12 border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={processing} className="w-full h-14 rounded-2xl bg-brand-teal hover:bg-brand-teal-dark font-black text-sm">
                   {processing ? "Registering..." : "Initialize Commission"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {riders.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-32 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
           <Truck className="h-20 w-20 text-slate-200 mb-6" />
           <h3 className="text-xl font-bold text-slate-900">Fleet Registry Empty</h3>
           <p className="text-slate-400 max-w-sm mt-2 font-medium">You haven&apos;t commissioned any riders yet. Add your first courier to start dispatching orders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {riders.map((rider) => (
            <Card key={rider.id} className={cn(
              "group relative overflow-hidden transition-all hover:shadow-2xl hover:border-brand-teal/20 bg-white border-slate-100 rounded-[2rem]",
              !rider.is_active && "bg-slate-50 opacity-80"
            )}>
              <div className="p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                      rider.is_active ? "bg-emerald-50 text-emerald-500" : "bg-slate-200 text-slate-400"
                    )}>
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 leading-tight">{rider.name}</h3>
                      <p className="text-sm font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider mt-1">
                        <Phone className="h-3 w-3" /> {rider.phone}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={rider.is_active}
                    onCheckedChange={() => handleToggleStatus(rider.id, rider.is_active)}
                    className="data-[state=checked]:bg-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Deliveries</span>
                      <span className="text-xl font-black text-slate-900">{rider.total_deliveries || 0}</span>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl flex flex-col items-center justify-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
                      <Badge variant={rider.is_active ? "success" : "neutral"} className="px-2 py-0 h-5 font-black text-[9px] uppercase tracking-tighter">
                         {rider.is_active ? "On Call" : "Off Duty"}
                      </Badge>
                   </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                   <Button variant="ghost" className="flex-1 h-12 rounded-xl font-bold text-slate-400 hover:text-slate-900 group-hover:bg-slate-100 transition-all gap-2">
                      Personnel Insights <ChevronRight className="h-4 w-4" />
                   </Button>
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(rider.id)}
                    className="h-12 w-12 rounded-xl text-rose-100 hover:text-rose-600 hover:bg-rose-50 transition-all"
                   >
                     <Trash2 className="h-5 w-5" />
                   </Button>
                </div>
              </div>
              
              {/* Status Indicator Bar */}
              <div className={cn(
                "h-1.5 w-full absolute bottom-0 left-0 transition-all duration-500",
                rider.is_active ? "bg-emerald-500 shadow-[0_-4px_12px_rgba(16,185,129,0.3)]" : "bg-slate-300"
              )} />
            </Card>
          ))}
        </div>
      )}

      {/* Security Notice */}
      <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 flex items-start gap-4">
         <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-600" />
         </div>
         <div className="space-y-1">
            <h4 className="text-sm font-black text-amber-900 uppercase tracking-wider">Fleet Compliance Notice</h4>
            <p className="text-xs font-semibold text-amber-700 leading-relaxed max-w-2xl">
              Ensure all sub-contracted riders are aware of the DiscreetKit delivery protocols. Unauthorized personnel assignment may lead to matrix revocation. 
              Status changes are logged for auditing purposes.
            </p>
         </div>
      </div>
    </div>
  );
}
