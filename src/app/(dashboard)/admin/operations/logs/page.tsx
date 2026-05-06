import { Suspense } from "react";
import { getOperationalLedger } from "@/lib/admin-actions";
import { LedgerTable } from "@/components/dashboard/ledger-table";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLogsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <Breadcrumbs
                        items={[
                            { label: "Dashboard", href: "/admin" },
                            { label: "Operations", href: "/admin/operations" },
                            { label: "Operational Ledger" },
                        ]}
                    />
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase tracking-widest mt-2">
                        Operational Ledger
                    </h1>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">
                        Exhaustive audit trail of all transactions, dispensations, and logistics.
                    </p>
                </div>

                <Button className="h-12 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest gap-2 shadow-xl shadow-slate-200">
                    <Download className="h-4 w-4" />
                    Export Audit CSV
                </Button>
            </div>

            <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="h-10 w-10 text-brand-indigo animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Compiling exhaustive logs...</p>
                </div>
            }>
                <LedgerLoader />
            </Suspense>
        </div>
    );
}

async function LedgerLoader() {
    const entries = await getOperationalLedger();
    return <LedgerTable entries={entries} />;
}
