import { getProducts, getCategories, getProductRequests } from "@/lib/admin-actions"
import { ProductTable } from "./product-table"
import { RequestsTable } from "./requests-table"
import { Breadcrumbs } from "@/components/ui/breadcrumbs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ProductsPage() {
  const [products, categories, requests] = await Promise.all([
    getProducts(),
    getCategories(),
    getProductRequests()
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

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList>
            <TabsTrigger value="catalog">Product Catalog</TabsTrigger>
            <TabsTrigger value="requests">
                Requests 
                {requests.some((r: any) => r.status === 'pending') && (
                    <span className="ml-2 bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full text-xs font-semibold">
                        {requests.filter((r: any) => r.status === 'pending').length}
                    </span>
                )}
            </TabsTrigger>
        </TabsList>
        <TabsContent value="catalog" className="space-y-4">
            <ProductTable initialProducts={products} categories={categories} />
        </TabsContent>
        <TabsContent value="requests" className="space-y-4">
            <RequestsTable initialRequests={requests} categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  )
}