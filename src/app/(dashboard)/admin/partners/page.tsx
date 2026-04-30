import { Suspense } from "react";
import { getPharmacies } from "@/lib/admin-actions"
import { PartnerTable } from "./partner-table"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * FAANG-Level Node Network Registry
 * Simple, Clean, Professional.
 */
export default async function PartnersPage() {
  return (
    <DashboardShell
        title="NODE_NETWORK"
        subtitle="Operational directory of pharmacy partners & fulfillment nodes across the global matrix"
        breadcrumbs={[{ label: 'MASTER_CONTROL', href: '/admin' }, { label: 'NODE_NETWORK' }]}
    >
      <Suspense fallback={<PartnersTableSkeleton />}>
        <PartnersLoader />
      </Suspense>
    </DashboardShell>
  )
}

async function PartnersLoader() {
  const partners = await getPharmacies();
  return (
    <div className="rounded-[40px] border border-slate-100 bg-white shadow-2xl shadow-slate-900/5 p-12 overflow-hidden transition-none">
        <PartnerTable initialPartners={partners} />
    </div>
  );
}

function PartnersTableSkeleton() {
  return (
    <div className="p-16 space-y-16 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-900/5">
      <div className="flex flex-col md:flex-row gap-10 items-center">
          <Skeleton className="h-16 flex-1 rounded-full bg-slate-50/50" />
          <Skeleton className="h-16 w-64 rounded-full bg-slate-50/50" />
      </div>
      <div className="space-y-10">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-full bg-slate-50/30" />
        ))}
      </div>
    </div>
  );
}
