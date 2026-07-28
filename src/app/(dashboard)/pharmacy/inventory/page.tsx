import {
  getPharmacyInventory,
  getPharmacyProductRequests,
} from "@/lib/pharmacy-actions";
import { Icon } from "@/components/ui/icon";
import InventoryClient from "./inventory-client";

export default async function PharmacyInventoryPage() {
  const { products, pharmacyId } = await getPharmacyInventory();
  const requests = await getPharmacyProductRequests();

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
            Inventory
          </h1>
          <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
            <Icon name="inventory_2" className="text-brand-teal" opticalSize={16} fill />
            Manage your product availability and stock levels
          </p>
        </div>
      </div>

      {/* Pass data to client component for interactivity */}
      <InventoryClient
        products={products}
        pharmacyId={pharmacyId}
        requests={requests}
      />
    </div>
  );
}
