
import { getPharmacyInventory, toggleProductAvailability } from "@/lib/pharmacy-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Package, Search, AlertCircle } from "lucide-react";
import InventoryClient from "./inventory-client";

export default async function PharmacyInventoryPage() {
  const { products, pharmacyId } = await getPharmacyInventory();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">Manage your product availability and stock levels.</p>
      </div>

      <Separator />

      {/* Pass data to client component for interactivity */}
      <InventoryClient products={products} pharmacyId={pharmacyId} />
    </div>
  );
}
