import { Suspense } from "react";
import { getCustomers } from "@/lib/admin-actions";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { CustomerTableClient } from "./customer-table-client";
import { Loader2, Users } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * High-Velocity Customer Intelligence (Server-Side Streaming)
 */
export default async function AdminCustomersPage() {
  return (
    <DashboardShell
        title="ENROLLEE_REGISTRY"
        subtitle="Strategic telemetry on user lifecycle & aggregate retention patterns across the global matrix"
        breadcrumbs={[{ label: 'MASTER_CONTROL', href: '/admin' }, { label: 'ENROLLEE_REGISTRY' }]}
    >
        <Suspense fallback={<CustomerSkeleton />}>
            <CustomerLoader />
        </Suspense>
    </DashboardShell>
  );
}

async function CustomerLoader() {
  const customers = await getCustomers();
  return (
    <div className="rounded-[40px] border border-slate-100 bg-white shadow-2xl shadow-slate-900/5 p-12 overflow-hidden transition-none">
        <CustomerTableClient initialCustomers={customers} />
    </div>
  );
}

function CustomerSkeleton() {
  return (
    <div className="p-16 space-y-16 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-900/5">
      <div className="h-16 w-[480px] rounded-full bg-slate-50/50" />
      <div className="space-y-10">
        {[...Array(10)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-full bg-slate-50/30" />
        ))}
      </div>
      <div className="flex flex-col items-center justify-center py-20 gap-10">
        <div className="h-20 w-20 rounded-3xl bg-slate-50/50 flex items-center justify-center">
            <Loader2 className="h-10 w-10 text-brand-teal animate-spin" />
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-300">Synchronizing Identity Telemetry Protocol...</p>
      </div>
    </div>
  );
}