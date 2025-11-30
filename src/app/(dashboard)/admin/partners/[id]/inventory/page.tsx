import { getPharmacyProducts, getPharmacies } from "@/lib/admin-actions"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PharmacyInventoryManager } from "../pharmacy-inventory-manager"
import { notFound } from "next/navigation"

interface PharmacyInventoryPageProps {
  params: { id: string }
}

export default async function PharmacyInventoryPage({ params }: PharmacyInventoryPageProps) {
  const pharmacyId = parseInt(params.id)
  
  // Get pharmacy details for the header
  const pharmacies = await getPharmacies()
  const pharmacy = pharmacies.find(p => p.id === pharmacyId)

  if (!pharmacy) {
    notFound()
  }

  const products = await getPharmacyProducts(pharmacyId)

  return (
    <div className="space-y-8 p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link href={`/admin/partners/${pharmacyId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Partner
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage stock and availability for <span className="font-medium text-foreground">{pharmacy.name}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border shadow-sm p-6">
        <PharmacyInventoryManager 
            pharmacyId={pharmacyId} 
            initialProducts={products}
        />
      </div>
    </div>
  )
}
