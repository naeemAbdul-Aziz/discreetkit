import {
  getPharmacyInventory,
  getPharmacyProductRequests,
} from "@/lib/pharmacy-actions";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import InventoryClient from "./inventory-client";

export default async function PharmacyInventoryPage() {
  const { products, pharmacyId } = await getPharmacyInventory();
  const requests = await getPharmacyProductRequests();

  return (
    <DashboardShell
        title="Inventory Registry"
        subtitle="Manage product availability and operational stock levels"
        breadcrumbs={[{ label: 'PHARMACY_ROOT', href: '/pharmacy/dashboard' }, { label: 'INVENTORY_REGISTRY' }]}
    >
      <InventoryClient
        products={products}
        pharmacyId={pharmacyId}
        requests={requests}
      />
    </DashboardShell>
  );
}
