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
import OperationalSettings from "./operational-settings";
import { ServiceAreaMatrix } from "./service-area-matrix";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

const NAV_ITEMS = [
    { id: "profile", label: "Store Profile", icon: Store },
    { id: "operational", label: "Dispatch & Matrix", icon: MapPin },
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
            <div className="max-w-6xl mx-auto py-8 px-4 space-y-6">
                <Skeleton className="h-10 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
                    </div>
                    <Skeleton className="h-[400px] w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <Settings2 className="h-8 w-8 text-brand-teal" />
                        Command Settings
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Configure your pharmacy operational parameters and delivery network.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-10 items-start">
                {/* Left Navigation */}
                <nav className="flex flex-col gap-1 sticky top-24">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all group",
                                activeTab === item.id 
                                    ? "bg-brand-teal text-white shadow-md shadow-brand-teal/20" 
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <item.icon className={cn(
                                "h-4 w-4",
                                activeTab === item.id ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                            )} />
                            {item.label}
                            {activeTab === item.id && <ChevronRight className="ml-auto h-4 w-4 opacity-50" />}
                        </button>
                    ))}
                </nav>

                {/* Right Content Area */}
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
        </div>
    );
}
