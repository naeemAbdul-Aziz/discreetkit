import { getCategories } from "@/lib/admin-actions"
import { CategoryTable } from "./category-table"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Categories' }
      ]} />
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Categories</h2>
        <p className="text-muted-foreground">Manage product categories for your catalog.</p>
      </div>
      <CategoryTable initialCategories={categories} />
    </div>
  )
}
