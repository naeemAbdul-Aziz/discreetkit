"use client";

import { useState, useEffect } from "react";
import { getPharmacyServiceAreas, getPharmacyProfile } from "@/lib/pharmacy-actions";
import { 
    Store, 
    MapPin, 
    ShieldCheck, 
    Clock, 
    Bell, 
    CreditCard,
    ChevronRight,
    Settings2,
    ShieldAlert,
    Zap,
    Terminal,
    Activity,
    Repeat,
    ArrowRight,
    History,
    Info,
    Shield
} from "lucide-react";
import OperationalSettings from "./operational-settings";
import { ServiceAreaMatrix } from "./service-area-matrix";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const NAV_ITEMS = [
    { id: "operational", label: "OPERATIONAL_MATRIX", icon: MapPin },
    { id: "profile", label: "NODE_PROFILE", icon: Store },
    { id: "notifications", label: "UPLINK_ALERTS", icon: Bell },
    { id: "security", label: "SECURITY_PROTOCOLS", icon: Shield },
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
            <div className="flex flex-col items-center justify-center py-60 gap-10">
                <Skeleton className="h-16 w-[480px] rounded-full bg-slate-50/50" />
                <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-16 w-full">
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 w-full rounded-2xl bg-slate-50/50" />)}
                    </div>
                    <Skeleton className="h-[640px] w-full rounded-3xl bg-slate-50/50 shadow-2xl shadow-slate-900/5" />
                </div>
            </div>
        );
    }

    return (
        <DashboardShell
            title="TERMINAL_CONFIG"
            subtitle="Configure root operational parameters and logistics network synchronization"
            breadcrumbs={[{ label: 'PHARMACY_ROOT', href: '/pharmacy/dashboard' }, { label: 'TERMINAL_CONFIG' }]}
        >
            <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-20 items-start">
                {/* Left Navigation */}
                <nav className="flex flex-col gap-3 sticky top-32 bg-slate-50/50 p-4 rounded-[40px] border border-slate-100 shadow-sm">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "flex items-center gap-6 px-10 py-6 rounded-full text-[11px] font-black uppercase tracking-widest transition-none group border-none outline-none",
                                activeTab === item.id 
                                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/20" 
                                    : "text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-sm"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5",
                                activeTab === item.id ? "text-brand-teal" : "text-slate-300 group-hover:text-slate-400"
                            )} />
                            {item.label}
                            {activeTab === item.id && <ChevronRight className="ml-auto h-4 w-4 text-brand-teal" />}
                        </button>
                    ))}
                </nav>

                {/* Right Content Area */}
                <div className="min-h-[800px]">
                    {activeTab === "operational" && (
                        <div className="space-y-20 animate-none">
                            <OperationalSettings initialIs24_7={profile?.is_24_7 || false} />
                            
                            <div className="space-y-10">
                                <div className="flex items-center gap-5 px-4">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                                        <MapPin className="h-6 w-6 text-brand-teal" />
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">Logistics Matrix</h2>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Defined delivery zones and fulfillment sectors</p>
                                    </div>
                                </div>
                                <div className="rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/5 p-12 overflow-hidden transition-none">
                                    <ServiceAreaMatrix initialAreas={serviceAreas} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "profile" && (
                        <div className="py-60 rounded-[40px] border border-dashed border-slate-100 bg-slate-50/20 flex flex-col items-center justify-center text-center animate-none shadow-sm">
                            <div className="h-32 w-32 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-2xl shadow-slate-900/5 mb-12">
                                <Store className="h-16 w-16 text-slate-100" />
                            </div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Node Profile Registry</h3>
                            <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.25em] mt-6 max-w-sm mx-auto leading-relaxed">
                                Detailed pharmacy branding and public profile synchronization protocols coming soon to the master terminal.
                            </p>
                        </div>
                    )}

                    {activeTab === "notifications" && (
                        <div className="py-60 rounded-[40px] border border-dashed border-slate-100 bg-slate-50/20 flex flex-col items-center justify-center text-center animate-none shadow-sm">
                            <div className="h-32 w-32 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-2xl shadow-slate-900/5 mb-12">
                                <Bell className="h-16 w-16 text-slate-100" />
                            </div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Uplink Alerts</h3>
                            <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.25em] mt-6 max-w-sm mx-auto leading-relaxed">
                                Webhook and encrypted SMS alert trigger configurations are being finalized for high-priority operational streams.
                            </p>
                        </div>
                    )}

                    {activeTab === "security" && (
                        <div className="py-60 rounded-[40px] border border-dashed border-slate-100 bg-slate-50/20 flex flex-col items-center justify-center text-center animate-none shadow-sm">
                            <div className="h-32 w-32 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-2xl shadow-slate-900/5 mb-12">
                                <ShieldCheck className="h-16 w-16 text-slate-100" />
                            </div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Security Protocols</h3>
                            <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.25em] mt-6 max-w-sm mx-auto leading-relaxed">
                                Root access keys and staff role permission matrices are restricted to high-clearance administrators. Synchronization in progress.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardShell>
    );
}
