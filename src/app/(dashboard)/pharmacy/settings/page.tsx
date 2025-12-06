
import { getPharmacyServiceAreas, addServiceArea, removeServiceArea } from "@/lib/pharmacy-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, MapPin } from "lucide-react";
import { revalidatePath } from "next/cache";

import AddAreaForm from "./add-area-form";

export default async function PharmacySettingsPage() {
  const serviceAreas = await getPharmacyServiceAreas();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground">Manage your delivery areas and operational settings.</p>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Add New Area */}
        <Card className="p-6 md:col-span-1 border-none shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Add Delivery Area</h2>
          <AddAreaForm />
        </Card>

        {/* List of Areas */}
        <Card className="p-6 md:col-span-1 border-none shadow-sm">
           <h2 className="text-lg font-semibold mb-4">Current Service Areas</h2>
           {serviceAreas.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">
               <MapPin className="mx-auto h-8 w-8 mb-2 opacity-20" />
               <p>No service areas added yet.</p>
             </div>
           ) : (
             <div className="space-y-3">
               {serviceAreas.map((area: any) => (
                 <div key={area.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-medium">{area.area_name}</div>
                      <div className="text-xs text-muted-foreground">
                        Fee: GHS {Number(area.delivery_fee).toFixed(2)} • Time: {area.max_delivery_time_hours}h
                      </div>
                    </div>
                    <form action={async () => {
                      'use server';
                      await removeServiceArea(area.id);
                    }}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                 </div>
               ))}
             </div>
           )}
        </Card>
      </div>
    </div>
  );
}
