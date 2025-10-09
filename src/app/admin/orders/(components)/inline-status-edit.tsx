/**
 * @file inline-status-edit.tsx
 * @description A component to edit an order's status from within the data table.
 */
'use client';

import * as React from 'react';
import { useTransition } from 'react';
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
import type { OrderStatus } from '@/lib/data';


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

const getStatusStyles = (status: OrderStatus) => {
  switch (status) {
    case 'completed':
      return {
        variant: 'default',
        className: 'bg-success hover:bg-success text-success-foreground border-transparent',
      } as const;
    case 'out_for_delivery':
      return { variant: 'secondary', className: '' } as const;
    case 'processing':
      return { variant: 'accent', className: 'bg-amber-500 text-white border-transparent' } as const;
    case 'received':
       return { variant: 'outline', className: 'text-blue-600 border-blue-300' } as const;
    case 'pending_payment':
      return { variant: 'outline', className: 'text-amber-600 border-amber-300' } as const;
    default:
      return { variant: 'outline', className: '' } as const;
  }
};

export function InlineStatusEdit({ orderId, currentStatus, onUpdate }: InlineStatusEditProps) {
  const [isPending, startTransition] = useTransition();
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
          description: `Order status changed to "${newStatus.replace(/_/g, ' ')}".`,
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

  const currentStyles = getStatusStyles(currentStatus);

  return (
    <div className="flex items-center gap-2">
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Select defaultValue={currentStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px] h-8 text-xs p-2 focus:ring-0 focus:ring-offset-0 border-none shadow-none bg-transparent">
            <SelectValue asChild>
                <Badge variant={currentStyles.variant} className={cn("capitalize", currentStyles.className)}>
                    {currentStatus.replace(/_/g, ' ')}
                </Badge>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {ALL_STATUSES.map((status) => {
              const styles = getStatusStyles(status);
              return (
                <SelectItem key={status} value={status} className="capitalize text-xs">
                   <div className="flex items-center gap-2">
                        <span className={cn("h-2 w-2 rounded-full", styles.variant === 'default' && 'bg-success', styles.variant === 'secondary' && 'bg-secondary', styles.variant === 'accent' && 'bg-amber-500', styles.variant === 'outline' && styles.className.includes('blue') && 'bg-blue-500', styles.variant === 'outline' && styles.className.includes('amber') && 'bg-amber-500')} />
                        {status.replace(/_/g, ' ')}
                   </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
