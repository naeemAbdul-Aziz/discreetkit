import { getPharmacies } from "@/lib/admin-actions"
import { PartnerTable } from "./partner-table"

export default async function PartnersPage() {
  const partners = await getPharmacies()

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Partners</h2>
        <p className="text-muted-foreground">Manage pharmacy partners and fulfillment centers.</p>
      </div>
      <PartnerTable initialPartners={partners} />
    </div>
  )
}
