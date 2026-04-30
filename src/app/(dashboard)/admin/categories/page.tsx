import { Suspense } from "react";
import { getCategories } from "@/lib/admin-actions"
import { CategoryTable } from "./category-table"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Skeleton } from "@/components/ui/skeleton"
import { Tag, Activity, Terminal, Loader2 } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * FAANG-Level Classification Grid
 * High-Density Metadata Matrix
 */
export default async function CategoriesPage() {
  return (
    <DashboardShell
        title="CLASSIFICATION_GRID"
        subtitle="Strategic catalog organization & universal metadata control matrix"
        breadcrumbs={[{ label: 'MASTER_CONTROL', href: '/admin' }, { label: 'CLASSIFICATION_GRID' }]}
    >
      <Suspense fallback={<CategoryRegistrySkeleton />}>
        <CategoriesLoader />
      </Suspense>
    </DashboardShell>
  )
}

async function CategoriesLoader() {
  const categories = await getCategories();
  return (
    <div className="rounded-[40px] border border-slate-100 bg-white shadow-2xl shadow-slate-900/5 p-12 overflow-hidden transition-none">
        <div className="flex items-center gap-8 mb-16 px-4">
            <div className="h-16 w-16 rounded-3xl bg-slate-900 flex items-center justify-center shadow-2xl shadow-slate-900/10">
                <Tag className="h-8 w-8 text-brand-teal" />
            </div>
            <div className="space-y-3">
                <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">Category Registry Matrix</h2>
                <div className="flex items-center gap-4">
                    <div className="h-1 w-8 bg-brand-teal rounded-full" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Universal SKU classification & metadata mapping synchronization</p>
                </div>
            </div>
        </div>
        <CategoryTable initialCategories={categories} />
    </div>
  );
}

function CategoryRegistrySkeleton() {
  return (
    <div className="p-16 space-y-16 bg-white rounded-[40px] border border-slate-100 shadow-2xl shadow-slate-900/5">
        <div className="flex flex-col md:flex-row gap-10 items-center justify-between">
            <Skeleton className="h-16 w-[480px] rounded-full bg-slate-50/50" />
            <Skeleton className="h-16 w-64 rounded-full bg-slate-50/50" />
        </div>
        <div className="space-y-10">
            {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-full bg-slate-50/30" />
            ))}
        </div>
        <div className="flex flex-col items-center justify-center py-40 gap-8">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center animate-pulse">
                <Loader2 className="h-10 w-10 text-brand-teal animate-spin" />
            </div>
            <div className="space-y-3 text-center">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] leading-none">SYNCHRONIZING_METADATA_MATRIX</p>
                <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.3em]">Mapping universal classification parameters to master node...</p>
            </div>
        </div>
    </div>
  );
}
