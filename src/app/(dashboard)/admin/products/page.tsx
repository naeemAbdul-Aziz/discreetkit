import { Suspense } from "react";
import { getProducts, getCategories, fetchProductRequests } from "@/lib/admin-actions"
import { ProductTable } from "./product-table"
import { RequestsTable } from "./requests-table"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { Package, Activity, Terminal, Zap, ShieldCheck } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Universal Inventory Registry
 * High-Density SKU Management Matrix
 */
export default async function ProductsPage() {
  const requestsPromise = fetchProductRequests();

  return (
    <DashboardShell
        title="INVENTORY_REGISTRY"
        subtitle="Universal SKU management & partner fulfillment synchronization matrix"
        breadcrumbs={[{ label: 'MASTER_CONTROL', href: '/admin' }, { label: 'INVENTORY_REGISTRY' }]}
    >
      <Tabs defaultValue="catalog" className="space-y-16">
        <div className="flex items-center justify-center lg:justify-start px-4">
            <TabsList className="bg-slate-50 p-3 rounded-full h-24 border border-slate-100 gap-4 shadow-sm">
                <TabsTrigger 
                    value="catalog" 
                    className="rounded-full px-16 h-18 font-black text-[13px] uppercase tracking-[0.3em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl shadow-slate-900/10 text-slate-400 transition-none gap-6"
                >
                    <Terminal className="h-6 w-6" />
                    MAIN_CATALOG_REGISTRY
                </TabsTrigger>
                <TabsTrigger 
                    value="requests" 
                    className="rounded-full px-16 h-18 font-black text-[13px] uppercase tracking-[0.3em] data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-2xl shadow-slate-900/10 text-slate-400 transition-none gap-6"
                >
                    <Activity className="h-6 w-6" />
                    NODE_PROVISIONING_STREAMS
                    <Suspense fallback={null}>
                        <RequestBadgeCount promise={requestsPromise} />
                    </Suspense>
                </TabsTrigger>
            </TabsList>
        </div>

        <TabsContent value="catalog" className="outline-none focus-visible:outline-none px-4">
            <Suspense fallback={<TableSkeleton />}>
                <CatalogLoader />
            </Suspense>
        </TabsContent>

        <TabsContent value="requests" className="outline-none focus-visible:outline-none px-4">
            <Suspense fallback={<TableSkeleton />}>
                <RequestsLoader promise={requestsPromise} />
            </Suspense>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}

async function CatalogLoader() {
    const [products, categories] = await Promise.all([
        getProducts(),
        getCategories()
    ]);
    return (
        <div className="rounded-[40px] border border-slate-100 bg-white shadow-2xl shadow-slate-900/5 p-16 overflow-hidden transition-none">
            <div className="flex items-center gap-10 mb-20">
                <div className="h-20 w-20 rounded-[32px] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/20">
                    <Zap className="h-10 w-10 text-brand-teal" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">SKU_MASTER_CATALOG</h2>
                    <div className="flex items-center gap-6">
                        <div className="h-2 w-12 bg-brand-teal rounded-full shadow-[0_0_12px_rgba(20,184,166,0.6)]" />
                        <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Global inventory registry & unit performance matrix synchronization</p>
                    </div>
                </div>
            </div>
            <ProductTable initialProducts={products} categories={categories} />
        </div>
    );
}

async function RequestsLoader({ promise }: { promise: Promise<any[]> }) {
    const [requests, categories] = await Promise.all([
        promise,
        getCategories()
    ]);
    return (
        <div className="rounded-[40px] border border-slate-100 bg-white shadow-2xl shadow-slate-900/5 p-16 overflow-hidden transition-none">
            <div className="flex items-center gap-10 mb-20">
                <div className="h-20 w-20 rounded-[32px] bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/20">
                    <ShieldCheck className="h-10 w-10 text-brand-teal" />
                </div>
                <div className="space-y-4">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">NODE_PROVISIONING_MATRIX</h2>
                    <div className="flex items-center gap-6">
                        <div className="h-2 w-12 bg-brand-teal rounded-full shadow-[0_0_12px_rgba(20,184,166,0.6)]" />
                        <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.4em] leading-none">Partner-initiated SKU proposal streams & operational compliance audit</p>
                    </div>
                </div>
            </div>
            <RequestsTable initialRequests={requests} categories={categories} />
        </div>
    );
}

async function RequestBadgeCount({ promise }: { promise: Promise<any[]> }) {
    const requests = await promise;
    const pendingCount = requests.filter((r: any) => r.status === 'pending').length;
    if (pendingCount === 0) return null;
    return (
        <span className="ml-6 h-10 min-w-[2.5rem] px-4 flex items-center justify-center rounded-full bg-brand-teal text-white text-[12px] font-black shadow-2xl shadow-brand-teal/40 border-none tabular-nums">
            {pendingCount}
        </span>
    );
}

function TableSkeleton() {
    return (
        <div className="p-20 space-y-16 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-900/5 px-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-20 w-[540px] rounded-full bg-slate-50/50" />
                <Skeleton className="h-20 w-64 rounded-full bg-slate-50/50" />
            </div>
            <div className="space-y-10">
                {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-full bg-slate-50/30" />
                ))}
            </div>
        </div>
    );
}