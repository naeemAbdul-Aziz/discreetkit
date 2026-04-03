import { Suspense } from "react";
import { getProducts, getCategories, getProductRequests } from "@/lib/admin-actions"
import { ProductTable } from "./product-table"
import { RequestsTable } from "./requests-table"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * High-Performance Product Matrix (Server-Side Streaming)
 */
export default async function ProductsPage() {
  // Start fetches immediately, but don't await them yet.
  // We'll pass the promises or better, use granular loaders inside Suspense.
  const requestsPromise = getProductRequests();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Products' }
      ]} />
      
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase tracking-widest">
            Inventory Matrix
        </h2>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">
            Global catalog control & partner product requests
        </p>
      </div>

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList className="bg-slate-100 p-1 rounded-full h-10">
          <TabsTrigger value="catalog" className="rounded-full px-6 text-xs data-[state=active]:shadow-sm">
            Product Catalog
          </TabsTrigger>
          <TabsTrigger value="requests" className="rounded-full px-6 text-xs data-[state=active]:shadow-sm">
            Partner Requests
            <Suspense fallback={null}>
                <RequestBadgeCount promise={requestsPromise} />
            </Suspense>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4 pt-4">
            <Suspense fallback={<TableSkeleton />}>
                <CatalogLoader />
            </Suspense>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4 pt-4">
            <Suspense fallback={<TableSkeleton />}>
                <RequestsLoader promise={requestsPromise} />
            </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

async function CatalogLoader() {
    const [products, categories] = await Promise.all([
        getProducts(),
        getCategories()
    ]);
    return <ProductTable initialProducts={products} categories={categories} />;
}

async function RequestsLoader({ promise }: { promise: Promise<any[]> }) {
    const [requests, categories] = await Promise.all([
        promise,
        getCategories()
    ]);
    return <RequestsTable initialRequests={requests} categories={categories} />;
}

async function RequestBadgeCount({ promise }: { promise: Promise<any[]> }) {
    const requests = await promise;
    const pendingCount = requests.filter((r: any) => r.status === 'pending').length;
    if (pendingCount === 0) return null;
    return (
        <span className="ml-2 bg-rose-500 text-white px-2 py-0.5 rounded-full text-[9px] font-black tabular-nums">
            {pendingCount}
        </span>
    );
}

function TableSkeleton() {
    return (
        <div className="space-y-4">
            <div className="h-10 w-full bg-slate-50 animate-pulse rounded-xl" />
            <div className="grid gap-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-16 w-full rounded-2xl" />
                ))}
            </div>
        </div>
    );
}