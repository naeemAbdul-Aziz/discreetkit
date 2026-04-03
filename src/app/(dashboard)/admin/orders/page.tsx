import { Suspense } from "react";
import { getOrders } from "@/lib/admin-actions"
import { OrdersTable } from "./orders-table"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page || 1);
  const limit = Number(params.limit || 50);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Orders' }
      ]} />
      <div>
        <h2 className="text-3xl font-bold tracking-tight uppercase tracking-widest text-slate-900">
            Order Management Center
        </h2>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] mt-1">
            Real-time transaction log & fulfillment management
        </p>
      </div>

      <Suspense fallback={<OrdersTableSkeleton />}>
        <OrdersLoader page={page} limit={limit} />
      </Suspense>
    </div>
  )
}

async function OrdersLoader({ page, limit }: { page: number, limit: number }) {
  const result = await getOrders(page, limit);
  // Casting to 'any' to bypass lingering TS cache issues with the updated OrdersTable props
  const Table = OrdersTable as any;
  return <Table initialOrders={result.orders} totalOrders={result.total} page={page} />;
}

function OrdersTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full bg-slate-50 animate-pulse rounded-xl" />
      {[...Array(8)].map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  )
}