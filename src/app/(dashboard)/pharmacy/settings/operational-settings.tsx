"use client";

import { useState } from "react";
import { updatePharmacyOperationalSettings } from "@/lib/pharmacy-actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Loader2, Zap, Activity, ShieldCheck, Terminal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface OperationalSettingsProps {
  initialIs24_7: boolean;
}

export default function OperationalSettings({ initialIs24_7 }: OperationalSettingsProps) {
  const { toast } = useToast();
  const [is24_7, setIs24_7] = useState(initialIs24_7);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIs24_7(checked); // Optimistic update
    setLoading(true);

    const formData = new FormData();
    formData.append("is_24_7", checked ? "on" : "off");

    try {
        const result = await updatePharmacyOperationalSettings(null, formData);
        if (result.success) {
            toast({ 
                title: "SETTINGS_SYNCHRONIZED", 
                description: checked ? "Operational node marked as 24/7." : "Operational node reverted to standard cycles." 
            });
        } else {
            setIs24_7(!checked); // Revert
            toast({ variant: "destructive", title: "PROTOCOL_FAILURE", description: result.message });
        }
    } catch (e) {
        setIs24_7(!checked); // Revert
        toast({ variant: "destructive", title: "PROTOCOL_FAILURE", description: "Failed to synchronize operational parameters." });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Card className="border border-slate-100 shadow-2xl shadow-slate-900/5 overflow-hidden bg-white rounded-3xl transition-none">
      <CardHeader className="bg-slate-50/30 border-b border-slate-50 p-10">
        <div className="flex items-center gap-5">
            <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                <Clock className="h-6 w-6 text-brand-teal" />
            </div>
            <div className="space-y-1">
                <CardTitle className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Operational Logic</CardTitle>
                <CardDescription className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Configure global node availability and fulfillment protocols.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-10 space-y-12">
        {/* Availability Group */}
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <div className="h-2 w-2 rounded-full bg-brand-teal shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 leading-none">Node_Availability</h4>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-3xl border border-slate-100 p-8 bg-slate-50/20 transition-none group">
                <div className="space-y-3">
                    <Label className="text-base font-black text-slate-900 uppercase tracking-tight leading-none">24/7_Dispatch_Mode</Label>
                    <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest leading-relaxed max-w-xl">
                        Enable this if your staff fulfills orders around the clock. 
                        <span className="block mt-2 text-brand-teal">Node will be flagged as &quot;ACTIVE_STREAM&quot; 24/7 to consumers.</span>
                    </p>
                </div>
                <div className="mt-6 md:mt-0 flex items-center gap-5 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm transition-none">
                    {loading && <Loader2 className="h-5 w-5 animate-spin text-brand-teal" />}
                    <Switch
                        checked={is24_7}
                        onCheckedChange={handleToggle}
                        disabled={loading}
                        className="data-[state=checked]:bg-brand-teal scale-110 transition-none"
                    />
                </div>
            </div>
        </div>

        {/* Global Fulfillment Rules */}
        <div className="space-y-6">
            <div className="flex items-center gap-3 px-2">
                <div className="h-2 w-2 rounded-full bg-slate-300" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 leading-none">Global_Routing_Rules</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 rounded-3xl border border-slate-100 space-y-4 opacity-50 grayscale cursor-not-allowed bg-slate-50/20 transition-none">
                    <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fulfillment_Buffer</Label>
                        <div className="px-3 py-1 rounded-full bg-slate-200 text-slate-400 text-[8px] font-black uppercase tracking-widest">Enterprise_Tier</div>
                    </div>
                    <div className="text-lg font-black text-slate-300 uppercase tracking-tighter tabular-nums leading-none">15_MINUTES</div>
                </div>
                <div className="p-8 rounded-3xl border border-slate-100 space-y-4 opacity-50 grayscale cursor-not-allowed bg-slate-50/20 transition-none">
                    <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational_Currency</Label>
                        <div className="px-3 py-1 rounded-full bg-slate-200 text-slate-400 text-[8px] font-black uppercase tracking-widest">LOCKED</div>
                    </div>
                    <div className="text-lg font-black text-slate-300 flex items-center gap-4 uppercase tracking-tighter leading-none">
                        <div className="w-8 h-5 rounded-md bg-slate-200 shadow-sm" />
                        GHANAIAN_CEDI_(GHS)
                    </div>
                </div>
            </div>
        </div>

        {/* Sync Status Badge */}
        <div className="pt-6 border-t border-slate-50 flex items-center gap-4">
            <ShieldCheck className="h-5 w-5 text-brand-teal" />
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.25em]">Root operational protocols are currently synchronized with master registry.</p>
        </div>
      </CardContent>
    </Card>
  );
}
