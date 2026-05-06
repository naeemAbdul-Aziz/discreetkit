import { Suspense } from "react";
import { getRefillSubscriptions, getPharmacies } from "@/lib/admin-actions";
import { RefillsTable } from "./refills-table";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Subscription Refill Management (Server-Side Streaming)
 */
export default async function RefillsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/admin" },
          { label: "Refill Subscriptions" },
        ]}
      />
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 uppercase tracking-widest">
            Refill Management
        </h2>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">
            Strategic prescription verification & subscription assignment
        </p>
      </div>

      <Suspense fallback={<TableSkeleton />}>
        <RefillsLoader />
      </Suspense>
    </div>
  );
}

async function RefillsLoader() {
    const subscriptions = await getRefillSubscriptions();
    return <RefillsTable initialSubscriptions={subscriptions} />;
}

function TableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="h-10 w-full bg-slate-50 animate-pulse rounded-xl" />
            <div className="grid gap-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-20 w-full rounded-2xl bg-slate-50/50" />
                ))}
            </div>
        </div>
    );
}
