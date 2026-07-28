"use client";

import { useState } from "react";
import { updatePharmacyOperationalSettings } from "@/lib/pharmacy-actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface OperationalSettingsProps {
  initialIs24_7: boolean;
  onUpdate?: () => void;
}

export default function OperationalSettings({ initialIs24_7, onUpdate }: OperationalSettingsProps) {
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
                title: "Settings Updated", 
                description: checked ? "Your store is now marked as 24/7." : "Your store is no longer marked as 24/7." 
            });
            onUpdate?.();
        } else {
            setIs24_7(!checked); // Revert
            toast({ variant: "destructive", title: "Error", description: result.message });
        }
    } catch (e) {
        setIs24_7(!checked); // Revert
        toast({ variant: "destructive", title: "Error", description: "Failed to update settings" });
    } finally {
        setLoading(false);
    }
  };

  return (
    <Card className="border border-slate-200 shadow-sm overflow-hidden bg-white">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-teal/10 flex items-center justify-center text-brand-teal">
                <Icon name="schedule" className="text-brand-teal" opticalSize={20} />
            </div>
            <div>
                <CardTitle className="text-lg font-black text-slate-900 leading-tight">Operational Logic</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Configure global store availability and fulfillment rules.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        {/* Availability Group */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <div className="h-1 w-1 rounded-full bg-brand-teal" />
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Availability</h4>
            </div>
            <div className="flex flex-row items-center justify-between rounded-2xl border border-slate-100 p-5 bg-slate-50/30 transition-colors hover:border-brand-teal/20">
                <div className="space-y-1">
                    <Label className="text-[14px] font-bold text-slate-900">24/7 Dispatch Mode</Label>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-sm">
                        Enable this if your staff fulfills orders around the clock. 
                        <span className="block mt-1 text-brand-teal font-bold decoration-brand-teal/30 underline underline-offset-2">Shows &quot;Open Now&quot; 24/7 to customers.</span>
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                    {loading && <Icon name="progress_activity" className="animate-spin text-brand-teal" opticalSize={16} />}
                    <Switch
                        checked={is24_7}
                        onCheckedChange={handleToggle}
                        disabled={loading}
                        className="data-[state=checked]:bg-brand-teal"
                    />
                </div>
            </div>
        </div>

        {/* Global Fulfillment Rules */}
        <div className="space-y-4">
            <div className="flex items-center gap-2 px-1">
                <div className="h-1 w-1 rounded-full bg-brand-teal" />
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Global Routing Rules</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-100 space-y-2 opacity-60 grayscale cursor-not-allowed bg-slate-50/50 group">
                    <Label className="text-xs font-bold text-slate-400 flex items-center justify-between">
                        Fulfillment Buffer
                        <Badge variant="outline" className="text-[9px] font-black uppercase text-slate-400">Enterprise Only</Badge>
                    </Label>
                    <div className="text-[13px] font-bold text-slate-300">15 Minutes</div>
                </div>
                <div className="p-4 rounded-2xl border border-slate-100 space-y-2 opacity-60 grayscale cursor-not-allowed bg-slate-50/50">
                    <Label className="text-xs font-bold text-slate-400 flex items-center justify-between">
                        Operational Currency
                        <Badge variant="outline" className="text-[9px] font-black uppercase text-slate-400">Locked</Badge>
                    </Label>
                    <div className="text-[13px] font-bold text-slate-300 flex items-center gap-2">
                        <span className="w-5 h-3 rounded-sm bg-slate-200" />
                        Ghanaian Cedi (GHS)
                    </div>
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
