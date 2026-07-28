import { Suspense } from "react";
import { getCategories } from "@/lib/admin-actions"
import { CategoryTable } from "./category-table"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Skeleton } from "@/components/ui/skeleton"

export const dynamic = "force-dynamic"
export const revalidate = 0

/**
 * Category Management (Server-Side Streaming)
 */
export default async function CategoriesPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Categories' }
      ]} />
      
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
            Categories
        </h2>
        <p className="text-sm font-medium text-slate-500">
            Organize product categories and catalog structure.
        </p>
      </div>

      <Suspense fallback={<CategoryTableSkeleton />}>
        <CategoriesLoader />
      </Suspense>
    </div>
  )
}

async function CategoriesLoader() {
  const categories = await getCategories();
  return <CategoryTable initialCategories={categories} />;
}

function CategoryTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-full bg-slate-50 animate-pulse rounded-xl" />
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} className="h-16 w-full rounded-2xl bg-slate-50/50" />
      ))}
    </div>
  );
}

