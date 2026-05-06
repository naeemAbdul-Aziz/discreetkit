"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Truck, Activity, ShieldCheck, Zap, Info, Map, Repeat, ShieldAlert } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSupabaseClient } from "@/lib/supabase";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

interface DeliveryDialogProps {
  orderId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeliveryDialog({
  orderId,
  isOpen,
  onOpenChange,
  onSuccess,
}: DeliveryDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");
  const [riders, setRiders] = useState<any[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState<string>("manual");
  const isMobile = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    if (isOpen) {
      const fetchRiders = async () => {
        const supabase = getSupabaseClient();
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            setRiders([]);
            return;
          }

          const { data: pharmacy } = await supabase
            .from("pharmacies")
            .select("id")
            .eq("user_id", user.id)
            .single();

          if (!pharmacy) {
            setRiders([]);
            return;
          }

          const { data, error } = await supabase
            .from("pharmacy_riders")
            .select("*")
            .eq("pharmacy_id", pharmacy.id)
            .eq("is_active", true)
            .order("name");

          if (error) {
            console.error("Error fetching riders:", error);
            setRiders([]);
          } else {
            setRiders(data || []);
          }
        } catch (e) {
          console.error("Unexpected error fetching riders:", e);
          setRiders([]);
        }
      };

      fetchRiders();
    }
  }, [isOpen]);

  const handleRiderSelect = (value: string) => {
    setSelectedRiderId(value);
    if (value === "manual") {
      setRiderName("");
      setRiderPhone("");
    } else {
      const rider = riders.find((r) => r.id.toString() === value);
      if (rider) {
        setRiderName(rider.name);
        setRiderPhone(rider.phone);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/pharmacy/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          status: "out_for_delivery",
          courier_name: riderName,
          courier_phone: riderPhone,
        }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        toast({
          title: "SYNC_FAILURE",
          description: result.error || "Failed to update node registry.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "PROTOCOL_DISPATCH",
          description: "Tracking stream synchronized with logistics node.",
        });
        onOpenChange(false);
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "OPERATIONAL_FAILURE",
        description: "Unexpected terminal failure in dispatch sequence.",
        variant: "destructive",
      });
    } finally {
      if (isOpen) setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-10 pt-8">
      <div className="space-y-4">
        <Label className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 pl-6">Node Selection Protocol</Label>
        <Select value={selectedRiderId} onValueChange={handleRiderSelect}>
          <SelectTrigger className="h-16 rounded-2xl font-black text-[11px] uppercase tracking-widest border-slate-100 bg-slate-50/50 px-8 transition-none shadow-sm focus:ring-0">
            <SelectValue placeholder="SELECT_REGISTERED_NODE" />
          </SelectTrigger>
          <SelectContent className="rounded-3xl shadow-2xl border-none p-3 bg-white transition-none">
            <SelectItem value="manual" className="text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 cursor-pointer focus:bg-slate-50 transition-none">MANUAL_ENTRY</SelectItem>
            {riders.map((r) => (
              <SelectItem key={r.id} value={r.id.toString()} className="text-[11px] font-black uppercase tracking-widest rounded-2xl px-6 py-4 cursor-pointer focus:bg-slate-50 transition-none">
                {r.name.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-8">
          <div className="space-y-4">
            <Label htmlFor="riderName" className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 pl-6">Rider / Logistics Designation</Label>
            <Input
              id="riderName"
              placeholder="E.G. SHAQ_EXPRESS_NODE"
              value={riderName}
              onChange={(e) => setRiderName(e.target.value)}
              required
              className="h-16 rounded-2xl font-black text-[11px] uppercase tracking-widest border-slate-100 bg-slate-50/50 px-8 transition-none shadow-sm focus-visible:ring-0"
            />
          </div>
          <div className="space-y-4">
            <Label htmlFor="riderPhone" className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 pl-6">Secure Comms Number</Label>
            <Input
              id="riderPhone"
              placeholder="024_000_0000"
              value={riderPhone}
              onChange={(e) => setRiderPhone(e.target.value)}
              required
              className="h-16 rounded-2xl font-black text-[11px] uppercase tracking-widest border-slate-100 bg-slate-50/50 px-8 transition-none tabular-nums shadow-sm focus-visible:ring-0"
            />
          </div>
      </div>

      <div className="bg-slate-900 p-10 rounded-3xl border border-slate-800 space-y-5 shadow-2xl transition-none relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-brand-teal/5 rounded-bl-full -mr-10 -mt-10" />
        <div className="flex items-center gap-4">
            <Zap className="h-5 w-5 text-brand-teal" />
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.25em] leading-none">Logistics Synchronization</p>
        </div>
        <p className="text-[12px] text-slate-300 leading-relaxed font-black uppercase tracking-tight">
          A secure tracking protocol will be auto-generated for <span className="text-white">STREAM_#{orderId}</span> and dispatched via encrypted SMS uplink.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 pt-10 border-t border-slate-50">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onOpenChange(false)}
          className="w-full h-16 rounded-full font-black text-[11px] uppercase tracking-widest order-2 sm:order-1 text-slate-400 hover:bg-slate-50 transition-none border-none shadow-sm"
        >
          Cancel_Protocol
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-slate-900 hover:bg-slate-800 text-white w-full h-16 rounded-full font-black text-[11px] uppercase tracking-widest order-1 sm:order-2 shadow-2xl shadow-slate-900/30 transition-none border-none gap-5"
        >
          {loading ? (
            "SYNCHRONIZING..."
          ) : (
            <>
              <ShieldCheck className="h-6 w-6 text-brand-teal" />
              Confirm_Dispatch
            </>
          )}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="h-[95vh] bg-white border-none rounded-t-[40px] transition-none outline-none">
          <div className="flex flex-col h-full w-full max-w-xl mx-auto px-12 pb-16 overflow-y-auto">
            <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-6 mb-10" />
            <DrawerHeader className="px-0 pt-4 text-left shrink-0 space-y-6">
              <div className="h-20 w-20 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                <Truck className="h-10 w-10 text-brand-teal" />
              </div>
              <div className="space-y-4">
                <DrawerTitle className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Logistics Provisioning</DrawerTitle>
                <DrawerDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none mt-2">
                    Map logistics node to active fulfillment stream.
                </DrawerDescription>
              </div>
            </DrawerHeader>
            <div className="flex-1 pb-6">{formContent}</div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] rounded-[40px] border-none shadow-2xl p-16 bg-white transition-none outline-none">
        <DialogHeader className="space-y-10">
          <div className="h-20 w-20 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
            <Truck className="h-10 w-10 text-brand-teal" />
          </div>
          <div className="space-y-4">
            <DialogTitle className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Logistics Provisioning</DialogTitle>
            <DialogDescription className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none mt-2">
                Map logistics node to active fulfillment stream.
            </DialogDescription>
          </div>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
