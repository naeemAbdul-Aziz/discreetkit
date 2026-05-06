import { getPharmacyProducts, getPharmacies } from "@/lib/admin-actions"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { PharmacyInventoryManager } from "../pharmacy-inventory-manager"
import { notFound } from "next/navigation"
import { ShieldCheck, Package, Network, Zap } from "lucide-react"

export const dynamic = "force-dynamic";

interface PharmacyInventoryPageProps {
  params: Promise<{ id: string }>
}

export default async function PharmacyInventoryPage(props: PharmacyInventoryPageProps) {
  const params = await props.params;
  const pharmacyId = parseInt(params.id)

  const pharmacies = await getPharmacies()
  const pharmacy = pharmacies.find(p => p.id === pharmacyId)

  if (!pharmacy) {
    notFound()
  }

  const products = await getPharmacyProducts(pharmacyId)

  return (
    <DashboardShell
        title="Inventory Terminal"
        subtitle={`Real-time SKU synchronization & stock availability for ${pharmacy.name}`}
        breadcrumbs={[
            { label: 'Control Center', href: '/admin' },
            { label: 'Partners', href: '/admin/partners' },
            { label: 'Node Details', href: `/admin/partners/${pharmacyId}` },
            { label: 'Inventory Terminal' }
        ]}
    >
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-10">
        <div className="flex items-center gap-4 mb-12">
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
            </div>
            <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Registry Controller</h3>
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">Direct management of operational inventory states</p>
            </div>
        </div>
        <PharmacyInventoryManager 
            pharmacyId={pharmacyId} 
            initialProducts={products}
        />
      </div>
    </DashboardShell>
  )
}
