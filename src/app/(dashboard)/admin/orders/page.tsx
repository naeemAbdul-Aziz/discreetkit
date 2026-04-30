import { Suspense } from "react";
import { getOrders } from "@/lib/admin-actions"
import { OrdersTable } from "./orders-table"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Skeleton } from "@/components/ui/skeleton"
import { Activity, ShieldCheck, Zap, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic"
export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

/**
 * FAANG-Level Order Management Center
 * Focused on operational logistics and fulfillment oversight.
 */
export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 50);

  return (
    <DashboardShell
        title="ORDER_MATRIX"
        subtitle="Operational stream monitoring & global fulfillment oversight across the matrix station"
        breadcrumbs={[{ label: 'MASTER_CONTROL', href: '/admin' }, { label: 'ORDER_MATRIX' }]}
    >
      <Suspense fallback={<OrdersTableSkeleton />}>
        <OrdersLoader page={page} limit={limit} />
      </Suspense>
    </DashboardShell>
  )
}

async function OrdersLoader({ page, limit }: { page: number, limit: number }) {
  const result = await getOrders(page, limit);
  const Table = OrdersTable as any;
  return (
    <div className="rounded-[40px] border border-slate-100 bg-white shadow-2xl shadow-slate-900/5 p-12 overflow-hidden transition-none">
        <Table initialOrders={result.orders} totalOrders={result.total} page={page} />
    </div>
  );
}

function OrdersTableSkeleton() {
  return (
    <div className="p-16 space-y-16 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-900/5">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-12">
          <Skeleton className="h-16 w-full max-w-2xl bg-slate-50/50 rounded-full" />
          <Skeleton className="h-16 w-full xl:w-[600px] bg-slate-50/50 rounded-full" />
      </div>
      <div className="space-y-10">
        {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-full bg-slate-50/30" />
        ))}
      </div>
      <div className="flex flex-col items-center justify-center py-20 gap-10 bg-slate-50/10 rounded-[40px] border border-dashed border-slate-100">
        <div className="h-20 w-20 rounded-3xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
            <Loader2 className="h-10 w-10 text-brand-teal animate-spin" />
        </div>
        <div className="space-y-4 text-center">
            <div className="flex items-center justify-center gap-6">
                <div className="h-3 w-3 rounded-full bg-brand-teal shadow-[0_0_12px_rgba(20,184,166,0.6)]" />
                <p className="text-sm font-black uppercase tracking-[0.3em] text-slate-400">SYNCHRONIZING_MATRIX_PROTOCOL...</p>
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-200">Reconciling global transaction nodes and fulfillment streams across matrix</p>
        </div>
      </div>
    </div>
  )
}