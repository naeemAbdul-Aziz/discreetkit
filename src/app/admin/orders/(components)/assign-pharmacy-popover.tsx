/**
 * @file assign-pharmacy-popover.tsx
 * @description A component to assign an order to a pharmacy from within the data table.
 */
'use client';

import * as React from 'react';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';
import { assignOrderToPharmacy } from '@/lib/actions';
import { type Pharmacy } from '@/lib/data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AssignPharmacyPopoverProps {
  orderId: number;
  currentPharmacyId: number | null;
  pharmacies: Pharmacy[];
  onUpdate: () => void;
}

export function AssignPharmacyPopover({ orderId, currentPharmacyId, pharmacies, onUpdate }: AssignPharmacyPopoverProps) {
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = React.useState(false);
  const { toast } = useToast();

  const handleSelect = (pharmacyId: number) => {
    setIsOpen(false);
    if (pharmacyId === currentPharmacyId) return;

    startTransition(async () => {
      const result = await assignOrderToPharmacy({ orderId, pharmacyId });
      if (result.success) {
        toast({
          title: 'Order Assigned',
          description: `Order has been assigned successfully.`,
        });
        onUpdate();
      } else {
        toast({
          variant: 'destructive',
          title: 'Assignment Failed',
          description: result.message,
        });
      }
    });
  };
  
  const currentPharmacyName = pharmacies.find(p => p.id === currentPharmacyId)?.name || 'Unassigned';

  return (
     <div className="flex items-center gap-2">
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
         <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                variant="outline"
                role="combobox"
                aria-expanded={isOpen}
                className="w-[200px] justify-between h-8 text-xs"
                >
                {currentPharmacyName}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search pharmacy..." />
                    <CommandEmpty>No pharmacy found.</CommandEmpty>
                    <CommandGroup>
                        <CommandItem onSelect={() => handleSelect(0)}>Unassign</CommandItem>
                        {pharmacies.map((pharmacy) => (
                        <CommandItem
                            key={pharmacy.id}
                            value={pharmacy.name}
                            onSelect={() => handleSelect(pharmacy.id)}
                        >
                            <Check
                            className={cn(
                                "mr-2 h-4 w-4",
                                currentPharmacyId === pharmacy.id ? "opacity-100" : "opacity-0"
                            )}
                            />
                            {pharmacy.name}
                        </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
      )}
    </div>
  );
}

    