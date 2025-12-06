
"use client";

import { useFormStatus } from "react-dom";
import { addServiceArea } from "@/lib/pharmacy-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      <Plus className="mr-2 h-4 w-4" /> {pending ? "Adding..." : "Add Area"}
    </Button>
  );
}

export default function AddAreaForm() {
  const { toast } = useToast();

  async function clientAction(formData: FormData) {
    const result = await addServiceArea(null, formData);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      // Reset form if needed, though server revalidation handles the list update
      // Ideally we reset the specific inputs, but uncontrolled inputs clear on navigation or manual reset.
      // For now, simpler is fine.
      const form = document.getElementById("add-area-form") as HTMLFormElement;
      form?.reset();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  }

  return (
    <form action={clientAction} className="space-y-4" id="add-area-form">
      <div>
        <label className="text-sm font-medium">Area Name</label>
        <Input name="areaName" placeholder="e.g. East Legon, Campus, Spintex" required />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Delivery Fee (GHS)</label>
          <Input name="deliveryFee" type="number" step="0.01" placeholder="10.00" required />
        </div>
        <div>
          <label className="text-sm font-medium">Max Time (Hours)</label>
          <Input name="maxDeliveryTime" type="number" min="1" placeholder="24" required />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
