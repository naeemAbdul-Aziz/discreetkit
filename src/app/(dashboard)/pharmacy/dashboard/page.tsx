import { Suspense } from "react";
import { getPharmacyPulse } from "@/lib/pharmacy-actions";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { PharmacyRealtimeRefresh } from "./pharmacy-realtime-refresh";
import { OrdersList } from "./orders-list";
import { 
    Package, 
    Clock, 
    Truck, 
    Users, 
    TrendingUp, 
    ShieldCheck,
    RefreshCw,
    Activity,
    Terminal,
    ArrowRight,
    Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * FAANG-Level Pharmacy Fulfillment Center
 * Simple, Clean, Professional, No Animations.
 */
export default async function PharmacyDashboardPage() {
  return (
    <Suspense fallback={<DashboardLoadingSkeleton />}>
        <PharmacyDashboardContent />
    </Suspense>
  );
}

async function PharmacyDashboardContent() {
    const { pharmacy, isHub, stats, hubStats, recentOrders } = await getPharmacyPulse();

    return (
        <DashboardShell
            title={pharmacy.name.toUpperCase()}
            subtitle={`Synchronized Node: ${pharmacy.location.toUpperCase()}`}
            headerAction={
                <div className="flex items-center gap-8">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">NODE_STATUS</p>
                        <div className="flex items-center gap-3 mt-3 justify-end">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" />
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-none">SYNCHRONIZED</p>
                        </div>
                    </div>
                    <Button variant="outline" className="h-16 px-12 rounded-full font-black text-[11px] uppercase tracking-widest border-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-none gap-5 shadow-sm">
                        <Zap className="h-5 w-5 text-brand-teal" />
                        SYNC_STATE
                    </Button>
                </div>
            }
        >
            <PharmacyRealtimeRefresh />

            {/* --- OPERATIONAL METRICS --- */}
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                {isHub ? (
                    <>
                        <StatCard title="Patients Enrolled" value={hubStats?.totalEnrolled || 0} icon={Users} description="Active subscriptions" />
                        <StatCard title="Adherence Rate" value={`${hubStats?.adherenceRate || 0}%`} icon={TrendingUp} description="Successful refills" />
                        <StatCard title="Pending Checks" value={recentOrders.filter(o => o.status === 'pending_verification').length} icon={ShieldCheck} description="Identity verification" />
                        <StatCard title="Total Refills" value={stats.completed} icon={Activity} description="Completed cycles" />
                    </>
                ) : (
                    <>
                        <StatCard title="New Orders" value={stats.pending} icon={Package} description="Awaiting confirmation" />
                        <StatCard title="Preparing" value={stats.processing} icon={Clock} description="Being packed" />
                        <StatCard title="Out for Delivery" value={stats.Truck || stats.outForDelivery} icon={Truck} description="In transit to patient" />
                        <StatCard title="Delivered Today" value={stats.completed} icon={ShieldCheck} description="Orders completed" />
                    </>
                )}
            </div>

            {/* --- ACTIVE FULFILLMENT QUEUE --- */}
            <section className="space-y-12 mt-20">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-8">
                        <div className="h-16 w-16 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                            <Terminal className="h-8 w-8 text-brand-teal" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-900 leading-none">
                                ACTIVE_FULFILLMENT_MATRIX
                            </h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Real-time operational stream monitoring</p>
                        </div>
                    </div>
                    <Link href="/pharmacy/ledger">
                        <Button variant="outline" className="h-14 px-10 rounded-full font-black text-[11px] uppercase tracking-widest border-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white transition-none gap-4 shadow-sm">
                            ACCESS_NODE_ARCHIVE
                            <ArrowRight className="h-4 w-4 text-brand-teal" />
                        </Button>
                    </Link>
                </div>

                <div className="rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/5 overflow-hidden transition-none">
                    <OrdersList orders={recentOrders} />
                </div>
            </section>
        </DashboardShell>
    );
}

function DashboardLoadingSkeleton() {
    return (
        <div className="space-y-20">
            <div className="flex justify-between items-center">
                <div className="space-y-5">
                    <Skeleton className="h-14 w-[480px] rounded-full bg-slate-50/50" />
                    <Skeleton className="h-6 w-[320px] rounded-full bg-slate-50/30" />
                </div>
                <Skeleton className="h-16 w-48 rounded-full bg-slate-50/50" />
            </div>
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-56 w-full rounded-3xl bg-slate-50/50" />
                ))}
            </div>
            <div className="space-y-12">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-10 w-[420px] rounded-full bg-slate-50/50" />
                    <Skeleton className="h-10 w-48 rounded-full bg-slate-50/50" />
                </div>
                <Skeleton className="h-[680px] w-full rounded-3xl bg-slate-50/50 shadow-2xl shadow-slate-900/5" />
            </div>
        </div>
    );
}
