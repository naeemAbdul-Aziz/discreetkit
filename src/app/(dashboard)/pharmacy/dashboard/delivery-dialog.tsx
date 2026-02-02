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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// NOTE: Use pharmacy API route instead of admin server action
import { useToast } from "@/hooks/use-toast";
import { Truck, Users } from "lucide-react";
import { getMyPharmacyRiders } from "@/lib/admin-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getSupabaseClient } from "@/lib/supabase";

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

  useEffect(() => {
    if (isOpen) {
      // Fetch riders when dialog opens
      const fetchRiders = async () => {
        try {
          const data = await getMyPharmacyRiders();
          setRiders(data || []);
        } catch (e) {
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
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Select Rider (Optional)</Label>
            <Select value={selectedRiderId} onValueChange={handleRiderSelect}>
              <SelectTrigger>
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="trackingUrl">Tracking Link (Optional)</Label>
            <Input
              id="trackingUrl"
              placeholder="https://..."
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              If left blank, we&apos;ll auto-generate a tracking link for this order.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
