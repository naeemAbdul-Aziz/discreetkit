import { Suspense } from "react";
import { getPharmacies } from "@/lib/admin-actions"
import { PartnerTable } from "./partner-table"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Platinum Performance Partner Matrix (Server-Side Streaming)
 */
export default async function PartnersPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase tracking-widest">
            Partner Network
        </h2>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">
            Managing pharmacy nodes & distributed fulfillment centers
        </p>
      </div>

      <Suspense fallback={<PartnersTableSkeleton />}>
        <PartnersLoader />
      </Suspense>
    </div>
  )
}

async function PartnersLoader() {
  const partners = await getPharmacies();
  return <PartnerTable initialPartners={partners} />;
}

function PartnersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full bg-slate-50 animate-pulse rounded-xl" />
      {[1, 2, 3, 4, 5].map(i => (
        <Skeleton key={i} className="h-20 w-full rounded-2xl" />
      ))}
    </div>
  );
}
