import { getProducts, getCategories } from "@/lib/admin-actions"
import { ProductTable } from "./product-table"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories()
  ])

  return (
    <div className="space-y-8">
      <Breadcrumbs items={[
        { label: 'Dashboard', href: '/admin' },
        { label: 'Products' }
      ]} />
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <p className="text-muted-foreground">Manage your product inventory and catalog.</p>
      </div>
      <ProductTable initialProducts={products} categories={categories} />
    </div>
  )
}