"use client";

import { useState, useEffect } from "react";
import { getPharmacyServiceAreas, getPharmacyProfile } from "@/lib/pharmacy-actions";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/components/ui/icon";
import FinancialSettings from "./financial-settings";
import OperationalSettings from "./operational-settings";
import { ServiceAreaMatrix } from "./service-area-matrix";
import { StoreProfileSettings } from "@/components/dashboard/store-profile-settings";
import { NotificationSettings } from "@/components/dashboard/notification-settings";
import { SecuritySettings } from "@/components/dashboard/security-settings";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const NAV_ITEMS = [
    { id: "profile", label: "Store Profile", icon: "storefront" },
    { id: "operational", label: "Dispatch & Zones", icon: "map" },
    { id: "financials", label: "Financial Details", icon: "payments" },
    { id: "notifications", label: "Notifications", icon: "notifications_active" },
    { id: "security", label: "Security", icon: "verified_user" },
];

export default function PharmacySettingsPage() {
    const [activeTab, setActiveTab] = useState("operational");
    const [serviceAreas, setServiceAreas] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const [areas, prof] = await Promise.all([
                    getPharmacyServiceAreas(),
                    getPharmacyProfile()
                ]);
                setServiceAreas(areas);
                setProfile(prof);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-48" />
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-32 rounded-full" />)}
                </div>
                <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tighter">
                        <Icon name="settings" className="text-brand-indigo" fill opticalSize={32} />
                        Settings
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Configure your pharmacy operational parameters and delivery network.</p>
                </div>
            </div>

            {/* Horizontal Rounded Tab Navigation */}
            <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0 scrollbar-hide">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                            "px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2",
                            activeTab === item.id 
                                ? "bg-slate-900 text-white shadow-xl shadow-slate-200/50" 
                                : "bg-slate-100/50 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                        )}
                    >
                        <Icon 
                            name={item.icon} 
                            className={cn(
                                "transition-colors",
                                activeTab === item.id ? "text-brand-indigo" : "text-slate-400 group-hover:text-slate-600"
                            )} 
                            fill={activeTab === item.id}
                            opticalSize={20}
                        />
                        <span className="font-bold">{item.label}</span>
                        {activeTab === item.id && (
                            <Icon name="chevron_right" className="ml-auto text-brand-indigo" opticalSize={16} />
                        )}
                    </button>
                ))}
            </div>

            <div className="min-h-[500px]">
                    {activeTab === "profile" && (
                        <div className="animate-in slide-in-from-right-4 duration-300">
                             <StoreProfileSettings initialProfile={profile} />
                        </div>
                    )}

                    {activeTab === "operational" && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <OperationalSettings initialIs24_7={profile?.is_24_7 || false} />
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <Icon name="map" className="text-brand-teal" opticalSize={24} />
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight">Delivery Network</h2>
                                </div>
                                <ServiceAreaMatrix initialAreas={serviceAreas} />
                            </div>
                        </div>
                    )}

                    {activeTab === "financials" && (
                        <div className="animate-in slide-in-from-right-4 duration-300">
                             <FinancialSettings 
                                initialBankDetails={profile?.bank_details} 
                                initialMomoDetails={profile?.momo_details} 
                             />
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="animate-in slide-in-from-right-4 duration-300">
                             <NotificationSettings initialPreferences={profile?.notification_preferences} />
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="animate-in slide-in-from-right-4 duration-300">
                             <SecuritySettings />
                        </div>
                    )}
            </div>
        </div>
    );
}
