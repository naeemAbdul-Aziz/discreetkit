import { getPharmacies, getPharmacyProducts, getPharmacyAnalytics } from "@/lib/admin-actions"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PharmacyInventoryManager } from "./pharmacy-inventory-manager"

interface PharmacyDetailsPageProps {
  params: { id: string }
}

export default async function PharmacyDetailsPage({ params }: PharmacyDetailsPageProps) {
  const pharmacyId = parseInt(params.id)
  
  // Get pharmacy details
  const pharmacies = await getPharmacies()
  const pharmacy = pharmacies.find(p => p.id === pharmacyId)
  
  if (!pharmacy) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/partners">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Partners
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-muted-foreground">Pharmacy not found</h3>
        </div>
      </div>
    )
  }

  // Get pharmacy analytics and products
  const [analytics, products] = await Promise.all([
    getPharmacyAnalytics(pharmacyId),
    getPharmacyProducts(pharmacyId)
  ])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/partners">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Partners
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{pharmacy.name}</h1>
            <p className="text-muted-foreground">{pharmacy.location}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
          <p className="text-2xl font-bold">{analytics.totalOrders}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
          <p className="text-2xl font-bold">GHS {analytics.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Products</h3>
          <p className="text-2xl font-bold">{analytics.productCount}</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Active Products</h3>
          <p className="text-2xl font-bold">
            {products.filter(p => p.is_available).length}
          </p>
        </div>
      </div>

      {/* Inventory Management */}
      <PharmacyInventoryManager 
        pharmacyId={pharmacyId} 
        initialProducts={products}
      />
    </div>
  )
}