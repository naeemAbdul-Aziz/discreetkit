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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2">
        <div className="space-y-1">
           <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Dispatch Personnel</h1>
           <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">Manage your unbranded delivery riders</p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="h-11 px-6 rounded-xl bg-brand-indigo hover:bg-brand-indigo/90 font-bold text-sm gap-2 shadow-sm">
              <Plus className="h-4 w-4" /> Register Rider
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md p-8 rounded-3xl border border-slate-100 shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-black tracking-tight">Register Rider</DialogTitle>
              <DialogDescription className="font-medium text-slate-500 pt-1 text-xs">Add a new unbranded rider to your fulfillment team.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddRider} className="space-y-6 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 pl-1">Name</Label>
                  <Input
                    placeholder="e.g. Kojo or Dispatch Alias"
                    value={newRider.name}
                    onChange={(e) => setNewRider({ ...newRider, name: e.target.value })}
                    required
                    className="h-12 border-slate-200 bg-slate-50/50 rounded-xl font-bold focus:ring-brand-indigo"
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
        <div className="flex flex-col items-center justify-center p-24 text-center bg-white rounded-[2rem] border border-slate-200 shadow-sm">
           <Truck className="h-12 w-12 text-slate-200 mb-4" />
           <h3 className="text-lg font-black text-slate-900 tracking-tight">No riders registered</h3>
           <p className="text-slate-500 max-w-sm mt-2 font-medium text-sm leading-relaxed">
             You haven&apos;t added any personnel to your team. Register a rider to fulfill inbound requests.
           </p>
        </div>
      ) : (
        <Card className="border border-slate-200 shadow-sm overflow-hidden rounded-2xl">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-slate-200">
                <TableHead className="text-[11px] uppercase tracking-widest font-bold text-slate-400 py-4 pl-6">Personnel</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest font-bold text-slate-400 py-4">Status</TableHead>
                <TableHead className="text-[11px] uppercase tracking-widest font-bold text-slate-400 py-4">Deliveries</TableHead>
                <TableHead className="text-right pr-6 text-[11px] uppercase tracking-widest font-bold text-slate-400 py-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {riders.map((rider) => (
                <TableRow key={rider.id} className="transition-colors border-slate-100 hover:bg-slate-50/50">
                  <TableCell className="py-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shadow-inner",
                        rider.is_active ? "bg-emerald-50 text-brand-teal" : "bg-slate-100 text-slate-400"
                      )}>
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{rider.name}</h3>
                        <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
                          {rider.phone}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={rider.is_active}
                        onCheckedChange={() => handleToggleStatus(rider.id, rider.is_active)}
                        className="data-[state=checked]:bg-brand-teal scale-75 m-0"
                      />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {rider.is_active ? 'Active' : 'Offline'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <span className="text-sm font-bold text-slate-900 tabular-nums">{rider.total_deliveries || 0}</span>
                  </TableCell>
                  <TableCell className="text-right pr-6 py-4">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDelete(rider.id)}
                      className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Compliance / Security Section */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 mt-8">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
               <ShieldCheck className="h-5 w-5 text-brand-indigo" />
            </div>
            <div className="space-y-1">
               <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Privacy Protocol</h4>
               <p className="text-[11px] font-medium text-slate-500 leading-relaxed max-w-xl">
                 Riders must use 100% unbranded packaging. All deliveries are strictly confidential. Interactions are monitored for compliance.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
