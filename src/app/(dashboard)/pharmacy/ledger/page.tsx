import { Suspense } from "react";
import { getOperationalLedger } from "@/lib/admin-actions";
import { LedgerTable } from "@/components/dashboard/ledger-table";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Download, ShieldCheck, Zap, History, Clock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PharmacyLedgerPage() {
    return (
        <DashboardShell
            title="OPERATIONAL_ARCHIVE"
            subtitle="Confidential audit trail & financial synchronization log"
            breadcrumbs={[{ label: 'PHARMACY_ROOT', href: '/pharmacy/dashboard' }, { label: 'OPERATIONAL_ARCHIVE' }]}
            headerAction={
                <Button className="h-16 px-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-[11px] uppercase tracking-widest gap-5 shadow-2xl shadow-slate-900/20 transition-none border-none">
                    <Download className="h-5 w-5 text-brand-teal" />
                    EXPORT_LEDGER_DATA
                </Button>
            }
        >
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-60 gap-10 bg-slate-50/10 rounded-3xl border border-dashed border-slate-100">
                    <div className="flex items-center gap-6">
                        <div className="h-3 w-3 rounded-full bg-brand-teal shadow-[0_0_12px_rgba(20,184,166,0.6)]" />
                        <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">SYNCHRONIZING_ARCHIVE_DATA...</p>
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-200">Reconciling historical node telemetry and fiscal logs</p>
                </div>
            }>
                <PharmacyLedgerLoader />
            </Suspense>
        </DashboardShell>
    );
}

async function PharmacyLedgerLoader() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return (
        <div className="flex flex-col items-center justify-center py-80 gap-12 bg-rose-50/10 rounded-3xl border border-dashed border-rose-100">
            <div className="h-32 w-32 rounded-3xl bg-white border border-rose-100 flex items-center justify-center shadow-2xl shadow-rose-500/5">
                <ShieldAlert className="h-16 w-16 text-rose-500" />
            </div>
            <div className="text-center space-y-4">
                <p className="text-sm font-black text-rose-500 uppercase tracking-widest leading-none">PROTOCOL_FAILURE: UNAUTHORIZED</p>
                <p className="text-[11px] font-black text-rose-200 uppercase tracking-[0.25em]">Unauthorized terminal access detected. Protocol aborted.</p>
            </div>
        </div>
    );

    const { data: pharmacy } = await supabase
        .from('pharmacies')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!pharmacy) return (
        <div className="flex flex-col items-center justify-center py-80 gap-12 bg-slate-50/20 rounded-3xl border border-dashed border-slate-100">
            <div className="h-32 w-32 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-2xl shadow-slate-900/5">
                <History className="h-16 w-16 text-slate-100" />
            </div>
            <div className="text-center space-y-4">
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest leading-none">REGISTRY_FAILURE: NODE_MISSING</p>
                <p className="text-[11px] font-black text-slate-200 uppercase tracking-[0.25em]">Node registry identity not found in master directory.</p>
            </div>
        </div>
    );

    const entries = await getOperationalLedger(pharmacy.id);
    return (
        <div className="rounded-3xl border border-slate-100 bg-white shadow-2xl shadow-slate-900/5 overflow-hidden transition-none p-12">
            <LedgerTable entries={entries} showPharmacy={false} hideControls />
        </div>
    );
}
