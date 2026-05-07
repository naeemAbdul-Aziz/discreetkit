"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import { updateNotificationPreferences } from "@/lib/pharmacy-actions";

interface NotificationSettingsProps {
    initialPreferences: any;
}

export function NotificationSettings({ initialPreferences }: NotificationSettingsProps) {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [preferences, setPreferences] = useState({
        sms_orders: initialPreferences?.sms_orders ?? true,
        email_orders: initialPreferences?.email_orders ?? true,
        low_stock_alerts: initialPreferences?.low_stock_alerts ?? false,
        weekly_reports: initialPreferences?.weekly_reports ?? false,
    });

    const handleToggle = (key: keyof typeof preferences) => {
        setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const result = await updateNotificationPreferences(preferences);
            
            if (result?.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Success",
                    description: "Notification preferences updated successfully."
                });
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "An unexpected error occurred",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                    <Icon name="notifications_active" className="text-brand-indigo" opticalSize={24} />
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Notification Channels</h2>
                        <p className="text-sm font-medium text-slate-500 mt-0.5">Configure how and when you want to be alerted.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-brand-indigo/20 transition-all group">
                        <div className="space-y-1">
                            <Label className="text-base font-bold text-slate-900 group-hover:text-brand-indigo transition-colors">SMS Order Alerts</Label>
                            <p className="text-xs text-slate-500 font-medium">Receive instant text messages for new orders.</p>
                        </div>
                        <Switch 
                            checked={preferences.sms_orders} 
                            onCheckedChange={() => handleToggle('sms_orders')} 
                        />
                    </div>

                    <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-brand-indigo/20 transition-all group">
                        <div className="space-y-1">
                            <Label className="text-base font-bold text-slate-900 group-hover:text-brand-indigo transition-colors">Email Order Alerts</Label>
                            <p className="text-xs text-slate-500 font-medium">Receive detailed email notifications for new orders.</p>
                        </div>
                        <Switch 
                            checked={preferences.email_orders} 
                            onCheckedChange={() => handleToggle('email_orders')} 
                        />
                    </div>

                    <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-brand-indigo/20 transition-all group">
                        <div className="space-y-1">
                            <Label className="text-base font-bold text-slate-900 group-hover:text-brand-indigo transition-colors">Low Stock Warnings</Label>
                            <p className="text-xs text-slate-500 font-medium">Get notified when product inventory falls below threshold.</p>
                        </div>
                        <Switch 
                            checked={preferences.low_stock_alerts} 
                            onCheckedChange={() => handleToggle('low_stock_alerts')} 
                        />
                    </div>

                    <div className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 bg-white shadow-sm hover:border-brand-indigo/20 transition-all group">
                        <div className="space-y-1">
                            <Label className="text-base font-bold text-slate-900 group-hover:text-brand-indigo transition-colors">Weekly Reports</Label>
                            <p className="text-xs text-slate-500 font-medium">Receive a weekly summary of orders and revenue.</p>
                        </div>
                        <Switch 
                            checked={preferences.weekly_reports} 
                            onCheckedChange={() => handleToggle('weekly_reports')} 
                        />
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={isLoading} className="gap-2 bg-brand-indigo hover:bg-brand-indigo/90 text-white rounded-full px-8 h-12 font-bold tracking-tight shadow-lg shadow-brand-indigo/20">
                        {isLoading ? (
                            <Icon name="progress_activity" className="animate-spin" opticalSize={18} />
                        ) : (
                            <Icon name="save" fill opticalSize={18} />
                        )}
                        Save Preferences
                    </Button>
                </div>
            </form>
        </div>
    );
}
