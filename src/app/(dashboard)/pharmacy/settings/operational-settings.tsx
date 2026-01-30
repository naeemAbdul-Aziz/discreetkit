"use client";

import { useState } from "react";
import { updatePharmacyOperationalSettings } from "@/lib/pharmacy-actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
                title: "Settings Updated", 
                description: checked ? "Your store is now marked as 24/7." : "Your store is no longer marked as 24/7." 
            });
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
    <Card className="border-none shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operational Settings
        </CardTitle>
        <CardDescription>
          Manage your store&apos;s operating hours and availability.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
                <Label className="text-base">24/7 Delivery</Label>
                <div className="text-sm text-muted-foreground">
                    Enable this if you operate and deliver round the clock.
                    <br/>
                    <span className="text-xs text-blue-600 bg-blue-50 px-1 rounded mt-1 inline-block">
                      Shows &quot;24/7&quot; badge to customers
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                <Switch
                    checked={is24_7}
                    onCheckedChange={handleToggle}
                    disabled={loading}
                    aria-label="Toggle 24/7 availability"
                />
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
