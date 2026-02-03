"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// NOTE: Use pharmacy API route instead of admin server action
import { useToast } from "@/hooks/use-toast";
import { Truck, Users } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSupabaseClient } from "@/lib/supabase";
import { useMediaQuery } from "@/hooks/use-media-query";

interface DeliveryDialogProps {
  orderId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeliveryDialog({
  orderId,
  isOpen,
  onOpenChange,
  onSuccess,
}: DeliveryDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [riderName, setRiderName] = useState("");
  const [riderPhone, setRiderPhone] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [riders, setRiders] = useState<any[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState<string>("manual");
  const isMobile = useMediaQuery("(max-width: 640px)");

  useEffect(() => {
    if (isOpen) {
      // Fetch riders when dialog opens
      const fetchRiders = async () => {
        const supabase = getSupabaseClient();
        try {
          // Get current user
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) {
            setRiders([]);
            return;
          }

          // Get pharmacy for this user
          const { data: pharmacy } = await supabase
            .from("pharmacies")
            .select("id")
            .eq("user_id", user.id)
            .single();

          if (!pharmacy) {
            setRiders([]);
            return;
          }

          // Fetch riders for this pharmacy
          const { data, error } = await supabase
            .from("pharmacy_riders")
            .select("*")
            .eq("pharmacy_id", pharmacy.id)
            .eq("is_active", true)
            .order("name");

          if (error) {
            console.error("Error fetching riders:", error);
            setRiders([]);
          } else {
            setRiders(data || []);
          }
        } catch (e) {
          console.error("Unexpected error fetching riders:", e);
          setRiders([]);
        }
      };

      fetchRiders();
    }
  }, [isOpen]);

  const handleRiderSelect = (value: string) => {
    setSelectedRiderId(value);
    if (value === "manual") {
      setRiderName("");
      setRiderPhone("");
    } else {
      const rider = riders.find((r) => r.id.toString() === value);
      if (rider) {
        setRiderName(rider.name);
        setRiderPhone(rider.phone);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/pharmacy/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_status",
          status: "out_for_delivery",
          courier_name: riderName,
          courier_phone: riderPhone,
          courier_tracking_url: trackingUrl,
        }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        toast({
          title: "Error updating order",
          description: result.error || "Failed to update order",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Order Out for Delivery",
          description: "Customer has been notified.",
        });
        onOpenChange(false);
        onSuccess(); // Trigger parent refresh or state update
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      if (isOpen) setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label>Select Rider (Optional)</Label>
        <Select value={selectedRiderId} onValueChange={handleRiderSelect}>
          <SelectTrigger className="h-12">
            <SelectValue placeholder="Select a registered rider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Enter Manually</SelectItem>
            {riders.map((r) => (
              <SelectItem key={r.id} value={r.id.toString()}>
                {r.name} ({r.phone})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="riderName">Rider / Service Name</Label>
        <Input
          id="riderName"
          placeholder="e.g. Kojo (Bolt) or ShaQ Express"
          value={riderName}
          onChange={(e) => setRiderName(e.target.value)}
          required
          className="h-12"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="riderPhone">Rider Contact Number</Label>
        <Input
          id="riderPhone"
          placeholder="024..."
          value={riderPhone}
          onChange={(e) => setRiderPhone(e.target.value)}
          required
          className="h-12"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="trackingUrl">Tracking Link (Optional)</Label>
        <Input
          id="trackingUrl"
          placeholder="https://..."
          value={trackingUrl}
          onChange={(e) => setTrackingUrl(e.target.value)}
          className="h-12"
        />
        <p className="text-xs text-muted-foreground">
          If left blank, we&apos;ll auto-generate a tracking link for this
          order.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto order-1 sm:order-2"
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              <Truck className="mr-2 h-4 w-4" />
              Confirm Dispatch
            </>
          )}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Assign Dispatch Rider</SheetTitle>
            <SheetDescription>
              Enter the details of the rider picking up this package. This helps
              track the delivery.
            </SheetDescription>
          </SheetHeader>
          {formContent}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Dispatch Rider</DialogTitle>
          <DialogDescription>
            Enter the details of the rider picking up this package. This helps
            track the delivery.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
