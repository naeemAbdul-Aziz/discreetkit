import { Suspense } from "react";
import { getOperationalLedger } from "@/lib/admin-actions";
import { LedgerTable } from "@/components/dashboard/ledger-table";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminLogsPage() {
    return (
        <DashboardShell
            title="Master Ledger"
            subtitle="Exhaustive audit trail of all transactions, dispensations & logistics"
            breadcrumbs={[
                { label: "Control Center", href: "/admin" },
                { label: "Master Ledger" },
            ]}
            headerAction={
                <Button className="h-11 px-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-sm">
                    <Download className="h-4 w-4" />
                    Export Audit Stream
                </Button>
            }
        >
            <Suspense fallback={
                <div className="flex flex-col items-center justify-center py-40 gap-4">
                    <Loader2 className="h-10 w-10 text-brand-teal animate-spin" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing Ledger Data...</p>
                </div>
            }>
                <LedgerLoader />
            </Suspense>
        </DashboardShell>
    );
}

async function LedgerLoader() {
    const entries = await getOperationalLedger();
    return <LedgerTable entries={entries} />;
}
