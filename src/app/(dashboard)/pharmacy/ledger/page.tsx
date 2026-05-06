import { Suspense } from "react";
import { getOperationalLedger } from "@/lib/admin-actions";
import { LedgerTable } from "@/components/dashboard/ledger-table";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Loader2, Download, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PharmacyLedgerPage() {
    return (
        <div className="max-w-7xl mx-auto p-4 md:p-12 space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase tracking-widest">
                        Operational Ledger
                    </h1>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3" />
                        Confidential Audit Trail & Financial Log
                    </p>
                </div>

                <Button className="h-12 px-6 rounded-2xl bg-brand-teal hover:bg-brand-teal/90 text-white font-black text-xs uppercase tracking-widest gap-2 shadow-xl shadow-brand-teal/20">
                    <Download className="h-4 w-4" />
                    Export Reconciliations
                </Button>
            </div>

            <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="h-10 w-10 text-brand-teal animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing unit logs...</p>
                </div>
            }>
                <PharmacyLedgerLoader />
            </Suspense>
        </div>
    );
}

async function PharmacyLedgerLoader() {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return <div className="p-20 text-center font-bold text-slate-400 uppercase tracking-widest">Unauthorized Access</div>;

    const { data: pharmacy } = await supabase
        .from('pharmacies')
        .select('id')
        .eq('user_id', user.id)
        .single();

    if (!pharmacy) return <div className="p-20 text-center font-bold text-slate-400 uppercase tracking-widest">Pharmacy Profile Not Found</div>;

    const entries = await getOperationalLedger(pharmacy.id);
    return <LedgerTable entries={entries} showPharmacy={false} />;
}
