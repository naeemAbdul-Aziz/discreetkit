"use client";

import { useState, useEffect } from "react";
import { getPharmacyServiceAreas, getPharmacyProfile } from "@/lib/pharmacy-actions";
import { Separator } from "@/components/ui/separator";
import { 
    Store, 
    MapPin, 
    ShieldCheck, 
    Clock, 
    Bell, 
    CreditCard,
    ChevronRight,
    Settings2
} from "lucide-react";
import FinancialSettings from "./financial-settings";
import OperationalSettings from "./operational-settings";
import { ServiceAreaMatrix } from "./service-area-matrix";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const NAV_ITEMS = [
    { id: "profile", label: "Store Profile", icon: Store },
    { id: "operational", label: "Dispatch & Zones", icon: MapPin },
    { id: "financials", label: "Financial Details", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: ShieldCheck },
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
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <Settings2 className="h-8 w-8 text-brand-teal" />
                        Command Settings
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
                            "px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2",
                            activeTab === item.id 
                                ? "bg-slate-900 text-white shadow-xl shadow-slate-200/50" 
                                : "bg-slate-100/50 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                        )}
                    >
                        <item.icon className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                        )} />
                        {item.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[500px]">
                    {activeTab === "operational" && (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <OperationalSettings initialIs24_7={profile?.is_24_7 || false} />
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 px-1">
                                    <MapPin className="h-5 w-5 text-brand-teal" />
                                    <h2 className="text-xl font-black text-slate-900">Delivery Network</h2>
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

                    {activeTab === "profile" && (
                        <div className="p-12 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                            <Store className="h-12 w-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">Store Profile</h3>
                            <p className="text-slate-400 max-w-sm mt-2 font-medium">Detailed pharmacy branding and public profile settings coming soon.</p>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="p-12 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                            <Bell className="h-12 w-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">Notifications</h3>
                            <p className="text-slate-400 max-w-sm mt-2 font-medium">Webhook and SMS alert triggers configuration coming soon.</p>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="p-12 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center animate-in fade-in duration-300">
                            <ShieldCheck className="h-12 w-12 text-slate-300 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">Security & Credentials</h3>
                            <p className="text-slate-400 max-w-sm mt-2 font-medium">Access keys and staff role management configuration coming soon.</p>
                        </div>
                    )}
            </div>
        </div>
    );
}
