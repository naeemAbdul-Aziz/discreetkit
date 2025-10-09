/**
 * @file inline-status-edit.tsx
 * @description A component to edit an order's status from within the data table.
 */
'use client';

import * as React from 'react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { updateOrderStatus } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

type OrderStatus = 'pending_payment' | 'received' | 'processing' | 'out_for_delivery' | 'completed';

const ALL_STATUSES: OrderStatus[] = [
  'pending_payment',
  'received',
  'processing',
  'out_for_delivery',
  'completed',
];

interface InlineStatusEditProps {
  orderId: number;
  currentStatus: OrderStatus;
  onUpdate: () => void;
}

const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case 'completed':
      return 'default'; // Using 'default' for success (like green)
    case 'out_for_delivery':
      return 'secondary';
    case 'processing':
      return 'accent';
    case 'pending_payment':
    case 'received':
      return 'destructive';
    default:
      return 'outline';
  }
};

export function InlineStatusEdit({ orderId, currentStatus, onUpdate }: InlineStatusEditProps) {
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();

  const handleStatusChange = (newStatus: OrderStatus) => {
    if (newStatus === currentStatus) return;

    startTransition(async () => {
      const result = await updateOrderStatus({
        id: orderId,
        status: newStatus,
      });

      if (result.success) {
        toast({
          title: 'Status Updated',
          description: `Order status changed to "${newStatus.replace('_', ' ')}".`,
        });
        onUpdate();
      } else {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: result.message,
        });
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Select defaultValue={currentStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px] h-8 text-xs p-2 focus:ring-0 focus:ring-offset-0 border-none shadow-none bg-transparent">
            <SelectValue asChild>
                <Badge variant={getStatusBadgeVariant(currentStatus)} className="capitalize">
                    {currentStatus.replace('_', ' ')}
                </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ALL_STATUSES.map((status) => (
              <SelectItem key={status} value={status} className="capitalize text-xs">
                {status.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
