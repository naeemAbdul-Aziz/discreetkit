"use client";

import { useFormStatus } from "react-dom";
import { addServiceArea } from "@/lib/pharmacy-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { discounts } from "@/lib/data";

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
      // Reset form if possible, workaround for select reset is tough without strict state,
      // but simplistic reset via key or just leaving it is fine for MVP.
      // document.getElementById("add-area-form")?.reset(); // Doesn't reset Select state
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
  }

  return (
    <form action={clientAction} className="space-y-4" id="add-area-form">
      <div>
        <label className="text-sm font-medium">Area Name</label>
        <Select name="areaName" required>
          <SelectTrigger>
            <SelectValue placeholder="Select a campus/area" />
          </SelectTrigger>
          <SelectContent>
            {discounts.map((area) => (
              <SelectItem key={area.id} value={area.campus}>
                {area.campus}
              </SelectItem>
            ))}
            <SelectItem value="Other">Other (Admin Only)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Delivery Fee (GHS)</label>
          <Input
            name="deliveryFee"
            type="number"
            step="0.01"
            placeholder="10.00"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Max Time (Hours)</label>
          <Input
            name="maxDeliveryTime"
            type="number"
            min="1"
            placeholder="24"
            required
          />
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
