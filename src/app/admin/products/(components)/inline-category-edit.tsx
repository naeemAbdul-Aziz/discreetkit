/**
 * @file inline-category-edit.tsx
 * @description A reusable component for editing a product's category in a popover.
 */
'use client';

import * as React from 'react';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { updateProductCategory } from '@/lib/actions';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface InlineCategoryEditProps {
  productId: number;
  value: string;
  onUpdate: () => void;
  allCategories: string[];
}

const getCategoryBadgeVariant = (category: string | null): 'default' | 'secondary' | 'accent' | 'destructive' | 'outline' => {
    if (!category) return 'outline';
    switch (category.toLowerCase()) {
        case 'test kit': return 'default';
        case 'wellness': return 'secondary';
        case 'bundle': return 'accent';
        case 'medication': return 'outline';
        default: return 'outline';
    }
}

export function InlineCategoryEdit({ productId, value, onUpdate, allCategories }: InlineCategoryEditProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = React.useTransition();
  const [currentValue, setCurrentValue] = useState(value);
  const { toast } = useToast();

  const handleSelect = (newCategory: string) => {
    if (newCategory === currentValue) {
        setIsOpen(false);
        return;
    }
    
    startTransition(async () => {
      const result = await updateProductCategory({
        id: productId,
        category: newCategory,
      });

      if (result.success) {
        toast({
          title: 'Update Successful',
          description: `Product category has been updated to "${newCategory}".`,
        });
        setCurrentValue(newCategory);
        onUpdate();
        setIsOpen(false);
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
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={isOpen}
          className="w-[150px] justify-between p-0 hover:bg-transparent"
          disabled={isPending}
        >
            {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Badge variant={getCategoryBadgeVariant(currentValue)} className="text-xs capitalize">
                    {currentValue || "Select category..."}
                </Badge>
            )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search category..." />
          <CommandEmpty>No category found.</CommandEmpty>
          <CommandGroup>
            {allCategories.map((category) => (
              <CommandItem
                key={category}
                value={category}
                onSelect={(selected) => handleSelect(selected)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentValue === category ? "opacity-100" : "opacity-0"
                  )}
                />
                <span className="capitalize">{category}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
