'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateOrderStatus } from '@/lib/admin-actions';
import { useToast } from '@/hooks/use-toast';
import { Truck } from 'lucide-react';

interface DeliveryDialogProps {
  orderId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function DeliveryDialog({ orderId, isOpen, onOpenChange, onSuccess }: DeliveryDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [riderName, setRiderName] = useState('');
  const [riderPhone, setRiderPhone] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    setLoading(true);
    try {
      const res = await updateOrderStatus(orderId, 'out_for_delivery', {
        name: riderName,
        phone: riderPhone,
        trackingUrl: trackingUrl
      });

      if (res.error) {
        toast({
          title: 'Error updating order',
          description: res.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Order Out for Delivery',
          description: 'Customer has been notified.',
        });
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong.',
        variant: 'destructive',
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
            Enter the details of the rider picking up this package. This helps track the delivery.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
              {loading ? 'Processing...' : (
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
