import { Suspense } from "react";
import { getOperationalLedger } from "@/lib/admin-actions";
import { LedgerTable } from "@/components/dashboard/ledger-table";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Icon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PharmacyLedgerPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
                        Operational Ledger
                    </h1>
                    <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                        <Icon name="verified_user" className="text-emerald-500" opticalSize={16} fill />
                        Confidential audit trail and financial log
                    </p>
                </div>

                <Button className="h-12 px-8 rounded-full bg-brand-indigo hover:bg-brand-indigo/90 text-white font-bold tracking-tight gap-2 shadow-xl shadow-brand-indigo/20">
                    <Icon name="download" opticalSize={18} fill />
                    Export Ledger
                </Button>
            </div>

            <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Icon name="progress_activity" className="text-brand-teal animate-spin" opticalSize={40} />
                    <p className="text-sm font-bold text-slate-400">Syncing unit logs...</p>
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
        .select('*, bank_details, momo_details')
        .eq('user_id', user.id)
        .single();

    if (!pharmacy) return <div className="p-20 text-center font-bold text-slate-400 uppercase tracking-widest">Pharmacy Profile Not Found</div>;

    const entries = await getOperationalLedger(pharmacy.id);
    const hasBank = pharmacy.bank_details && Object.values(pharmacy.bank_details).some(v => v);
    const hasMomo = pharmacy.momo_details && Object.values(pharmacy.momo_details).some(v => v);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2">
                        <Icon name="account_balance_wallet" className="text-brand-indigo" opticalSize={20} fill />
                        <span className="text-xs font-bold text-slate-400">Payout Destination</span>
                    </div>
                    {hasBank ? (
                        <div>
                            <p className="text-sm font-black text-slate-900">{pharmacy.bank_details.bank_name}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{pharmacy.bank_details.account_number}</p>
                        </div>
                    ) : hasMomo ? (
                        <div>
                            <p className="text-sm font-black text-slate-900">{pharmacy.momo_details.network} Cash</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{pharmacy.momo_details.number}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <p className="text-xs font-bold text-rose-500">No payment method configured</p>
                            <Button asChild variant="outline" size="sm" className="h-8 font-bold rounded-full border-rose-100 text-rose-600 hover:bg-rose-50">
                                <a href="/pharmacy/settings">Configure Now</a>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
            
            <LedgerTable entries={entries} showPharmacy={false} />
        </div>
    );
}
