"use client";

import { useState, useEffect } from "react";
import { getPharmacyServiceAreas, getPharmacyProfile } from "@/lib/pharmacy-actions";
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
    const [activeTab, setActiveTab] = useState("profile");
    const [serviceAreas, setServiceAreas] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        load();
    }, []);

    const refetchProfile = async () => {
        try {
            const prof = await getPharmacyProfile();
            setProfile(prof);
        } catch (e) {
            console.error("Error refetching pharmacy profile:", e);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-1000">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-36" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                    {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-10 w-32 rounded-xl" />)}
                </div>
                <Skeleton className="h-[400px] w-full rounded-2xl" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-1000">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
                <p className="text-slate-500 font-medium text-sm flex items-center gap-2">
                    <Icon name="settings" opticalSize={14} />
                    Configure your pharmacy operational parameters and delivery network.
                </p>
            </div>

            {/* Pill-style Tab Navigation */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl overflow-x-auto scrollbar-hide border border-slate-200/40">
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 whitespace-nowrap flex-shrink-0",
                            activeTab === item.id
                                ? "bg-brand-teal text-white shadow-md shadow-brand-teal/20"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                        )}
                    >
                        <Icon
                            name={item.icon}
                            opticalSize={18}
                            className={activeTab === item.id ? "text-white" : "text-slate-500"}
                        />
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Panels */}
            <div className="pt-2">
                {activeTab === "profile" && (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                        <StoreProfileSettings initialProfile={profile} onUpdate={refetchProfile} />
                    </div>
                )}

                {activeTab === "operational" && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <OperationalSettings 
                            initialIs24_7={profile?.is_24_7 || false} 
                            onUpdate={refetchProfile} 
                        />

                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-brand-indigo/10 flex items-center justify-center">
                                    <Icon name="map" opticalSize={20} className="text-brand-indigo" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 tracking-tight">Delivery Network</h2>
                                    <p className="text-xs text-slate-500">Define your dispatch radius and service fees</p>
                                </div>
                            </div>
                            <ServiceAreaMatrix initialAreas={serviceAreas} onUpdate={load} />
                        </div>
                    </div>
                )}

                {activeTab === "financials" && (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                        <FinancialSettings
                            initialBankDetails={profile?.bank_details}
                            initialMomoDetails={profile?.momo_details}
                            onUpdate={refetchProfile}
                        />
                    </div>
                )}

                {activeTab === "notifications" && (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                        <NotificationSettings 
                            initialPreferences={profile?.notification_preferences} 
                            onUpdate={refetchProfile}
                        />
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
